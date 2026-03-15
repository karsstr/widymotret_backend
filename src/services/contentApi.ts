import { ApiResponse, EditableContent, BatchContentUpdate } from '../types/content';
import { authStore } from '../stores/authStore';

const API_BASE = '/api';

/**
 * Helper: build Authorization header when token exists
 */
const authHeaders = (): Record<string, string> => {
  const token = authStore.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ─── Content CRUD ───────────────────────────────────────────────

/**
 * Fetch single content field
 * GET /api/content/:section/:field  (public)
 */
export const getContent = async (
  section: string,
  field: string
): Promise<ApiResponse<EditableContent>> => {
  try {
    const res = await fetch(`${API_BASE}/content/${section}/${field}`);
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<EditableContent>;
  } catch (err) {
    return {
      success: false,
      message: 'Gagal menghubungi server',
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
};

/**
 * Fetch all content for a section
 * GET /api/content/:section  (public)
 */
export const getSectionContent = async (
  section: string
): Promise<ApiResponse<EditableContent[]>> => {
  try {
    const res = await fetch(`${API_BASE}/content/${section}`);
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<EditableContent[]>;
  } catch (err) {
    return {
      success: false,
      message: 'Gagal menghubungi server',
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
};

/**
 * Update (or create) a single content field
 * PUT /api/content/:section/:field  (protected — Bearer token)
 */
export const updateContent = async (
  section: string,
  field: string,
  value: string
): Promise<ApiResponse<EditableContent>> => {
  try {
    const res = await fetch(`${API_BASE}/content/${section}/${field}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ value }),
    });
    
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status} ${res.statusText}`,
      };
    }
    
    return (await res.json()) as ApiResponse<EditableContent>;
  } catch (err) {
    return {
      success: false,
      message: 'Gagal menyimpan konten ke server',
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
};

/**
 * Batch update multiple fields at once
 * POST /api/content/batch  (protected — Bearer token)
 */
export const batchUpdateContent = async (
  updates: BatchContentUpdate['updates']
): Promise<ApiResponse<EditableContent[]>> => {
  try {
    const res = await fetch(`${API_BASE}/content/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<EditableContent[]>;
  } catch (err) {
    return {
      success: false,
      message: 'Gagal batch-update konten',
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
};

/**
 * Delete a content field
 * DELETE /api/content/:section/:field  (protected — Bearer token)
 */
export const deleteContent = async (
  section: string,
  field: string
): Promise<ApiResponse<void>> => {
  try {
    const res = await fetch(`${API_BASE}/content/${section}/${field}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<void>;
  } catch (err) {
    return {
      success: false,
      message: 'Gagal menghapus konten',
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
};

/**
 * Get ALL content (full load / backup)
 * GET /api/content  (public)
 */
export const getAllContent = async (): Promise<ApiResponse<EditableContent[]>> => {
  try {
    const res = await fetch(`${API_BASE}/content`);
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<EditableContent[]>;
  } catch (err) {
    return {
      success: false,
      message: 'Gagal mengambil semua konten',
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
};

// ─── Image Upload ───────────────────────────────────────────────

/**
 * Upload an image file to the backend
 * POST /api/upload  (protected — Bearer token, multipart/form-data)
 * @returns the public URL of the uploaded file (e.g. "/uploads/123456.jpg")
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const token = authStore.getToken();
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.message || 'Upload gagal');
  }
  return result.url;
};
