import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Trash2, FileText, CheckCircle, Printer, Download, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = import.meta.env.VITE_API_URL;

/* ─── helpers ────────────────────────────────────────────────── */
const token = () => localStorage.getItem('adminToken');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

export default function Billing() {
  /* catalogue */
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCat, setLoadingCat] = useState(false);

  /* current selection */
  const [category, setCategory] = useState('services'); // 'services' | 'other'
  const [selectedItem, setSelectedItem] = useState('');
  const [qty, setQty] = useState(1);

  /* custom item form */
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  /* bill */
  const [billItems, setBillItems] = useState([]);
  const [source, setSource] = useState('offline');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customer, setCustomer] = useState('Walk-in');

  /* ui state */
  const [generating, setGenerating] = useState(false);
  const [successBill, setSuccessBill] = useState(null); // { bill, revenueCreated }
  const [error, setError] = useState('');

  /* ─── fetch catalogue ──────────────────────────────────────── */
  const fetchCatalogue = useCallback(async () => {
    setLoadingCat(true);
    try {
      const [sRes, pRes] = await Promise.all([
        fetch(`${API}/api/services`),
        fetch(`${API}/api/products`),
      ]);
      setServices(await sRes.json());
      setProducts(await pRes.json());
    } catch {
      setError('Failed to load catalogue. Is the server running?');
    } finally {
      setLoadingCat(false);
    }
  }, []);

  useEffect(() => { fetchCatalogue(); }, [fetchCatalogue]);

  /* ─── current catalogue list ───────────────────────────────── */
  const catalogueItems = category === 'services'
    ? services.flatMap(svc =>
        svc.options && svc.options.length > 0
          ? svc.options.map(opt => ({ id: `${svc._id}-${opt._id}`, name: `${svc.name} — ${opt.name}`, price: opt.price, itemType: 'service', gstPercentage: svc.gstPercentage || 0 }))
          : svc.price ? [{ id: svc._id, name: svc.name, price: svc.price, itemType: 'service', gstPercentage: svc.gstPercentage || 0 }] : []
      )
    : products.map(p => ({ id: p._id, name: p.name, price: p.price, itemType: 'product', gstPercentage: 0 }));

  /* ─── add custom item to bill ───────────────────────────────── */
  const handleAddCustomItem = () => {
    const name = customName.trim();
    const price = Number(customPrice);
    if (!name || !price || price <= 0) return;
    const customId = `custom-${Date.now()}`;
    setBillItems(prev => [...prev, { id: customId, name, price, quantity: 1, itemType: 'other', gstPercentage: 0 }]);
    setCustomName('');
    setCustomPrice('');
    setShowCustomForm(false);
  };

  /* ─── add item to bill ─────────────────────────────────────── */
  const handleAddItem = () => {
    if (!selectedItem) return;
    const found = catalogueItems.find(i => i.id === selectedItem);
    if (!found) return;

    setBillItems(prev => {
      const existing = prev.findIndex(i => i.id === found.id);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + qty };
        return updated;
      }
      return [...prev, { ...found, quantity: qty }];
    });
    setSelectedItem('');
    setQty(1);
  };

  /* ─── remove item ──────────────────────────────────────────── */
  const removeItem = (id) => setBillItems(prev => prev.filter(i => i.id !== id));

  /* ─── totals ───────────────────────────────────────────────── */
  const calculatedTotals = billItems.reduce((acc, item) => {
    const qty = item.quantity || 1;
    const finalPrice = item.price * qty;
    const gstPercent = item.gstPercentage || 0;
    if (item.itemType === 'service' && gstPercent > 0) {
      const base = finalPrice / (1 + gstPercent / 100);
      acc.subtotal += base;
      acc.gst += (finalPrice - base);
    } else {
      acc.subtotal += finalPrice;
    }
    acc.total += finalPrice;
    return acc;
  }, { subtotal: 0, gst: 0, total: 0 });

  const subtotalBase = Math.round(calculatedTotals.subtotal * 100) / 100;
  const gstAmount = Math.round(calculatedTotals.gst * 100) / 100;
  const total = Math.round(calculatedTotals.total * 100) / 100;

  /* ─── generate bill ────────────────────────────────────────── */
  const handleGenerateBill = async () => {
    if (billItems.length === 0) { setError('Add at least one item before generating a bill.'); return; }
    setError('');
    setGenerating(true);
    try {
      const payload = {
        items: billItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, itemType: i.itemType, gstPercentage: i.gstPercentage || 0 })),
        subtotal: subtotalBase,
        gst: gstAmount,
        total,
        source,
        paymentMethod,
        customer: customer.trim() || 'Walk-in',
      };

      const res = await fetch(`${API}/api/billing/offline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await res.json();
      
      // If it's the old API response format (just the bill) or new format { success, bill, revenueCreated }
      const bill = data.bill || data;
      const revenueCreated = data.revenueCreated !== false;

      setSuccessBill({ bill, revenueCreated });
      generatePDF(bill);
      setBillItems([]);
      setCustomer('Walk-in');
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  /* ─── PDF generation ───────────────────────────────────────── */
  const generatePDF = (bill) => {
    const doc = new jsPDF();

    // Black header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setTextColor(201, 162, 39);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('B2 Bridal Studio', 105, 18, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 160, 120);
    doc.text('Premium Beauty & Artistry', 105, 27, { align: 'center' });
    doc.setTextColor(140, 130, 110);
    doc.text('Offline Bill', 105, 35, { align: 'center' });

    // Bill meta
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    const billNo = bill._id.slice(-8).toUpperCase();
    const billDate = new Date(bill.date || bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Bill #${billNo}`, 15, 54);
    doc.text(`Date: ${billDate}`, 15, 62);
    doc.text(`Source: ${bill.source}`, 15, 70);
    doc.text(`Payment: ${bill.paymentMethod}`, 15, 78);
    doc.text(`Customer: ${bill.customer || 'Walk-in'}`, 120, 54);

    // Items table
    const tableData = bill.items.map((item, i) => [
      i + 1,
      item.name,
      item.quantity || 1,
      `Rs.${item.price.toFixed(2)}`,
      `Rs.${(item.price * (item.quantity || 1)).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['#', 'Item', 'Qty', 'Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [20, 20, 20], textColor: [201, 162, 39], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [250, 248, 244] },
      margin: { left: 15, right: 15 },
    });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    let cursorY = finalY + 6;
    if (bill.gst && bill.gst > 0) {
      doc.text(`Service Total: Rs.${bill.subtotal.toFixed(2)}`, 193, cursorY, { align: 'right' });
      cursorY += 6;
      doc.text(`GST Included: Rs.${bill.gst.toFixed(2)}`, 193, cursorY, { align: 'right' });
      cursorY += 6;
    }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(`Total: Rs.${bill.total.toFixed(2)}`, 193, cursorY + 2, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(160, 160, 160);
    doc.text('Thank you for choosing B2 Bridal Studio', 105, 282, { align: 'center' });

    doc.save(`B2-Bill-${billNo}.pdf`);
  };

  const handlePrint = (bill) => {
    const printWin = window.open(`/bill/${bill._id}`, '_blank');
    if (printWin) printWin.focus();
  };

  /* ─── render ───────────────────────────────────────────────── */
  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
          <ShoppingCart size={24} className="text-[#D4AF37]" />
          Offline Billing
        </h1>
        <p className="text-sm text-gray-600 mt-1">B2 Bridal Studio — Generate walk-in bills instantly</p>
      </div>

      {/* Success/Warning banner */}
      {successBill && (
        <div className={`mb-6 border rounded-xl p-4 flex items-start gap-3 ${successBill.revenueCreated ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <CheckCircle className={`${successBill.revenueCreated ? 'text-green-500' : 'text-yellow-500'} mt-0.5 shrink-0`} size={20} />
          <div className="flex-1">
            <p className={`font-semibold ${successBill.revenueCreated ? 'text-green-800' : 'text-yellow-800'}`}>
              {successBill.revenueCreated ? 'Bill generated successfully!' : 'Bill generated, but revenue update failed'}
            </p>
            <p className={`text-sm mt-0.5 ${successBill.revenueCreated ? 'text-green-600' : 'text-yellow-700'}`}>
              Bill #{successBill.bill._id.slice(-8).toUpperCase()} — {successBill.revenueCreated ? 'Revenue updated.' : 'Revenue entry was not created due to an error.'}
            </p>
            <div className="flex gap-3 mt-3 flex-wrap">
              <a
                href={`/bill/${successBill.bill._id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wide bg-[#111] text-white transition-all hover:shadow-md"
              >
                <FileText size={14} /> View Bill
              </a>
              <button
                onClick={() => generatePDF(successBill.bill)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wide border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={() => handlePrint(successBill.bill)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wide border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Printer size={14} /> Print
              </button>
              <button onClick={() => setSuccessBill(null)} className="ml-auto text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex justify-between items-center font-medium">
          {error}
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Item picker ─────────────────────────────── */}
        <div className="space-y-4">

          {/* Bill info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <h3 className="font-cinzel font-bold text-gray-900 text-sm uppercase tracking-wide pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Bill Details</h3>

            <div>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">Customer Name</label>
              <input
                id="billing-customer"
                type="text"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                placeholder="Walk-in"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">Source</label>
              <select
                id="billing-source"
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">Payment Method</label>
              <select
                id="billing-payment-method"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          {/* Category + item picker */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <h3 className="font-cinzel font-bold text-gray-900 text-sm uppercase tracking-wide pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Add Items</h3>

            {/* Category tabs */}
            <div className="flex gap-2">
              {['services', 'other'].map(cat => (
                <button
                  key={cat}
                  id={`billing-cat-${cat}`}
                  onClick={() => { setCategory(cat === 'other' ? 'products' : cat); setSelectedItem(''); setShowCustomForm(false); }}
                  className={`flex-1 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide transition-all capitalize ${
                    (cat === 'other' ? category === 'products' : category === cat)
                      ? 'bg-[#111] text-amber-400 shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Item dropdown */}
            {loadingCat ? (
              <div className="text-center py-4 text-sm text-gray-600 font-cormorant italic">Loading catalogue…</div>
            ) : (
              <select
                id="billing-item-select"
                value={selectedItem}
                onChange={e => setSelectedItem(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors"
              >
                <option value="">— Select {category === 'services' ? 'a service' : 'a product'} —</option>
                {catalogueItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} — ₹{item.price}
                  </option>
                ))}
              </select>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">Quantity</label>
                <input
                  id="billing-qty"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors"
                />
              </div>
              <button
                id="billing-add-btn"
                onClick={handleAddItem}
                disabled={!selectedItem}
                className="flex items-center gap-1.5 px-5 py-2.5 mt-6 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide bg-[#111] text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} className="text-[#FFD700]" /> Add
              </button>
            </div>

            {/* Custom Item — only in Other tab */}
            {category === 'products' && (
              <div className="pt-3 border-t border-gray-100">
                {!showCustomForm ? (
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="flex items-center gap-2 text-xs font-cinzel font-bold tracking-wide text-[#B8860B] hover:text-gray-900 uppercase transition-colors"
                  >
                    <Plus size={14} /> Add Custom Item
                  </button>
                ) : (
                  <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200/60 space-y-3" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-gray-800">Custom Item</span>
                      <button onClick={() => { setShowCustomForm(false); setCustomName(''); setCustomPrice(''); }} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        placeholder="e.g. Hair Extension Clips"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 text-sm transition-colors"
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          min={1}
                          value={customPrice}
                          onChange={e => setCustomPrice(e.target.value)}
                          placeholder="e.g. 350"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 text-sm transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleAddCustomItem}
                        disabled={!customName.trim() || !customPrice || Number(customPrice) <= 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #D4AF37, #C9A227)', color: '#fff' }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Bill preview ───────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] flex flex-col">
          {/* Bill header */}
          <div className="bg-[#111] text-center py-5 rounded-t-xl">
            <p className="text-amber-400 font-cinzel font-bold tracking-wide text-sm uppercase">B2 Bridal Studio</p>
            <p className="text-amber-200/60 text-xs mt-0.5 font-cormorant italic">Offline Bill Preview</p>
          </div>

          {/* Items list */}
          <div className="flex-1 p-5">
            {billItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ShoppingCart size={40} strokeWidth={1.2} />
                <p className="text-sm mt-3 font-medium text-gray-600">No items added yet</p>
                <p className="text-xs mt-1 text-gray-500">Select a category and add items</p>
              </div>
            ) : (
              <div className="space-y-2">
                {billItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        ₹{item.price} × {item.quantity}
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 capitalize text-[0.65rem] font-medium">{item.itemType}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="font-bold text-gray-900 text-sm whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total + generate */}
          <div className="border-t border-gray-100 p-5">
            {gstAmount > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-gray-500">Service Total</span>
                  <span className="text-sm font-semibold text-gray-900">₹{subtotalBase.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-gray-500">GST Included</span>
                  <span className="text-sm font-semibold text-gray-900">₹{gstAmount.toLocaleString()}</span>
                </div>
              </>
            ) : null}
            <div className="flex justify-between items-center mb-4 pt-2" style={{ borderTop: gstAmount > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <span className="text-sm font-cinzel font-bold uppercase tracking-wide text-gray-700">Total</span>
              <span className="text-2xl font-bold text-gray-900 font-cinzel">₹{total.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
              <span>Source: <strong className="text-gray-900 capitalize">{source}</strong> | Payment: <strong className="text-gray-900 capitalize">{paymentMethod}</strong></span>
              <span>Customer: <strong className="text-gray-900">{customer || 'Walk-in'}</strong></span>
            </div>
            <button
              id="billing-generate-btn"
              onClick={handleGenerateBill}
              disabled={billItems.length === 0 || generating}
              className="w-full py-3.5 rounded-xl font-cinzel text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #C9A227)', color: '#fff', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Bill
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
