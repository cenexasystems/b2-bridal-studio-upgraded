import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const HOUR_LABELS = { '10':'10 AM','11':'11 AM','12':'12 PM','13':'1 PM','14':'2 PM','15':'3 PM','16':'4 PM','17':'5 PM','18':'6 PM','19':'7 PM' };

const formatScheduled = (dateTime) => {
  if (!dateTime) return null;
  try {
    const d = new Date(dateTime);
    const datePart = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const hour = String(d.getHours());
    const timePart = HOUR_LABELS[hour] || d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} – ${timePart}`;
  } catch { return dateTime; }
};

const statusBadge = (status) => {
  const styles = {
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Approved: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
  };
  return `px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${styles[status] || styles.Pending}`;
};

const PaymentVerification = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [proofModal, setProofModal] = useState(null);
  const intervalRef = useRef(null);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/api/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchBookings, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleAccept = async (id) => {
    if (!window.confirm('Accept this booking?')) return;
    try {
      await axios.patch(`${API}/api/bookings/${id}/accept`);
      fetchBookings();
    } catch (err) {
      alert('Failed to accept booking');
    }
  };

  const handleGenerateBill = async (id) => {
    const paymentMethod = window.prompt('Enter Payment Method (cash, upi, card):', 'upi');
    if (!paymentMethod) return;
    const pm = paymentMethod.toLowerCase().trim();
    if (!['cash', 'upi', 'card'].includes(pm)) {
      alert('Invalid payment method. Please enter cash, upi, or card.');
      return;
    }

    try {
      const res = await axios.post(`${API}/api/billing/generate-from-booking/${id}`, { paymentMethod: pm }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      if (res.data.revenueCreated === false) {
        alert('Bill generated, but revenue update failed');
      } else {
        alert('Bill generated successfully!');
      }
      fetchBookings();
    } catch (err) {
      alert('Failed to generate bill: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this booking?')) return;
    try {
      await axios.patch(`${API}/api/bookings/${id}/reject`);
      fetchBookings();
    } catch (err) {
      alert('Failed to reject booking');
    }
  };

  const sendWhatsApp = (booking) => {
    const phone = '91' + booking.phone;
    const billUrl = `${window.location.origin}/bill/${booking.billId}`;
    const message = encodeURIComponent(`Your bill is ready:\n${billUrl}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="text-center py-10">Loading bookings...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold admin-heading">Payment Verification</h2>
        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${filter === f ? 'bg-black text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f} {f !== 'All' ? `(${bookings.filter(b => b.status === f).length})` : `(${bookings.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Items</th>
                <th className="p-4">Transaction</th>
                <th className="p-4">Proof</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No bookings found.</td></tr>
              ) : filtered.map(b => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-medium text-gray-900">{b.name}</div>
                    <div className="text-xs text-gray-500">{b.phone}</div>
                    {b.dateTime && (
                      <div className="text-xs text-indigo-600 mt-1 font-medium">
                        📅 {formatScheduled(b.dateTime)}
                      </div>
                    )}
                    {b.couponCode && (
                      <div className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                        <Tag size={12} /> {b.couponCode} (-₹{b.discountAmount})
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">{b.branch}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {b.items.map((item, i) => (
                        <li key={i} className="text-xs">{item.name} <span className="text-gray-400">(₹{item.price})</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-mono text-gray-600">{b.transactionId}</div>
                    <div className="text-xs text-gray-400">{b.upiId}</div>
                  </td>
                  <td className="p-4">
                    {b.paymentProof ? (
                      <button
                        onClick={() => setProofModal(`${API}/uploads/${b.paymentProof}`)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                      >
                        View Proof
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">₹{b.total.toFixed(2)}</div>
                  </td>
                  <td className="p-4">
                    <span className={statusBadge(b.status)}>{b.status}</span>
                  </td>
                  <td className="p-4 pr-6">
                    {b.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(b._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                          Accept
                        </button>
                        <button onClick={() => handleReject(b._id)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">
                          Reject
                        </button>
                      </div>
                    ) : b.status === 'Approved' && !b.billId ? (
                      <button onClick={() => handleGenerateBill(b._id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Generate Bill
                      </button>
                    ) : (b.status === 'Completed' || b.billId) ? (
                      <div className="flex gap-2">
                        <a href={`/bill/${b.billId}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                          View Bill
                        </a>
                        <button onClick={() => sendWhatsApp(b)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors">
                          Send to Customer
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Proof Modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-xl p-4 max-w-lg max-h-[80vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900">Payment Proof</h3>
              <button onClick={() => setProofModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {proofModal.endsWith('.pdf') ? (
              <iframe src={proofModal} className="w-full h-96" title="Payment Proof" />
            ) : (
              <img src={proofModal} alt="Payment Proof" className="w-full rounded" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
