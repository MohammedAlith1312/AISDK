// components/AttachButton.tsx

import React, { useRef } from 'react';

interface AttachFilesButtonProps {
  onChange: (files: FileList | null) => void;
  files?: FileList | null; // Optional prop to display the count if managed by parent state
}

const AttachButton: React.FC<AttachFilesButtonProps> = ({ onChange, files }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="file-upload"
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
        onClick={() => fileInputRef.current?.click()} // Ensure label click works
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
        {files?.length
          ? `${files.length} file${files.length > 1 ? "s" : ""} attached`
          : "Attach files"}
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            onChange(event.target.files);
          }
        }}
        multiple
        ref={fileInputRef}
      />
    </div>
  );
};

export default AttachButton;
