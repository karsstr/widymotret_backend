import { Component, createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  features: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = '/api';

const fetchPackages = async (): Promise<Package[]> => {
  const res = await fetch(`${API_BASE}/packages`);
  const data = await res.json();
  return data.success ? data.data : [];
};

const AdminPricelist: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();

  const [packages, { refetch }] = createResource(fetchPackages);
  const [showModal, setShowModal] = createSignal(false);
  const [editingPkg, setEditingPkg] = createSignal<Package | null>(null);
  const [saveMessage, setSaveMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  // Form state
  const [formName, setFormName] = createSignal('');
  const [formDescription, setFormDescription] = createSignal('');
  const [formPrice, setFormPrice] = createSignal('');
  const [formCategory, setFormCategory] = createSignal('studio');
  const [formImages, setFormImages] = createSignal<string[]>([]);
  const [formFeatures, setFormFeatures] = createSignal('');
  const [formIsPublished, setFormIsPublished] = createSignal(true);

  const showToast = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const openCreate = () => {
    setEditingPkg(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormCategory('studio');
    setFormImages([]);
    setFormFeatures('');
    setFormIsPublished(true);
    setShowModal(true);
  };

  const openEdit = (pkg: Package) => {
    setEditingPkg(pkg);
    setFormName(pkg.name);
    setFormDescription(pkg.description);
    setFormPrice(String(pkg.price));
    setFormCategory(pkg.category || 'studio');
    setFormImages(Array.isArray(pkg.images) ? pkg.images : []);
    setFormFeatures(Array.isArray(pkg.features) ? pkg.features.join('\n') : '');
    setFormIsPublished(pkg.isPublished);
    setShowModal(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = authStore.getToken();
    const body = {
      name: formName(),
      description: formDescription(),
      price: parseInt(formPrice()),
      category: formCategory(),
      images: formImages(),
      features: formFeatures().split('\n').map(f => f.trim()).filter(Boolean),
      isPublished: formIsPublished(),
    };

    try {
      const editing = editingPkg();
      const url = editing ? `${API_BASE}/packages/${editing.id}` : `${API_BASE}/packages`;
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
        showToast('success', editing ? 'Package berhasil diperbarui!' : 'Package berhasil dibuat!');
        setShowModal(false);
        refetch();
      } else {
        showToast('error', data.message || 'Gagal menyimpan package');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Yakin ingin menghapus package "${pkg.name}"?`)) return;

    const token = authStore.getToken();

    try {
      const res = await fetch(`${API_BASE}/packages/${pkg.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', 'Package berhasil dihapus!');
        refetch();
      } else {
        showToast('error', data.message || 'Gagal menghapus package');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan koneksi');
    }
  };

  const handleLogout = () => {
    authStore.logout();
    navigate('/admin', { replace: true });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleFileUpload = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const token = authStore.getToken();

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFormImages(prev => [...prev, data.url]);
        showToast('success', 'Gambar berhasil diunggah!');
      } else {
        showToast('error', data.message || 'Gagal mengunggah gambar');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan saat mengunggah');
    } finally {
      target.value = ''; // Reset input
    }
  };

  const removeImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
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
              <span class="text-sm text-white/70 border-l border-white/30 pl-3">Pricelist Admin</span>
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
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">💰 Kelola Pricelist</h1>
            <p class="text-gray-600 mt-2">Tambah, edit, dan hapus paket fotografi.</p>
          </div>
          <button
            onClick={openCreate}
            class="px-6 py-3 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Package
          </button>
        </div>

        {/* Toast */}
        <Show when={saveMessage()}>
          <div class={`mb-6 p-4 rounded-lg ${saveMessage()?.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {saveMessage()?.text}
          </div>
        </Show>

        {/* Loading */}
        <Show when={packages.loading}>
          <div class="flex justify-center py-16">
            <div class="animate-spin w-8 h-8 border-4 border-[#576250] border-t-transparent rounded-full"></div>
          </div>
        </Show>

        {/* Packages Table */}
        <Show when={!packages.loading}>
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nama</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kategori</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Harga</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-gray-600">Features</th>
                    <th class="text-center px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th class="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <For each={packages()} fallback={
                    <tr>
                      <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                        Belum ada package. Klik "Tambah Package" untuk membuat yang pertama.
                      </td>
                    </tr>
                  }>
                    {(pkg) => (
                      <tr class="hover:bg-gray-50 transition">
                        <td class="px-6 py-4">
                          <div>
                            <p class="font-medium text-gray-800">{pkg.name}</p>
                            <p class="text-sm text-gray-500 mt-1 line-clamp-2">{pkg.description}</p>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md uppercase tracking-wider">
                            {pkg.category}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span class="font-semibold text-[#576250]">{formatPrice(pkg.price)}</span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex flex-wrap gap-1">
                            <For each={Array.isArray(pkg.features) ? pkg.features.slice(0, 3) : []}>
                              {(feat) => (
                                <span class="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{feat as string}</span>
                              )}
                            </For>
                            <Show when={Array.isArray(pkg.features) && pkg.features.length > 3}>
                              <span class="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                +{pkg.features.length - 3} lainnya
                              </span>
                            </Show>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <span class={`inline-block px-3 py-1 rounded-full text-xs font-medium ${pkg.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {pkg.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                          <div class="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEdit(pkg)}
                              class="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(pkg)}
                              class="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition text-sm font-medium"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </Show>
      </main>

      {/* Modal */}
      <Show when={showModal()}>
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-800">
                  {editingPkg() ? 'Edit Package' : 'Tambah Package Baru'}
                </h3>
                <button onClick={() => setShowModal(false)} class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Package</label>
                <input
                  type="text"
                  value={formName()}
                  onInput={(e) => setFormName(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                  placeholder="Contoh: Wedding Photography Basic"
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
                  placeholder="Deskripsi singkat tentang package ini"
                  required
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  value={formPrice()}
                  onInput={(e) => setFormPrice(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                  placeholder="Contoh: 2500000"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Features (satu per baris)</label>
                <textarea
                  value={formFeatures()}
                  onInput={(e) => setFormFeatures(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                  rows="5"
                  placeholder={"1 Photographer\nUnlimited File\n150+ Professional Editing"}
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formCategory()}
                  onInput={(e) => setFormCategory(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none bg-white"
                  required
                >
                  <option value="studio">Studio Photoshoot</option>
                  <option value="graduation">Graduation Photoshoot</option>
                  <option value="event">Event Photoshoot</option>
                  <option value="product">Product Photography</option>
                  <option value="wedding">Wedding Photography & Videography</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Foto Paket (bisa lebih dari satu)</label>
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <For each={formImages()}>
                    {(url, index) => (
                      <div class="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                        <img src={url} class="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index())}
                          class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </For>
                  <label class="cursor-pointer aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#576250] hover:text-[#576250] transition">
                    <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span class="text-xs">Upload Foto</span>
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formIsPublished()}
                  onChange={(e) => setFormIsPublished(e.currentTarget.checked)}
                  class="w-4 h-4 accent-[#576250]"
                />
                <label for="isPublished" class="text-sm text-gray-700">Published (tampilkan di website)</label>
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
                  {isSubmitting() ? 'Menyimpan...' : (editingPkg() ? 'Perbarui' : 'Simpan')}
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

export default AdminPricelist;
