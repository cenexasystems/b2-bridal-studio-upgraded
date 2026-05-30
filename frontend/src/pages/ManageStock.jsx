import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Boxes, Plus, Trash2, X, Minus, Eye, 
  User, Layers, FileText, BarChart3, AlertTriangle, 
  TrendingDown, CheckCircle, Calendar, Tag
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const ManageStock = () => {
  const [stocks, setStocks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'reports'

  // Modal States
  const [usageModalProduct, setUsageModalProduct] = useState(null);
  const [usageForm, setUsageForm] = useState({
    quantity: '',
    staffId: '',
    serviceLinked: ''
  });

  // Stock Intake Form State
  const [form, setForm] = useState({
    productName: '',
    purchaseDate: '',
    totalQuantity: ''
  });

  // 📥 Fetch all data
  const fetchData = async () => {
    try {
      const [stockRes, staffRes] = await Promise.all([
        axios.get(`${API}/api/stock`),
        axios.get(`${API}/api/staff`)
      ]);
      setStocks(stockRes.data);
      setStaffList(staffRes.data);
    } catch (err) {
      console.error('Failed to fetch stock/staff data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ➕ Add product
  const handleAdd = async () => {
    if (!form.productName || !form.purchaseDate || !form.totalQuantity) {
      alert('Fill all fields');
      return;
    }

    if (isNaN(form.totalQuantity) || Number(form.totalQuantity) <= 0) {
      alert('Total Quantity must be a valid positive number');
      return;
    }

    try {
      await axios.post(`${API}/api/stock`, {
        productName: form.productName,
        purchaseDate: form.purchaseDate,
        totalQuantity: Number(form.totalQuantity)
      });
      setForm({
        productName: '',
        purchaseDate: '',
        totalQuantity: ''
      });
      fetchData();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  // ➖ Use product (consumption submission)
  const handleUseSubmit = async (e) => {
    e.preventDefault();
    if (!usageModalProduct) return;

    const qty = Number(usageForm.quantity);
    if (!usageForm.quantity || isNaN(qty) || qty <= 0) {
      alert('Enter a valid quantity');
      return;
    }

    if (qty > usageModalProduct.remainingQuantity) {
      alert('Not enough stock available');
      return;
    }

    if (!usageForm.staffId) {
      alert('Select the staff member who consumed this product');
      return;
    }

    // Find staff details
    const selectedStaff = staffList.find(s => s.staffId === usageForm.staffId || s._id === usageForm.staffId);
    if (!selectedStaff) {
      alert('Selected staff member is invalid');
      return;
    }

    try {
      await axios.post(`${API}/api/stock/${usageModalProduct._id}/use`, {
        usedQuantity: qty,
        usedByStaffId: selectedStaff.staffId || selectedStaff._id,
        staffName: selectedStaff.name,
        serviceLinked: usageForm.serviceLinked.trim()
      });

      // Clear states and refresh
      setUsageModalProduct(null);
      setUsageForm({ quantity: '', staffId: '', serviceLinked: '' });
      fetchData();
      
      // If currently viewing detailed product, update it
      if (selectedStock && selectedStock._id === usageModalProduct._id) {
        setSelectedStock(prev => ({
          ...prev,
          remainingQuantity: prev.remainingQuantity - qty,
          usageHistory: [
            ...prev.usageHistory,
            {
              usedQuantity: qty,
              usedByStaffId: selectedStaff.staffId || selectedStaff._id,
              staffName: selectedStaff.name,
              serviceLinked: usageForm.serviceLinked.trim(),
              date: new Date()
            }
          ]
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record stock usage');
    }
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock item?')) return;
    try {
      await axios.delete(`${API}/api/stock/${id}`);
      fetchData();
      if (selectedStock && selectedStock._id === id) {
        setSelectedStock(null);
      }
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  // 📊 Flattened Usage Records for comprehensive report
  const allUsageRecords = useMemo(() => {
    const list = [];
    stocks.forEach(stock => {
      (stock.usageHistory || []).forEach(use => {
        list.push({
          _id: use._id || `${stock._id}-${use.date}`,
          productId: stock._id,
          productName: stock.productName,
          quantityUsed: use.usedQuantity,
          staffId: use.usedByStaffId,
          staffName: use.staffName,
          dateUsed: use.date,
          serviceLinked: use.serviceLinked,
          remainingStock: stock.remainingQuantity
        });
      });
    });
    return list.sort((a, b) => new Date(b.dateUsed) - new Date(a.dateUsed));
  }, [stocks]);

  // Analytics helper stats
  const aggregateStats = useMemo(() => {
    let totalItems = stocks.length;
    let totalIntake = 0;
    let totalConsumed = 0;
    let lowStockCount = 0;

    stocks.forEach(s => {
      totalIntake += s.totalQuantity;
      totalConsumed += (s.totalQuantity - s.remainingQuantity);
      if (s.remainingQuantity < 5) {
        lowStockCount++;
      }
    });

    // Staff-wise consumption calculations
    const staffSummary = {};
    allUsageRecords.forEach(rec => {
      const name = rec.staffName || 'Unknown';
      staffSummary[name] = (staffSummary[name] || 0) + rec.quantityUsed;
    });

    return {
      totalItems,
      totalIntake,
      totalConsumed,
      lowStockCount,
      staffSummary: Object.entries(staffSummary).sort((a,b) => b[1] - a[1])
    };
  }, [stocks, allUsageRecords]);

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <Boxes size={24} className="text-[#D4AF37]" />
            Stock &amp; Inventory
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track studio supplies, log consumption, and analyze staff utilization.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'inventory' ? 'bg-[#111] text-amber-400 shadow-md' : 'text-gray-600 hover:text-gray-900 bg-transparent'
            }`}
          >
            <Layers size={14} /> Intake &amp; List
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'reports' ? 'bg-[#111] text-amber-400 shadow-md' : 'text-gray-600 hover:text-gray-900 bg-transparent'
            }`}
          >
            <BarChart3 size={14} /> Consumption Reports
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          INVENTORY INTAKE & MANAGEMENT TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div className="space-y-8">
          
          {/* ADD INVENTORY FORM */}
          <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <h3 className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Record New Stock Intake</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase tracking-wider text-gray-500">Product Name <span className="text-amber-600">*</span></label>
                <input
                  placeholder="e.g. L'Oreal Hair Color, Organic Shampoos..."
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Purchase Date <span className="text-amber-600">*</span></label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase tracking-wider text-gray-500">Intake Quantity <span className="text-amber-600">*</span></label>
                <input
                  placeholder="e.g. 50"
                  value={form.totalQuantity}
                  onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg bg-[#111] text-white">
                <Plus size={16} className="text-[#FFD700]" /> Add Product Stock
              </button>
            </div>
          </div>

          {/* INVENTORY LIST GRID */}
          <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Product Name</th>
                    <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Purchase Date</th>
                    <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Intake Total</th>
                    <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Remaining</th>
                    <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Log Usage</th>
                    <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Logs</th>
                    <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stocks.length === 0 ? (
                    <tr><td colSpan="7" className="p-10 text-center text-gray-500 font-cormorant italic text-lg">No products catalogued.</td></tr>
                  ) : stocks.map((item) => (
                    <tr key={item._id} className="hover:bg-[#FFFCF5] transition-colors">
                      <td className="p-4 pl-6 font-medium text-gray-900 font-playfair">{item.productName}</td>
                      <td className="p-4 text-gray-600 font-cormorant text-lg">
                        {new Date(item.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-gray-600 font-cormorant text-lg">{item.totalQuantity} units</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          item.remainingQuantity > 5 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : item.remainingQuantity > 0 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.remainingQuantity} remaining
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setUsageModalProduct(item);
                            setUsageForm({ quantity: '', staffId: '', serviceLinked: '' });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                          disabled={item.remainingQuantity <= 0}
                        >
                          <Minus size={12} /> Consume
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedStock(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={12} /> History
                        </button>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DETAILED STOCK PROFILE VIEW PANEL */}
          {selectedStock && (
            <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <h2 className="text-base font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-[#D4AF37]" /> Logged Stock Consumption History
                </h2>
                <button onClick={() => setSelectedStock(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                <div>
                  <div className="text-[0.65rem] font-cinzel font-bold uppercase tracking-wider text-gray-400">Product Name</div>
                  <div className="font-bold text-gray-900 font-playfair text-base mt-0.5">{selectedStock.productName}</div>
                </div>
                <div>
                  <div className="text-[0.65rem] font-cinzel font-bold uppercase tracking-wider text-gray-400">Purchase Date</div>
                  <div className="text-gray-700 font-cormorant text-lg mt-0.5">
                    {new Date(selectedStock.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="text-[0.65rem] font-cinzel font-bold uppercase tracking-wider text-gray-400">Total Intake</div>
                  <div className="text-gray-700 font-cormorant text-lg mt-0.5">{selectedStock.totalQuantity} units</div>
                </div>
                <div>
                  <div className="text-[0.65rem] font-cinzel font-bold uppercase tracking-wider text-gray-400">Current Balance</div>
                  <div className="font-bold text-amber-700 font-cinzel text-lg mt-0.5">{selectedStock.remainingQuantity} / {selectedStock.totalQuantity}</div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-cinzel font-bold text-xs uppercase tracking-wide mb-3 text-gray-600">Product Allocation Records</h3>
                {!selectedStock.usageHistory || selectedStock.usageHistory.length === 0 ? (
                  <p className="text-gray-500 font-cormorant italic text-lg py-4">No allocations logged for this product.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStock.usageHistory.map((u, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 px-4 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold font-mono">{u.usedQuantity}</span>
                          <div>
                            <div className="font-medium text-gray-900">Allocated to: {u.staffName} <span className="font-mono text-xs text-amber-600 font-bold">({u.usedByStaffId})</span></div>
                            {u.serviceLinked && (
                              <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                                <Tag size={12} /> Service Linked: {u.serviceLinked}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-mono font-semibold flex items-center gap-1.5">
                          <Calendar size={12} /> {new Date(u.date).toLocaleDateString('en-IN')} @ {new Date(u.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════
          CONSUMPTION REPORTS & UTILIZATION ANALYTICS TAB
      ══════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
          
          {/* OVERALL KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="text-[0.65rem] font-cinzel font-bold text-gray-400 uppercase tracking-wider mb-1">Catalogued Products</div>
              <div className="text-2xl font-bold text-gray-900 font-cinzel">{aggregateStats.totalItems} Items</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="text-[0.65rem] font-cinzel font-bold text-gray-400 uppercase tracking-wider mb-1">Total Stock Intake</div>
              <div className="text-2xl font-bold text-gray-900 font-cinzel">{aggregateStats.totalIntake} Units</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="text-[0.65rem] font-cinzel font-bold text-gray-400 uppercase tracking-wider mb-1">Total Stock Consumed</div>
              <div className="text-2xl font-bold text-gray-900 font-cinzel">{aggregateStats.totalConsumed} Units</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-amber-500">
              <div className="text-[0.65rem] font-cinzel font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlertTriangle size={12} /> Low Stock Alerts</div>
              <div className="text-2xl font-bold text-amber-700 font-cinzel">{aggregateStats.lowStockCount} Products</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PRODUCT ALLOCATION HISTORY LIST */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h3 className="text-sm font-cinzel font-bold uppercase tracking-wider mb-5 pb-3 border-b border-gray-100">Stock Usage Audit Log</h3>
              {allUsageRecords.length === 0 ? (
                <p className="text-center font-cormorant italic text-gray-500 py-12">No stock consumption logs logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="pb-3 text-xs font-cinzel uppercase font-bold">Product</th>
                        <th className="pb-3 text-xs font-cinzel uppercase font-bold text-center">Qty</th>
                        <th className="pb-3 text-xs font-cinzel uppercase font-bold">Staff Member</th>
                        <th className="pb-3 text-xs font-cinzel uppercase font-bold">Date Used</th>
                        <th className="pb-3 text-xs font-cinzel uppercase font-bold pr-4 text-right">Linked Service</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-cormorant text-base">
                      {allUsageRecords.map(rec => (
                        <tr key={rec._id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-playfair font-bold text-gray-900">{rec.productName}</td>
                          <td className="py-3 text-center font-mono font-bold text-amber-700">{rec.quantityUsed}</td>
                          <td className="py-3 font-sans text-xs">
                            <div className="font-bold text-gray-800">{rec.staffName}</div>
                            <div className="text-gray-400 font-mono text-[0.65rem]">{rec.staffId}</div>
                          </td>
                          <td className="py-3 font-sans text-xs text-gray-500">
                            {new Date(rec.dateUsed).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 text-right pr-4 text-xs font-sans text-gray-600 font-medium">
                            {rec.serviceLinked ? (
                              <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200/50 rounded font-semibold text-[0.65rem]">{rec.serviceLinked}</span>
                            ) : (
                              <span className="text-gray-300 font-medium">Studio General</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* STAFF-WISE CONSUMPTION ANALYTICS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
              <h3 className="text-sm font-cinzel font-bold uppercase tracking-wider mb-5 pb-3 border-b border-gray-100">Staff Stock utilization</h3>
              {aggregateStats.staffSummary.length === 0 ? (
                <p className="text-center font-cormorant italic text-gray-500 py-12">No usage logs to summarize.</p>
              ) : (
                <div className="space-y-4 py-2">
                  {aggregateStats.staffSummary.map(([name, qty]) => {
                    const totalQty = aggregateStats.totalConsumed || 1;
                    const percent = Math.round((qty / totalQty) * 100);
                    return (
                      <div key={name} className="space-y-1">
                        <div className="flex justify-between items-end text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="font-cinzel font-bold text-gray-800">{name}</span>
                          </div>
                          <span className="font-medium text-gray-600">{qty} units ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ➖ RECORD PRODUCT CONSUMPTION MODAL */}
      {usageModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setUsageModalProduct(null)} 
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold font-cinzel uppercase tracking-wide text-gray-900 mb-2 flex items-center gap-2">
              <Minus size={20} className="text-amber-600" /> Record Consumption
            </h2>
            <p className="text-xs text-gray-500 font-cinzel mb-6 pb-2 border-b border-gray-100">
              Log supply utilization for <strong>{usageModalProduct.productName}</strong>
            </p>

            <form onSubmit={handleUseSubmit} className="space-y-5">
              
              {/* Product Info displays */}
              <div className="flex justify-between text-xs p-3 rounded-lg bg-amber-50/20 border border-amber-200/30">
                <span className="font-cinzel font-semibold text-amber-800">Remaining Balance:</span>
                <span className="font-bold text-amber-800 font-mono">{usageModalProduct.remainingQuantity} / {usageModalProduct.totalQuantity} units</span>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase text-gray-700">Quantity to Consume <span className="text-amber-600">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={usageForm.quantity}
                  onChange={e => setUsageForm({ ...usageForm, quantity: e.target.value })}
                  min="1"
                  max={usageModalProduct.remainingQuantity}
                  className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Used by Staff */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase text-gray-700">Used By Staff Member <span className="text-amber-600">*</span></label>
                <select
                  value={usageForm.staffId}
                  onChange={e => setUsageForm({ ...usageForm, staffId: e.target.value })}
                  className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                  required
                >
                  <option value="">-- Select Team Member --</option>
                  {staffList.map(s => (
                    <option key={s._id} value={s.staffId || s._id}>{s.name} ({s.staffId || 'N/A'})</option>
                  ))}
                </select>
              </div>

              {/* Linked Service */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase text-gray-700">Linked Salon Service <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Hair Coloring, Facial treatment..."
                  value={usageForm.serviceLinked}
                  onChange={e => setUsageForm({ ...usageForm, serviceLinked: e.target.value })}
                  className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUsageModalProduct(null)}
                  className="flex-1 py-3 px-4 bg-transparent border border-gray-200 text-gray-600 font-cinzel text-xs font-bold uppercase rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#111] text-white font-cinzel text-xs font-bold uppercase rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Log Usage
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageStock;