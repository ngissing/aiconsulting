import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './PreviewPaneRenderer.css';

interface PreviewPaneRendererProps {
  content: string;
  // TODO: Add support for other document properties and file types
}

const PreviewPaneRenderer: React.FC<PreviewPaneRendererProps> = ({ content }) => {
  return (
    <div className="preview-pane-renderer p-4 border rounded-md bg-gray-50 h-full overflow-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default PreviewPaneRenderer;