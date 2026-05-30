import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Plus, Trash2, Edit3, User, X, Award, Phone, Mail, Calendar } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    experienceYears: ''
  });

  // Modal States
  const [editStaff, setEditStaff] = useState(null);
  const [profileStaff, setProfileStaff] = useState(null);

  // 📥 Fetch staff
  const fetchStaff = async () => {
    const res = await axios.get(`${API}/api/staff`);
    setStaffList(res.data);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ✅ VALIDATION FUNCTION
  const validateForm = (data) => {
    // Phone → exactly 10 digits
    if (!/^\d{10}$/.test(data.phone)) {
      alert("Phone number must be exactly 10 digits");
      return false;
    }

    // Age → only numbers
    if (!/^\d+$/.test(data.age)) {
      alert("Age must be a number");
      return false;
    }

    // Experience Years → positive numbers
    if (!/^\d+$/.test(data.experienceYears)) {
      alert("Experience Years must be a positive number");
      return false;
    }

    // Email → valid format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      alert("Enter a valid email");
      return false;
    }

    return true;
  };

  // ➕ Add staff
  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.email || !form.age || form.experienceYears === '') {
      alert('Fill all fields');
      return;
    }

    // ✅ VALIDATION CHECK
    if (!validateForm(form)) return;

    try {
      await axios.post(`${API}/api/staff`, form);
      setForm({
        name: '',
        phone: '',
        email: '',
        age: '',
        experienceYears: ''
      });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add staff');
    }
  };

  // ✏️ Edit staff save
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editStaff.name || !editStaff.phone || !editStaff.email || !editStaff.age || editStaff.experienceYears === '') {
      alert('Fill all fields');
      return;
    }

    // ✅ VALIDATION CHECK
    if (!validateForm(editStaff)) return;

    try {
      await axios.put(`${API}/api/staff/${editStaff._id}`, editStaff);
      setEditStaff(null);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update staff');
    }
  };

  // ❌ Delete staff
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    await axios.delete(`${API}/api/staff/${id}`);
    fetchStaff();
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
          <Users size={24} className="text-[#D4AF37]" />
          Staff Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">Manage your studio team members and profiles.</p>
      </div>

      {/* ➕ ADD FORM */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h3 className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Add New Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Full Name <span className="text-amber-600">*</span></label>
            <input
              placeholder="Staff name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Phone <span className="text-amber-600">*</span></label>
            <input
              placeholder="10-digit number"
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setForm({ ...form, phone: value });
                }
              }}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Email <span className="text-amber-600">*</span></label>
            <input
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wider text-gray-500">Age <span className="text-amber-600">*</span></label>
            <input
              placeholder="Age"
              value={form.age}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setForm({ ...form, age: value });
              }}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wider text-gray-500">Experience Years <span className="text-amber-600">*</span></label>
            <input
              placeholder="Years"
              value={form.experienceYears}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setForm({ ...form, experienceYears: value });
              }}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg bg-[#111] text-white">
            <Plus size={16} className="text-[#FFD700]" /> Add Staff
          </button>
        </div>
      </div>

      {/* 📋 STAFF LIST */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Staff ID</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Name</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Phone</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Experience</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Age</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffList.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-500 font-cormorant italic text-lg">No staff members found.</td></tr>
              ) : staffList.map((s) => (
                <tr key={s._id} className="hover:bg-[#FFFCF5] transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-sm text-amber-700">{s.staffId || 'N/A'}</td>
                  <td className="p-4 font-medium text-gray-900 font-playfair">{s.name}</td>
                  <td className="p-4 text-gray-600 font-cormorant text-lg">{s.phone}</td>
                  <td className="p-4 text-gray-600 font-cormorant text-lg font-bold text-amber-800">{s.experienceYears ?? 0} Years</td>
                  <td className="p-4 text-gray-600 font-cormorant text-lg">{s.age}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setProfileStaff(s)}
                        className="p-2 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="View Profile"
                      >
                        <User size={18} />
                      </button>
                      <button
                        onClick={() => setEditStaff({ ...s })}
                        className="p-2 rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        title="Edit Staff"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Staff"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✏️ EDIT STAFF MODAL */}
      {editStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl border border-gray-100 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditStaff(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold font-cinzel uppercase tracking-wide text-gray-900 mb-6 flex items-center gap-2">
              <Edit3 size={20} className="text-[#D4AF37]" /> Edit Staff Details
            </h2>
            <form onSubmit={handleEditSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-cinzel font-semibold uppercase text-gray-500">Name</label>
                  <input
                    type="text"
                    value={editStaff.name}
                    onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
                    className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-cinzel font-semibold uppercase text-gray-500">Phone</label>
                  <input
                    type="text"
                    value={editStaff.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setEditStaff({ ...editStaff, phone: val });
                    }}
                    className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-cinzel font-semibold uppercase text-gray-500">Email</label>
                <input
                  type="email"
                  value={editStaff.email}
                  onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
                  className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-cinzel font-semibold uppercase text-gray-500">Age</label>
                  <input
                    type="text"
                    value={editStaff.age}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setEditStaff({ ...editStaff, age: val });
                    }}
                    className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-cinzel font-semibold uppercase text-gray-500">Experience (Years)</label>
                  <input
                    type="text"
                    value={editStaff.experienceYears}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setEditStaff({ ...editStaff, experienceYears: val });
                    }}
                    className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditStaff(null)}
                  className="flex-1 py-3 px-4 bg-transparent border border-gray-200 text-gray-600 font-cinzel text-xs font-bold uppercase rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#111] text-white font-cinzel text-xs font-bold uppercase rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👤 STAFF PROFILE MODAL */}
      {profileStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setProfileStaff(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfileStaff(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-8 flex flex-col items-center border-b border-gray-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#C9A227] flex items-center justify-center text-white text-3xl font-cinzel font-bold shadow-lg shadow-amber-200/50 mb-4">
                {profileStaff.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold font-cinzel uppercase tracking-wide text-gray-900">{profileStaff.name}</h2>
              <span className="mt-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800 uppercase tracking-wider">{profileStaff.staffId}</span>
            </div>
            
            {/* Details list */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500"><Phone size={18} /></div>
                <div>
                  <div className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 font-cinzel">Phone Number</div>
                  <div className="text-gray-700 text-base font-medium">{profileStaff.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500"><Mail size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 font-cinzel">Email Address</div>
                  <div className="text-gray-700 text-base font-medium truncate">{profileStaff.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500"><Calendar size={18} /></div>
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 font-cinzel">Age</div>
                    <div className="text-gray-700 text-base font-medium">{profileStaff.age} Years</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 rounded-lg text-gray-500"><Award size={18} /></div>
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 font-cinzel">Experience</div>
                    <div className="text-gray-700 text-base font-bold text-amber-700">{profileStaff.experienceYears ?? 0} Years</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setProfileStaff(null)}
                className="py-2 px-6 bg-[#111] text-white font-cinzel text-xs font-bold uppercase rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;