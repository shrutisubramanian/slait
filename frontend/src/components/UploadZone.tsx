import { useState, useRef } from 'react';
import { validateFiles, formatFileSize } from '../validation';

interface UploadZoneProps {
  onSubmit: (files: File[]) => void;
  isSubmitting: boolean;
}

export default function UploadZone({ onSubmit, isSubmitting }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: File[]) {
    const merged = [...files, ...incoming];
    setFiles(merged);
    setErrors(validateFiles(merged));
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    setErrors(validateFiles(updated));
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    addFiles(selected);
    // reset so the same file can be re-selected if removed
    e.target.value = '';
  }

  function handleSubmit() {
    onSubmit(files);
  }

  const canSubmit = errors.length === 0 && files.length > 0 && !isSubmitting;

  return (
    <div className="upload-zone">
      <div
        className={`drop-area${isDragOver ? ' drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag &amp; drop .txt or .md files here</p>
        <button type="button" onClick={() => inputRef.current?.click()}>
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md"
          multiple
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeFile(i)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <ul className="validation-errors">
          {errors.map((err, i) => (
            <li key={i} className="error-item">{err}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={`analyze-btn${isSubmitting ? ' loading' : ''}`}
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {isSubmitting ? 'Analyzing…' : 'Analyze'}
      </button>
    </div>
  );
}
