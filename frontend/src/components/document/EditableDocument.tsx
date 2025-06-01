import React, { useState, useEffect, useCallback } from 'react';
import RichTextEditor from '../editor/RichTextEditor';
import debounce from 'lodash.debounce';

const OLD_LOCAL_STORAGE_KEY = 'autoSavedDocumentContent';
const VERSIONS_LOCAL_STORAGE_KEY = 'documentVersions_localStorage';
const SAVE_DEBOUNCE_MS = 2500; // 2.5 seconds
const MAX_VERSIONS = 10;

interface Version {
  timestamp: number;
  content: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'restored';

const EditableDocument: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<string>('');
  const [lastSavedContent, setLastSavedContent] = useState<string>(''); // Tracks the content of the latest saved version
  const [versions, setVersions] = useState<Version[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const editorRef = React.useRef<any>(null); // To imperatively set editor content if needed
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading-pdf' | 'downloading-docx' | 'pdf-error' | 'docx-error' | 'docx-queued'>('idle');

  // Load versions from localStorage on mount
  useEffect(() => {
    try {
      // Migration from old single key
      const oldSavedContent = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
      let loadedVersions: Version[] = [];

      const versionsJson = localStorage.getItem(VERSIONS_LOCAL_STORAGE_KEY);
      if (versionsJson) {
        loadedVersions = JSON.parse(versionsJson);
      }

      if (oldSavedContent) {
        if (!loadedVersions.find(v => v.content === oldSavedContent)) {
          loadedVersions.unshift({ timestamp: Date.now() - MAX_VERSIONS * 60000, content: oldSavedContent }); // Assume old content is older
          loadedVersions = loadedVersions.slice(0, MAX_VERSIONS);
          localStorage.setItem(VERSIONS_LOCAL_STORAGE_KEY, JSON.stringify(loadedVersions));
        }
        localStorage.removeItem(OLD_LOCAL_STORAGE_KEY);
      }
      
      setVersions(loadedVersions);
      if (loadedVersions.length > 0) {
        const latestVersion = loadedVersions[0];
        setCurrentContent(latestVersion.content);
        setLastSavedContent(latestVersion.content);
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Failed to load versions from localStorage:', error);
      setSaveStatus('error');
    }
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (contentToSave: string) => {
      if (contentToSave === lastSavedContent && versions.length > 0 && versions[0].content === contentToSave) {
        if (saveStatus === 'saving') setSaveStatus('saved');
        return;
      }
      setSaveStatus('saving');
      try {
        const newVersion: Version = { timestamp: Date.now(), content: contentToSave };
        const updatedVersions = [newVersion, ...versions].slice(0, MAX_VERSIONS);
        localStorage.setItem(VERSIONS_LOCAL_STORAGE_KEY, JSON.stringify(updatedVersions));
        
        setVersions(updatedVersions);
        setLastSavedContent(contentToSave);
        setSaveStatus('saved');
        console.log('Content auto-saved as new version to localStorage');
      } catch (error) {
        console.error('Failed to auto-save content to localStorage:', error);
        setSaveStatus('error');
      }
    }, SAVE_DEBOUNCE_MS),
    [versions, lastSavedContent, saveStatus]
  );

  const handleEditorChange = (newContent: string, editor?: any) => {
    if (editorRef.current === null && editor) {
        editorRef.current = editor;
    }
    setCurrentContent(newContent);
    setIsDirty(newContent !== lastSavedContent);
    if (newContent !== lastSavedContent) {
      setSaveStatus('idle');
      debouncedSave(newContent);
    }
  };
  
  useEffect(() => {
    setIsDirty(currentContent !== lastSavedContent);
  }, [currentContent, lastSavedContent]);

  const handleRestoreVersion = (versionToRestore: Version) => {
    setCurrentContent(versionToRestore.content);
    // TinyMCE's Editor component controlled by `initialValue` might not re-render if key doesn't change.
    // Or, if we had a direct way to set content:
    if (editorRef.current) {
        editorRef.current.setContent(versionToRestore.content);
    }
    setLastSavedContent(versionToRestore.content); // Consider if restoring should immediately mark as "saved" or "dirty"
    setSaveStatus('restored');
    setIsDirty(false); // After restoring, it's no longer "dirty" with respect to the restored version
    // Optionally, save this restoration as a new version immediately or on next change
    // For simplicity, current auto-save will pick it up on next change.
  };

  const getStatusMessage = (): string => {
    if (saveStatus === 'restored') return `Restored version from ${new Date(versions.find(v => v.content === currentContent)?.timestamp || Date.now()).toLocaleString()}`;
    if (isDirty && saveStatus === 'idle') return 'Unsaved changes';
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'All changes saved';
      case 'error':
        return 'Error saving content';
      case 'idle':
      default:
        return versions.length > 0 && versions[0].content === currentContent ? 'All changes saved' : 'Ready';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!currentContent) {
      alert('There is no content to download.');
      setDownloadStatus('idle');
      return;
    }

    if (format === 'pdf') {
      setDownloadStatus('downloading-pdf');
      try {
        const response = await fetch('/api/documents/raw-pdf', { // Assuming backend is on the same origin or proxied
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ htmlContent: currentContent, filename: 'document_export' }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Extract filename from Content-Disposition header if available
        const disposition = response.headers.get('Content-Disposition');
        let downloadFilename = 'document_export.pdf';
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                downloadFilename = matches[1].replace(/['"]/g, '');
            }
        }
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setDownloadStatus('idle');
      } catch (error) {
        console.error('Failed to download PDF:', error);
        setDownloadStatus('pdf-error');
        setTimeout(() => { if (downloadStatus === 'pdf-error') setDownloadStatus('idle'); }, 5000);
      }
    } else if (format === 'docx') {
      setDownloadStatus('downloading-docx');
      try {
        // Simple transformation: use a default title and treat entire HTML as one section
        // For DOCX, content might need to be plain text or further processed if HTML is complex.
        // A more robust solution would parse HTML to a structure the docx library can better handle,
        // or use a server-side HTML-to-DOCX converter.
        // For now, sending raw HTML as content of a single section.
        const policyData = {
          title: 'Exported Document',
          sections: [{ title: 'Main Content', content: currentContent }],
        };

        const response = await fetch('/api/documents/policy/docx', { // Assuming backend is on the same origin or proxied
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(policyData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error during DOCX queuing.' }));
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
        }
        
        // const result = await response.json(); // Contains jobId etc.
        setDownloadStatus('docx-queued');
        // console.log('DOCX generation queued:', result);
        setTimeout(() => {
            if (downloadStatus === 'docx-queued') setDownloadStatus('idle');
        }, 5000);

      } catch (error) {
        console.error('Failed to queue DOCX generation:', error);
        setDownloadStatus('docx-error');
        setTimeout(() => { if (downloadStatus === 'docx-error') setDownloadStatus('idle'); }, 5000);
      }
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 3 }}>
        <h2>Editable Document with Auto-Save & Versioning</h2>
        <div style={{ marginBottom: '10px', fontStyle: 'italic' }}>
          Status: {getStatusMessage()}
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{ marginLeft: '10px' }}
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            style={{ marginLeft: '10px' }}
            disabled={downloadStatus === 'downloading-pdf' || downloadStatus === 'downloading-docx'}
          >
            {downloadStatus === 'downloading-pdf' ? 'Downloading PDF...' : 'Download as PDF'}
          </button>
          <button
            onClick={() => handleDownload('docx')}
            style={{ marginLeft: '10px' }}
            disabled={downloadStatus === 'downloading-docx' || downloadStatus === 'downloading-pdf'}
          >
            {downloadStatus === 'downloading-docx' ? 'Generating DOCX...' : 'Download as DOCX'}
          </button>
        </div>
        {downloadStatus === 'pdf-error' && <div style={{ color: 'red', marginBottom: '10px' }}>Error downloading PDF. Please try again.</div>}
        {downloadStatus === 'docx-error' && <div style={{ color: 'red', marginBottom: '10px' }}>Error queuing DOCX generation. Please try again.</div>}
        {downloadStatus === 'docx-queued' && <div style={{ color: 'blue', marginBottom: '10px' }}>DOCX generation has been queued. You will be notified when it's ready (feature not yet implemented).</div>}
        <RichTextEditor
          // To ensure TinyMCE re-initializes with new content when restored:
          // Pass a key that changes when content is programmatically set outside of its own onChange
          key={currentContent} // This forces re-render but might be too aggressive / lose editor state.
                               // A better approach might be an imperative setContent if available and stable.
                               // For now, relying on initialValue and hoping for the best on restore.
                               // The editorRef.current.setContent above is an attempt for more direct control.
          initialValue={currentContent}
          onEditorChange={handleEditorChange}
        />
        <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#555' }}>
          Content is auto-saved to your browser's local storage with version history (max {MAX_VERSIONS} versions).
        </p>
      </div>

      <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h4>Version History</h4>
        {versions.length === 0 ? (
          <p>No versions saved yet.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {versions.map((version, index) => (
              <li key={version.timestamp} style={{ marginBottom: '10px', padding: '5px', border: '1px solid #eee' }}>
                <div>Saved: {formatTimestamp(version.timestamp)} {index === 0 && '(Latest)'}</div>
                <button onClick={() => handleRestoreVersion(version)} style={{ marginTop: '5px' }}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '80vh',
            overflowY: 'auto',
            backgroundColor: 'white',
            padding: '20px',
            border: '1px solid #ccc',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <h3>Content Preview</h3>
          <div dangerouslySetInnerHTML={{ __html: currentContent }} />
          <button onClick={() => setShowPreview(false)} style={{ marginTop: '20px' }}>
            Close Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableDocument;