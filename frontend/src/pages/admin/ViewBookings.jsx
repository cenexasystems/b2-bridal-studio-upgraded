import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, ShoppingBag, Receipt } from 'lucide-react';
const API = import.meta.env.VITE_API_URL;
const ViewBookings = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBills = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await axios.get(`${API}/api/billing`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBills(res.data);
      } catch (err) {
        setError('Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
          <Receipt size={24} className="text-[#D4AF37]" />
          Bookings & Bills
        </h1>
        <p className="text-sm text-gray-600 mt-1">View all generated bills and booking records.</p>
      </div>

      {error && <div className="text-red-500 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-cormorant">{error}</div>}

      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Date</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Customer</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Items/Services</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Type</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bills.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-500 font-cormorant italic text-lg">No bookings found.</td></tr>
              ) : bills.map((bill) => (
                <tr key={bill._id} className="hover:bg-[#FFFCF5] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Calendar size={16} className="text-amber-600" />
                      {new Date(bill.date).toLocaleDateString()}
                    </div>
                    {bill.customerDetails?.date && (
                      <div className="text-xs text-gray-500 mt-1 pl-6">
                        Scheduled: {bill.customerDetails.date} at {bill.customerDetails.time}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-900 font-playfair">
                      <User size={16} className="text-gray-400" />
                      {bill.customerDetails?.name || 'Walk-in / Unknown'}
                    </div>
                    {bill.customerDetails?.phone && (
                      <div className="text-xs text-gray-500 pl-6 font-cormorant">{bill.customerDetails.phone}</div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <ul className="list-disc pl-4 space-y-1 font-cormorant">
                      {bill.items.map((item, i) => (
                        <li key={i}>{item.name} <span className="text-gray-400">(₹{item.price})</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      bill.type === 'service' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      bill.type === 'product' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {bill.type}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="font-bold text-gray-900 text-lg font-cinzel">₹{bill.total.toFixed(2)}</div>
                    {bill.couponCode && bill.discountAmount > 0 && (
                      <div className="text-xs text-green-600 mt-1 font-medium">
                        🏷️ {bill.couponCode} (-₹{bill.discountAmount.toFixed(2)})
                      </div>
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

export default ViewBookings;
