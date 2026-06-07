import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Search, CheckCircle, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const HOUR_LABELS = {
  '10':'10 AM','11':'11 AM','12':'12 PM','13':'1 PM',
  '14':'2 PM','15':'3 PM','16':'4 PM','17':'5 PM','18':'6 PM','19':'7 PM'
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} at ${hours}:${minutes} ${ampm}`;
  } catch {
    return dateStr;
  }
};

const WalkInAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get(`${API}/api/cash-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      setError('Failed to fetch walk-in appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleMarkCompleted = async (id) => {
    if (!window.confirm('Mark this appointment as Completed?')) return;
    setUpdatingId(id);
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`${API}/api/cash-appointments/${id}/status`, { status: 'Completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Completed' } : a));
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = appointments.filter(appt => {
    const name = (appt.name || '').toLowerCase();
    const phone = (appt.phone || '').toLowerCase();
    const branch = (appt.branch || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || name.includes(q) || phone.includes(q) || branch.includes(q);
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = appointments.filter(a => a.status === 'Pending').length;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <span style={{ fontSize: '1.3rem' }}>💵</span>
            Walk-in Appointments
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-cormorant italic">
            Cash payment appointments made by customers.
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold font-cinzel">
                {pendingCount} Pending
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-gray-400" size={16} />
            </span>
            <input
              type="text"
              placeholder="Search name, phone or branch..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-cormorant">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Customer</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Scheduled</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Branch</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Services</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Status</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Total</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-400 font-cormorant italic text-lg">
                    No walk-in appointments found.
                  </td>
                </tr>
              ) : filtered.map(appt => (
                <tr key={appt._id} className="hover:bg-[#FFFCF5] transition-colors">
                  {/* Customer */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-gray-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{appt.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{appt.phone}</div>
                        {appt.userId && (
                          <div className="text-[0.65rem] text-gray-400 mt-0.5 font-mono">{appt.userId}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Scheduled */}
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-800 text-sm font-medium">
                      <Calendar size={14} className="text-amber-500 shrink-0" />
                      {formatDateTime(appt.dateTime)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 pl-5">
                      Booked: {new Date(appt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  {/* Branch */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold font-cinzel">
                      {appt.branch}
                    </span>
                  </td>

                  {/* Services */}
                  <td className="p-4 text-sm text-gray-600 max-w-[200px]">
                    <ul className="list-disc pl-4 space-y-1.5">
                      {appt.items.map((item, i) => {
                        const count = item.peopleCount || item.quantity || 1;
                        return (
                          <li key={i} style={{ fontSize: '13px', color: '#111', fontWeight: 500 }}>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-xs text-gray-500 font-medium">
                              Service For: {count} {count === 1 ? 'Person' : 'People'}
                              <span className="ml-1 text-gray-400">(₹{item.price} each)</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {appt.status === 'Completed' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-bold font-cinzel w-fit">
                        <CheckCircle size={12} />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold font-cinzel w-fit">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="p-4 text-right">
                    <div className="font-bold text-gray-900 text-base font-cinzel">
                      ₹{Number(appt.total).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">💵 Cash</div>
                  </td>

                  {/* Action */}
                  <td className="p-4 pr-6 text-center">
                    {appt.status === 'Pending' ? (
                      <button
                        onClick={() => handleMarkCompleted(appt._id)}
                        disabled={updatingId === appt._id}
                        className="px-4 py-2 rounded-lg text-xs font-bold font-cinzel uppercase tracking-wide transition-all shadow-sm disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #D4AF37, #C9A227)',
                          color: '#fff',
                          border: 'none',
                          boxShadow: '0 2px 8px rgba(212,175,55,0.25)'
                        }}
                      >
                        {updatingId === appt._id ? 'Saving...' : '✓ Mark Completed'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-cormorant italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalkInAppointments;
