import { createSignal, createRoot } from 'solid-js';

interface Admin {
  id: number;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
}

const API_BASE = '/api';

function createAuthStore() {
  // Initialize from localStorage
  const storedToken = localStorage.getItem('adminToken');
  const storedAdmin = localStorage.getItem('adminData');

  const initialState: AuthState = {
    isAuthenticated: !!storedToken,
    admin: storedAdmin ? JSON.parse(storedAdmin) : null,
    token: storedToken,
  };

  const [state, setState] = createSignal<AuthState>(initialState);

  // Login function — calls the real backend API
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, message: data.message || 'Login gagal' };
      }

      const { token, admin } = data.data;

      // Save to localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(admin));

      // Update state
      setState({
        isAuthenticated: true,
        admin,
        token,
      });

      return { success: true, message: 'Login berhasil' };
    } catch (error) {
      return { success: false, message: 'Terjadi kesalahan koneksi ke server.' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');

    setState({
      isAuthenticated: false,
      admin: null,
      token: null,
    });
  };

  const isAuthenticated = () => state().isAuthenticated;
  const getAdmin = () => state().admin;
  const getToken = () => state().token;

  return {
    state,
    login,
    logout,
    isAuthenticated,
    getAdmin,
    getToken,
  };
}

// Create singleton store
export const authStore = createRoot(createAuthStore);
