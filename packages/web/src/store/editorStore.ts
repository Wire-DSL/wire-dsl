import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorFile {
  name: string;
  content: string;
  isDirty: boolean;
  lastModified: number;
}

export interface EditorState {
  files: Map<string, EditorFile>;
  currentFileId: string;
  zoomLevel: number;
  previewMode: 'all-screens' | 'single-screen';
  selectedScreen: string | null;
}

interface EditorStore extends EditorState {
  // File operations
  createFile: (name: string, content?: string) => void;
  openFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  markFileSaved: (fileId: string) => void;
  deleteFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;

  // Preview operations
  setZoomLevel: (level: number) => void;
  setPreviewMode: (mode: 'all-screens' | 'single-screen') => void;
  setSelectedScreen: (screenName: string | null) => void;

  // Current file shortcuts
  getCurrentFile: () => EditorFile | null;
}

const createInitialFile = (): EditorFile => ({
  name: 'untitled.wire',
  content: '',
  isDirty: false,
  lastModified: Date.now(),
});

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      files: new Map([['untitled-1', createInitialFile()]]),
      currentFileId: 'untitled-1',
      zoomLevel: 100,
      previewMode: 'all-screens',
      selectedScreen: null,

      createFile: (name: string, content?: string) => {
        const fileId = `file-${Date.now()}`;
        const file: EditorFile = {
          name,
          content: content || '',
          isDirty: !!content,
          lastModified: Date.now(),
        };

        set((state) => ({
          files: new Map(state.files).set(fileId, file),
          currentFileId: fileId,
        }));
      },

      openFile: (fileId: string) => {
        set({ currentFileId: fileId });
      },

      updateFileContent: (fileId: string, content: string) => {
        set((state) => {
          const files = new Map(state.files);
          const file = files.get(fileId);
          if (file) {
            files.set(fileId, {
              ...file,
              content,
              isDirty: true,
              lastModified: Date.now(),
            });
          }
          return { files };
        });
      },

      renameFile: (fileId: string, newName: string) => {
        set((state) => {
          const files = new Map(state.files);
          const file = files.get(fileId);
          if (file) {
            files.set(fileId, { ...file, name: newName });
          }
          return { files };
        });
      },

      markFileSaved: (fileId: string) => {
        set((state) => {
          const files = new Map(state.files);
          const file = files.get(fileId);
          if (file) {
            files.set(fileId, { ...file, isDirty: false });
          }
          return { files };
        });
      },

      deleteFile: (fileId: string) => {
        set((state) => {
          const files = new Map(state.files);
          files.delete(fileId);

          // Si eliminamos el archivo actual, cambiar a otro
          let newCurrentId = state.currentFileId;
          if (newCurrentId === fileId) {
            const remaining = Array.from(files.keys());
            newCurrentId = remaining.length > 0 ? remaining[0] : '';
          }

          return {
            files,
            currentFileId: newCurrentId,
          };
        });
      },

      closeFile: (fileId: string) => {
        set((state) => {
          if (state.currentFileId === fileId) {
            const remaining = Array.from(state.files.keys()).filter(
              (id) => id !== fileId
            );
            return {
              currentFileId: remaining.length > 0 ? remaining[0] : '',
            };
          }
          return {};
        });
      },

      setZoomLevel: (level: number) => {
        set({ zoomLevel: Math.max(25, Math.min(200, level)) });
      },

      setPreviewMode: (mode: 'all-screens' | 'single-screen') => {
        set({ previewMode: mode });
      },

      setSelectedScreen: (screenName: string | null) => {
        set({ selectedScreen: screenName });
      },

      getCurrentFile: () => {
        const state = get();
        return state.files.get(state.currentFileId) || null;
      },
    }),
    {
      name: 'wire-editor-store',
      storage: {
        getItem: (name: string) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          try {
            const parsed = JSON.parse(item);
            return {
              ...parsed,
              state: {
                ...parsed.state,
                files: new Map(parsed.state.files || []),
              },
            };
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: any) => {
          localStorage.setItem(
            name,
            JSON.stringify({
              ...value,
              state: {
                ...value.state,
                files: Array.from(value.state.files || new Map()),
              },
            })
          );
        },
        removeItem: (name: string) => localStorage.removeItem(name),
      },
    }
  )
);
