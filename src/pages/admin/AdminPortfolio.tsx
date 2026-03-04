import { Component, createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';

interface Portfolio {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = '/api';

const CATEGORIES = [
  { value: 'portrait', label: 'Portrait Photography' },
  { value: 'event', label: 'Event & Wedding' },
  { value: 'editorial', label: 'Editorial & Brand' },
  { value: 'retouching', label: 'Retouching & Editing' },
  { value: 'product', label: 'Product Photography' },
  { value: 'graduation', label: 'Graduation' },
];

const fetchPortfolios = async (): Promise<Portfolio[]> => {
  const res = await fetch(`${API_BASE}/portfolios`);
  const data = await res.json();
  return data.success ? data.data : [];
};

const AdminPortfolio: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();

  const [portfolios, { refetch }] = createResource(fetchPortfolios);
  const [showModal, setShowModal] = createSignal(false);
  const [editingItem, setEditingItem] = createSignal<Portfolio | null>(null);
  const [saveMessage, setSaveMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [filterCategory, setFilterCategory] = createSignal('all');

  // Form state
  const [formTitle, setFormTitle] = createSignal('');
  const [formDescription, setFormDescription] = createSignal('');
  const [formImageUrl, setFormImageUrl] = createSignal('');
  const [formCategory, setFormCategory] = createSignal('portrait');

  const showToast = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const filteredPortfolios = () => {
    const items = portfolios() || [];
    if (filterCategory() === 'all') return items;
    return items.filter(p => p.category === filterCategory());
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormImageUrl('');
    setFormCategory('portrait');
    setShowModal(true);
  };

  const openEdit = (item: Portfolio) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormImageUrl(item.imageUrl);
    setFormCategory(item.category);
    setShowModal(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = authStore.getToken();
    const body = {
      title: formTitle(),
      description: formDescription(),
      imageUrl: formImageUrl(),
      category: formCategory(),
    };

    try {
      const editing = editingItem();
      const url = editing ? `${API_BASE}/portfolios/${editing.id}` : `${API_BASE}/portfolios`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', editing ? 'Portfolio berhasil diperbarui!' : 'Portfolio berhasil dibuat!');
        setShowModal(false);
        refetch();
      } else {
        showToast('error', data.message || 'Gagal menyimpan portfolio');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Portfolio) => {
    if (!confirm(`Yakin ingin menghapus "${item.title}"?`)) return;

    const token = authStore.getToken();

    try {
      const res = await fetch(`${API_BASE}/portfolios/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', 'Portfolio berhasil dihapus!');
        refetch();
      } else {
        showToast('error', data.message || 'Gagal menghapus portfolio');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan koneksi');
    }
  };

  const handleLogout = () => {
    authStore.logout();
    navigate('/admin', { replace: true });
  };

  const getCategoryLabel = (val: string) => {
    return CATEGORIES.find(c => c.value === val)?.label || val;
  };

  return (
    <div class="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/home')}
                class="mr-4 px-3 py-2 bg-white/20 hover:bg-white/30 rounded transition text-sm"
              >
                ← Back
              </button>
              <span class="text-xl font-bold">WIDYMOTRET</span>
              <span class="text-sm text-white/70 border-l border-white/30 pl-3">Portfolio Admin</span>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium">{admin()?.username || 'Admin'}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-[#576250] flex items-center justify-center">
                <span class="text-lg font-bold">
                  {admin()?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main class="container mx-auto px-6 py-8">
        {/* Header */}
        <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">📸 Kelola Portfolio</h1>
            <p class="text-gray-600 mt-2">Tambah, edit, dan hapus foto portfolio.</p>
          </div>
          <button
            onClick={openCreate}
            class="px-6 py-3 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Portfolio
          </button>
        </div>

        {/* Toast */}
        <Show when={saveMessage()}>
          <div class={`mb-6 p-4 rounded-lg ${saveMessage()?.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {saveMessage()?.text}
          </div>
        </Show>

        {/* Category Filter */}
        <div class="bg-white rounded-xl shadow-sm p-1 mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            class={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${filterCategory() === 'all' ? 'bg-[#576250] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Semua
          </button>
          <For each={CATEGORIES}>
            {(cat) => (
              <button
                onClick={() => setFilterCategory(cat.value)}
                class={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${filterCategory() === cat.value ? 'bg-[#576250] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {cat.label}
              </button>
            )}
          </For>
        </div>

        {/* Loading */}
        <Show when={portfolios.loading}>
          <div class="flex justify-center py-16">
            <div class="animate-spin w-8 h-8 border-4 border-[#576250] border-t-transparent rounded-full"></div>
          </div>
        </Show>

        {/* Portfolio Grid */}
        <Show when={!portfolios.loading}>
          <Show when={filteredPortfolios().length > 0} fallback={
            <div class="text-center py-16 text-gray-500">
              <p class="text-lg">Belum ada portfolio.</p>
              <p class="text-sm mt-2">Klik "Tambah Portfolio" untuk menambahkan yang pertama.</p>
            </div>
          }>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={filteredPortfolios()}>
                {(item) => (
                  <div class="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition">
                    {/* Image */}
                    <div class="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onerror={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div class="absolute top-3 left-3">
                        <span class="px-3 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div class="p-5">
                      <h3 class="font-bold text-gray-800 text-lg">{item.title}</h3>
                      <p class="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>

                      <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openEdit(item)}
                          class="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          class="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition text-sm font-medium"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </main>

      {/* Modal */}
      <Show when={showModal()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">
                  {editingItem() ? 'Edit Portfolio' : 'Tambah Portfolio Baru'}
                </h3>
                <button onClick={() => setShowModal(false)} class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  value={formTitle()}
                  onInput={(e) => setFormTitle(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                  placeholder="Contoh: Wedding Ceremony Moments"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formDescription()}
                  onInput={(e) => setFormDescription(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                  rows="3"
                  placeholder="Deskripsi singkat foto ini"
                  required
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formImageUrl()}
                  onInput={(e) => setFormImageUrl(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                  placeholder="Contoh: /portrait/portrait (1).png"
                  required
                />
                <Show when={formImageUrl()}>
                  <div class="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-[200px]">
                    <img
                      src={formImageUrl()}
                      alt="Preview"
                      class="w-full h-full object-cover"
                      onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                </Show>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formCategory()}
                  onChange={(e) => setFormCategory(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none bg-white"
                >
                  <For each={CATEGORIES}>
                    {(cat) => (
                      <option value={cat.value}>{cat.label}</option>
                    )}
                  </For>
                </select>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  class="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting()}
                  class="flex-1 py-3 px-4 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium disabled:opacity-50"
                >
                  {isSubmitting() ? 'Menyimpan...' : (editingItem() ? 'Perbarui' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      {/* Footer */}
      <footer class="bg-white border-t mt-auto py-4 px-6">
        <div class="container mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Widymotret Studio Admin Panel</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPortfolio;
