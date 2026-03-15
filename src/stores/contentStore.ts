import { createSignal, createRoot } from 'solid-js';
import { EditableContent } from '../types/content';

const API_BASE = '/api';

interface ContentState {
  content: Map<string, EditableContent>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const createContentStore = () => {
  const [state, setState] = createSignal<ContentState>({
    content: new Map(),
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Get content field from store
  const getField = (section: string, field: string): string => {
    const key = `${section}.${field}`;
    return state().content.get(key)?.value || '';
  };

  // Load all content from the backend
  const loadAll = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE}/content`);
      const result = await response.json();

      if (result.success && result.data) {
        const newMap = new Map<string, EditableContent>();
        result.data.forEach((item: EditableContent) => {
          const key = `${item.section}.${item.field}`;
          newMap.set(key, item);
        });

        setState(prev => ({
          ...prev,
          content: newMap,
          lastUpdated: new Date(),
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.message,
          isLoading: false,
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat konten';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
    }
  };

  // Load content for a section from the backend
  const loadSection = async (section: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE}/content/${section}`);
      const result = await response.json();

      if (result.success && result.data) {
        setState(prev => {
          const newMap = new Map(prev.content);
          result.data.forEach((item: EditableContent) => {
            const key = `${item.section}.${item.field}`;
            newMap.set(key, item);
          });
          return {
            ...prev,
            content: newMap,
            lastUpdated: new Date(),
            isLoading: false,
          };
        });
      } else {
        setState(prev => ({
          ...prev,
          error: result.message,
          isLoading: false,
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat section';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
    }
  };

  // Load single field from the backend
  const loadField = async (section: string, field: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE}/content/${section}/${field}`);
      const result = await response.json();

      if (result.success && result.data) {
        const key = `${section}.${field}`;
        setState(prev => {
          const newMap = new Map(prev.content);
          newMap.set(key, result.data!);
          return {
            ...prev,
            content: newMap,
            lastUpdated: new Date(),
            isLoading: false,
          };
        });
      } else {
        setState(prev => ({
          ...prev,
          error: result.message,
          isLoading: false,
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat konten';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
    }
  };

  // Update local state only (no backend call).
  // Backend persistence is handled by contentApi.updateContent(),
  // which is called by EditableText before invoking this via onSave.
  const updateFieldLocal = (section: string, field: string, value: string) => {
    const key = `${section}.${field}`;

    setState(prev => {
      const newMap = new Map(prev.content);
      const existing = newMap.get(key);

      if (existing) {
        newMap.set(key, {
          ...existing,
          value,
          updated_at: new Date().toISOString(),
        });
      } else {
        newMap.set(key, {
          id: `new-${Date.now()}`,
          section,
          field,
          value,
          updated_at: new Date().toISOString(),
        });
      }

      return {
        ...prev,
        content: newMap,
        lastUpdated: new Date(),
      };
    });
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Clear all data
  const clear = () => {
    setState({
      content: new Map(),
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  };

  return {
    state,
    get isLoading() {
      return state().isLoading;
    },
    get error() {
      return state().error;
    },
    get lastUpdated() {
      return state().lastUpdated;
    },
    getField,
    loadField,
    loadSection,
    loadAll,
    updateFieldLocal,
    clearError,
    clear,
  };
};

// Singleton store instance
export const contentStore = createRoot(createContentStore);
