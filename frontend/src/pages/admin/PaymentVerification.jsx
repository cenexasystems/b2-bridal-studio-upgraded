import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Tag, CreditCard, X } from 'lucide-react';

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
    Pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    Approved:  'bg-green-50 text-green-700 border-green-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Rejected:  'bg-red-50 text-red-700 border-red-200',
  };
  return `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status] || styles.Pending}`;
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
    // Online bookings are always paid via UPI — no prompt needed
    try {
      const res = await axios.post(
        `${API}/api/billing/generate-from-booking/${id}`,
        { paymentMethod: 'upi' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      alert(res.data.success ? 'Bill generated successfully!' : 'Bill generation failed. Please try again.');
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

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <CreditCard size={24} className="text-[#D4AF37]" />
            Payment Verification
          </h1>
          <p className="text-sm text-gray-600 mt-1">Review and manage incoming payments.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-cinzel font-bold uppercase tracking-wide rounded-lg transition-all ${
                filter === f 
                  ? 'bg-[#111] text-amber-400 shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f} {f !== 'All' ? `(${bookings.filter(b => b.status === f).length})` : `(${bookings.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Customer</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Branch</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Items</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Transaction</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Proof</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Total</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Status</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="p-10 text-center text-gray-500 font-cormorant italic text-lg">No bookings found.</td></tr>
              ) : filtered.map(b => (
                <tr key={b._id} className="hover:bg-[#FFFCF5] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-medium text-gray-900 font-playfair">{b.name}</div>
                    <div className="text-[0.8rem] font-semibold text-gray-600 font-cormorant mt-0.5">{b.phone}</div>
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
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{b.branch}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <ul className="list-disc pl-4 space-y-1.5 font-cormorant">
                      {b.items.map((item, i) => (
                        <li key={i} className="text-[0.85rem] font-medium text-gray-700">
                          {item.name} <span className="text-xs font-semibold text-gray-500 ml-1">(₹{item.price})</span>
                        </li>
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
                        onClick={() => setProofModal(b.paymentProof.startsWith('data:') ? b.paymentProof : `${API}/uploads/${b.paymentProof}`)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                      >
                        View Proof
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900 font-cinzel">₹{(b.finalAmount ?? b.total).toFixed(2)}</div>
                    {b.couponCode && (
                      <div className="text-xs text-gray-400 line-through">₹{b.total.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={statusBadge(b.status)}>{b.status}</span>
                  </td>
                  <td className="p-4 pr-6">
                    {b.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(b._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">
                          Accept
                        </button>
                        <button onClick={() => handleReject(b._id)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
                          Reject
                        </button>
                      </div>
                    ) : b.status === 'Approved' && !b.billId ? (
                      <button onClick={() => handleGenerateBill(b._id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Generate Bill
                      </button>
                    ) : (b.status === 'Completed' || b.billId) ? (
                      <div className="flex gap-2">
                        <a href={`/bill/${b.billId}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                          View Bill
                        </a>
                        <button onClick={() => sendWhatsApp(b)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">
                          Send
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-auto shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 font-cinzel uppercase tracking-wide">Payment Proof</h3>
              <button onClick={() => setProofModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            {(proofModal.startsWith('data:application/pdf') || proofModal.endsWith('.pdf')) ? (
              <iframe src={proofModal} className="w-full h-96 rounded-lg" title="Payment Proof" />
            ) : (
              <img 
                src={proofModal} 
                alt="Payment Proof" 
                className="w-full h-auto object-contain rounded-lg shadow-sm" 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
