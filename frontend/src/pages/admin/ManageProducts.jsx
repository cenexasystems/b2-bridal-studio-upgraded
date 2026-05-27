import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Save, X, Package, ImageIcon } from 'lucide-react';
const API = import.meta.env.VITE_API_URL;

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    _id: null,
    name: '',
    price: '',
    category: '',
    stock: '',
    image: null
  });
  // previewUrl       = object URL for a newly selected file
  // existingImageUrl = the already-saved URL when editing a product
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const objectUrlRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('name', currentProduct.name);
    formData.append('category', currentProduct.category);
    formData.append('price', currentProduct.price);
    formData.append('stock', currentProduct.stock);

    if (currentProduct.image) {
      formData.append('image', currentProduct.image);
    }

    try {
      if (currentProduct._id) {
        await axios.put(
          `${API}/api/products/${currentProduct._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/api/products`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsEditing(false);
      setCurrentProduct({ _id: null, name: '', category: '', price: '', stock: '', image: null });

      // clean up preview state
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(null);
      setExistingImageUrl(null);

      fetchProducts();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const closeForm = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setExistingImageUrl(null);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <Package size={24} className="text-[#D4AF37]" />
            Manage Products
          </h1>
          <p className="text-sm text-gray-600 mt-1">Add, edit and manage your product catalogue.</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => {
              setCurrentProduct({ _id: null, name: '', category: '', price: '', stock: '', image: null });
              setPreviewUrl(null);
              setExistingImageUrl(null);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg bg-[#111] text-white"
          >
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {/* ── FORM (two-column) ── */}
      {isEditing && (
        <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-gray-100 mb-8 overflow-hidden">

          {/* Form header bar */}
          <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                {currentProduct._id
                  ? <Edit2 size={14} style={{ color: '#D4AF37' }} />
                  : <Plus size={14} style={{ color: '#D4AF37' }} />
                }
              </div>
              <h3 className="text-sm font-cinzel font-bold uppercase tracking-widest text-gray-800">
                {currentProduct._id ? 'Edit Product' : 'Add Product'}
              </h3>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Two-column body */}
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT: form fields ── */}
            <div className="flex-1 px-7 py-6">
              <form onSubmit={handleSave} className="flex flex-col gap-5 h-full">

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-cinzel uppercase tracking-widest text-gray-400">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bridal Silk Saree"
                    value={currentProduct.name || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 bg-gray-50 text-sm text-gray-800 transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-cinzel uppercase tracking-widest text-gray-400">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Jewellery"
                    value={currentProduct.category || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 bg-gray-50 text-sm text-gray-800 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-cinzel uppercase tracking-widest text-gray-400">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={currentProduct.price || ''}
                      onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 bg-gray-50 text-sm text-gray-800 transition-all"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-cinzel uppercase tracking-widest text-gray-400">Stock</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={currentProduct.stock || ''}
                      onChange={e => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 bg-gray-50 text-sm text-gray-800 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* File input */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-cinzel uppercase tracking-widest text-gray-400">
                    {existingImageUrl && !previewUrl ? 'Replace Image (optional)' : 'Product Image'}
                  </label>
                  <div
                    className="w-full rounded-xl border border-dashed border-gray-300 hover:border-[#D4AF37] transition-colors overflow-hidden"
                    style={{ background: '#FAFAFA' }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                        const url = URL.createObjectURL(file);
                        objectUrlRef.current = url;
                        setPreviewUrl(url);
                        setCurrentProduct({ ...currentProduct, image: file });
                      }}
                      className="w-full text-sm py-3 px-4 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-cinzel file:font-bold file:uppercase file:tracking-wide file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 file:cursor-pointer file:transition-colors text-gray-500"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-auto pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-cinzel text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg bg-[#111] text-white hover:bg-[#222]"
                  >
                    <Save size={15} />
                    {currentProduct._id ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold uppercase tracking-wide border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>

            {/* ── RIGHT: large image preview ── */}
            <div
              className="w-full lg:w-[420px] flex-shrink-0 flex flex-col p-6 lg:p-7"
              style={{ borderLeft: '1px solid #F3F3F3', background: '#FAFAFA' }}
            >
              {/* Section label */}
              <div className="w-full flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] font-cinzel uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
                  Image Preview
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {(() => {
                const displaySrc = previewUrl || (existingImageUrl ? (existingImageUrl.startsWith('data:') || existingImageUrl.startsWith('http') ? existingImageUrl : `${API}/uploads/${existingImageUrl}`) : null);
                return displaySrc ? (
                  <div
                    className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.07)] flex-1"
                    style={{ minHeight: '380px', background: '#fff' }}
                  >
                    <img
                      src={displaySrc}
                      alt="Product Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px', position: 'absolute', inset: 0 }}
                    />
                    {/* Status badge */}
                    <span
                      className="absolute bottom-3 left-3 text-[10px] font-cinzel uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{
                        background: previewUrl ? 'rgba(16,185,129,0.85)' : 'rgba(0,0,0,0.55)',
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {previewUrl ? '✓ New Image' : 'Current Image'}
                    </span>
                    {/* Gold corner accent */}
                    <div
                      className="absolute top-0 right-0 w-14 h-14 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, transparent 50%, rgba(212,175,55,0.25) 50%)',
                        borderRadius: '0 1rem 0 0',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 flex-1"
                    style={{ minHeight: '380px', background: '#fff' }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.06)', border: '1.5px dashed rgba(212,175,55,0.35)' }}
                    >
                      <ImageIcon size={28} strokeWidth={1.2} style={{ color: '#D4AF37', opacity: 0.6 }} />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-xs font-cinzel uppercase tracking-widest text-gray-400 mb-1">
                        No Image Selected
                      </p>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        Choose a file to see a full preview here
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>{/* end two-column body */}
        </div>
      )}

      {/* ── PRODUCT GRID or EMPTY STATE ── */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: '#F9F7F2', border: '1.5px dashed #D4AF37' }}
          >
            <Package size={32} strokeWidth={1.2} style={{ color: '#D4AF37' }} />
          </div>
          <h2 className="text-lg font-bold font-cinzel uppercase tracking-wide text-gray-800 mb-2">
            No Products Found
          </h2>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Click <span className="font-semibold text-gray-700">'Add Product'</span> to create your first product.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(p => (
            <div
              key={p._id}
              className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all p-3 border border-gray-100"
            >
              <div className="h-44 bg-gray-50 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image.startsWith('data:') || p.image.startsWith('http') ? p.image : `${API}/uploads/${p.image}`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <ImageIcon size={36} strokeWidth={1.2} />
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-base text-gray-900">{p.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{p.category}</p>

              <div className="flex justify-between items-center mt-2">
                <span className="text-amber-700 font-bold text-sm font-cinzel">
                  ₹{p.price}
                </span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  {p.stock} left
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-50">
                <button
                  onClick={() => {
                    setCurrentProduct({
                      _id: p._id,
                      name: p.name || '',
                      category: p.category || '',
                      price: p.price || '',
                      stock: p.stock || '',
                      image: null
                    });
                    // show existing image in the preview panel
                    if (objectUrlRef.current) {
                      URL.revokeObjectURL(objectUrlRef.current);
                      objectUrlRef.current = null;
                    }
                    setPreviewUrl(null);
                    setExistingImageUrl(p.image || null);
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={() => handleDelete(p._id)}
                  className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ManageProducts;