import { useCallback, useState } from 'react';

declare global {
  interface Window {
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
  }
}

export interface FileSystemFileHandle {
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

export interface FileSystemWritableFileStream {
  write(data: string | ArrayBuffer | Blob): Promise<void>;
  close(): Promise<void>;
}

export interface FileHandle {
  name: string;
  handle: FileSystemFileHandle;
}

interface UseFileSystemAccessReturn {
  fileHandle: FileHandle | null;
  setFileHandle: (handle: FileHandle | null) => void;
  openFile: () => Promise<{ name: string; content: string; handle: FileSystemFileHandle } | null>;
  saveFile: (content: string) => Promise<boolean>;
  saveFileAs: (content: string, suggestedName?: string) => Promise<{ name: string; handle: FileSystemFileHandle } | false | null>;
}

export const useFileSystemAccess = (): UseFileSystemAccessReturn => {
  const [fileHandle, setFileHandle] = useState<FileHandle | null>(null);

  const openFile = useCallback(async (): Promise<{ name: string; content: string; handle: FileSystemFileHandle } | null> => {
    try {
      const handles = await (window.showOpenFilePicker as any)({
        types: [
          {
            description: 'Wire Files',
            accept: { 'text/plain': ['.wire'] },
          },
        ],
        multiple: false,
      });

      if (handles.length === 0) return null;

      const handle = handles[0];
      const file = await handle.getFile();
      const content = await file.text();

      setFileHandle({ name: file.name, handle });
      return { name: file.name, content, handle };
    } catch (error) {
      if (error instanceof DOMException && error.name !== 'AbortError') {
        console.error('Error opening file:', error);
      }
      return null;
    }
  }, []);

  const saveFile = useCallback(
    async (content: string): Promise<boolean> => {
      if (!fileHandle) return false;

      try {
        const writable = await fileHandle.handle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      } catch (error) {
        console.error('Error saving file:', error);
        return false;
      }
    },
    [fileHandle]
  );

  const saveFileAs = useCallback(
    async (content: string, suggestedName?: string): Promise<{ name: string; handle: FileSystemFileHandle } | false | null> => {
      try {
        const handle = await (window.showSaveFilePicker as any)({
          types: [
            {
              description: 'Wire Files',
              accept: { 'text/plain': ['.wire'] },
            },
          ],
          suggestedName: suggestedName || 'untitled.wire',
        });

        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        setFileHandle({ name: handle.name, handle });
        return { name: handle.name, handle };
      } catch (error) {
        // Usuario canceló el diálogo
        if (error instanceof DOMException && error.name === 'AbortError') {
          return false;
        }
        // Error real
        if (error instanceof DOMException && error.name !== 'AbortError') {
          console.error('Error saving file:', error);
        }
        return null;
      }
    },
    []
  );

  return {
    fileHandle,
    setFileHandle,
    openFile,
    saveFile,
    saveFileAs,
  };
};
