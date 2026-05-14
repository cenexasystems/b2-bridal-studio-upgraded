import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Plus, Trash2, Power, PowerOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discountPercentage: '' });
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/api/coupons`);
      setCoupons(res.data);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.code || !form.discountPercentage) return;
    
    try {
      await axios.post(`${API}/api/coupons`, form);
      setForm({ code: '', discountPercentage: '' });
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create coupon');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API}/api/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    try {
      await axios.delete(`${API}/api/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold admin-heading flex items-center gap-2">
          <Tag size={24} /> Coupon Management
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="admin-card p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Create Coupon</h3>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border p-2 rounded focus:ring-1 focus:ring-black outline-none uppercase"
                  placeholder="e.g. SUMMER15"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Discount %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountPercentage}
                  onChange={e => setForm({ ...form, discountPercentage: e.target.value })}
                  className="w-full border p-2 rounded focus:ring-1 focus:ring-black outline-none"
                  placeholder="e.g. 15"
                  required
                />
              </div>
              <button type="submit" className="admin-btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={16} /> Create Coupon
              </button>
            </form>
          </div>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-2">
          <div className="admin-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-xs uppercase text-gray-500 tracking-wider border-b">
                  <th className="p-4 pl-6">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No coupons found.</td></tr>
                ) : coupons.map(coupon => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="p-4 pl-6 font-mono font-bold text-gray-900">{coupon.code}</td>
                    <td className="p-4 text-green-600 font-bold">{coupon.discountPercentage}%</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(coupon.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleToggle(coupon._id)}
                        className={`p-1.5 rounded transition-colors ${coupon.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        title={coupon.isActive ? 'Disable Coupon' : 'Enable Coupon'}
                      >
                        {coupon.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCoupons;
