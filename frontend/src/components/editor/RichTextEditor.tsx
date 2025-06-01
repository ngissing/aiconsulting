import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  initialValue?: string;
  onEditorChange: (content: string, editor: any) => void;
  apiKey?: string; // Optional: API key can be passed as a prop or set globally
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onEditorChange,
  apiKey = 'YOUR_TINYMCE_API_KEY' // Replace with your actual API key or manage globally
}) => {
  return (
    <Editor
      apiKey={apiKey}
      initialValue={initialValue}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        // Ensure clean HTML5 output
        schema: 'html5',
        forced_root_block: 'p',
        // Example: Configure image plugin (more advanced setup might be needed for uploads)
        image_advtab: true,
        // image_upload_url: '/your-image-upload-endpoint', // Example for server-side uploads
        // images_upload_credentials: true,
        // automatic_uploads: true,
        // file_picker_types: 'image',
        // file_picker_callback: function (cb, value, meta) {
        //   // Implement file picker logic
        // }
      }}
      onEditorChange={onEditorChange}
    />
  );
};

export default RichTextEditor;