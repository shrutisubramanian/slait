export function validateFiles(files: File[]): string[] {
  const errors: string[] = [];
  const allowedExtensions = ['.txt', '.md'];

  for (const file of files) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      errors.push(`${file.name}: unsupported format (${ext}). Only .txt and .md are accepted.`);
    }
  }

  if (files.length > 10) {
    errors.push(`Maximum 10 files allowed. Please remove ${files.length - 10} file(s).`);
  }

  return errors;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
