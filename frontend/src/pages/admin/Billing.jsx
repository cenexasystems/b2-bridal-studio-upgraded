import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, Plus, Trash2, FileText, CheckCircle, Printer, Download, X, Send, Search, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  /* ui state */
  const [generating, setGenerating] = useState(false);
  const [successBill, setSuccessBill] = useState(null); // { bill, revenueCreated }
  const [error, setError] = useState('');

  /* discount states */
  const [discountType, setDiscountType] = useState('none'); // 'none' | 'coupon' | 'manual'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCouponValidating, setIsCouponValidating] = useState(false);
  const [manualDiscount, setManualDiscount] = useState('');


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
          ? svc.options.map(opt => ({ id: `${svc._id}-${opt._id}`, name: `${svc.name} — ${opt.name}`, price: opt.price, itemType: 'service', gstPercentage: svc.gstPercentage || 0, category: svc.category || 'Uncategorized' }))
          : svc.price ? [{ id: svc._id, name: svc.name, price: svc.price, itemType: 'service', gstPercentage: svc.gstPercentage || 0, category: svc.category || 'Uncategorized' }] : []
      )
    : products.map(p => ({ id: p._id, name: p.name, price: p.price, itemType: 'product', gstPercentage: 0, category: 'Products' }));

  /* ─── custom select states ─────────────────────────────────── */
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const dropdownRef = useRef(null);

  // Group items by category
  const filteredCatalogue = catalogueItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = filteredCatalogue.reduce((groups, item) => {
    const cat = item.category || 'Uncategorized';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(item);
    return groups;
  }, {});

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Expand categories by default on first load or when switching categories
  useEffect(() => {
    const initialExpanded = {};
    catalogueItems.forEach(item => {
      initialExpanded[item.category] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [category, services, products]);

  const toggleCategory = (catName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

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

  // Reset or adjust manual discount if it exceeds new originalTotal
  useEffect(() => {
    const totalRaw = billItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    if (discountType === 'manual' && Number(manualDiscount) > totalRaw) {
      setManualDiscount('');
      setCouponError('');
    }
  }, [billItems, discountType, manualDiscount]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    setIsCouponValidating(true);
    try {
      const res = await fetch(`${API}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invalid coupon code');
      }
      const data = await res.json();
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discountPercentage: data.discountPercentage
      });
      setCouponError('');
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setIsCouponValidating(false);
    }
  };


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

  const originalAmount = Math.round(calculatedTotals.total * 100) / 100;
  
  let discountAmount = 0;
  if (discountType === 'coupon' && appliedCoupon) {
    discountAmount = Math.round((originalAmount * appliedCoupon.discountPercentage / 100) * 100) / 100;
  } else if (discountType === 'manual' && manualDiscount) {
    discountAmount = Number(manualDiscount) || 0;
  }

  const discountRatio = originalAmount > 0 ? (originalAmount - discountAmount) / originalAmount : 1;
  const subtotalBase = Math.round(calculatedTotals.subtotal * discountRatio * 100) / 100;
  const gstAmount = Math.round(calculatedTotals.gst * discountRatio * 100) / 100;
  const finalTotal = Math.round((originalAmount - discountAmount) * 100) / 100;


  /* ─── generate bill ────────────────────────────────────────── */
  const handleGenerateBill = async () => {
    if (billItems.length === 0) { setError('Add at least one item before generating a bill.'); return; }
    if (!customer.trim()) { setError('Customer name is required.'); return; }
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    
    // Clean and validate 10-digit number
    const cleanedPhone = phone.trim().replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setError('');
    setGenerating(true);
    try {
      const payload = {
        items: billItems.map(i => ({ 
          name: i.name, 
          price: i.price, 
          quantity: i.quantity, 
          peopleCount: i.itemType === 'service' ? i.quantity : 1,
          itemType: i.itemType, 
          gstPercentage: i.gstPercentage || 0 
        })),
        subtotal: subtotalBase,
        gst: gstAmount,
        total: finalTotal,
        source,
        paymentMethod,
        customer: customer.trim(),
        phone: cleanedPhone,
        dob: dob || undefined,
        originalAmount,
        discountType,
        couponCode: discountType === 'coupon' && appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount,
        finalAmountPaid: finalTotal
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
      setBillItems([]);
      setCustomer('');
      setPhone('');
      setDob('');
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const sendWhatsApp = (bill) => {
    const billPhone = bill.customerDetails?.phone || '';
    let phoneStr = String(billPhone).replace(/\D/g, '');
    if (phoneStr.length === 10) {
      phoneStr = '91' + phoneStr;
    }
    const billUrl = `${window.location.origin}/bill/${bill._id}`;
    const message = encodeURIComponent(`Your bill is ready:\n${billUrl}`);
    window.open(`https://wa.me/${phoneStr}?text=${message}`, '_blank');
  };

  /* ─── PDF generation ───────────────────────────────────────── */
  const generatePDF = async (bill) => {
    const doc = new jsPDF();

    // Header background
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 45, 'F');

    // Add Logo
    try {
      const logoImg = await new Promise((resolve) => {
        const img = new Image();
        img.src = '/b2-icon.svg';
        img.width = 150;
        img.height = 150;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 150;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 150, 150);
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            console.error("Canvas rasterize error:", e);
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
      });
      if (logoImg) {
        doc.addImage(logoImg, 'PNG', 97.5, 4, 15, 15);
      }
    } catch (e) {
      console.error("Logo load error:", e);
    }

    // Header Text
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 215, 0); // Bright Gold!
    doc.setFontSize(20);
    doc.text('B2 Bridal Studio', 105, 28, { align: 'center' });
    
    doc.setFont('times', 'italic');
    doc.setTextColor(230, 220, 200); // Premium cream color
    doc.setFontSize(10);
    doc.text('Premium Beauty & Artistry', 105, 35, { align: 'center' });

    // Bill meta
    doc.setFont('times', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    const billNo = bill._id.slice(-8).toUpperCase();
    const billDate = new Date(bill.date || bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.text(`Bill No: #${billNo}`, 15, 55);
    doc.text(`Date: ${billDate}`, 15, 62);
    if (bill.source) doc.text(`Source: ${bill.source}`, 15, 69);
    if (bill.paymentMethod) doc.text(`Payment Mode: ${bill.paymentMethod}`, 15, 76);

    // Right column (Customer details)
    if (bill.customerDetails?.name) {
      doc.text(`Customer: ${bill.customerDetails.name}`, 120, 55);
      if (bill.customerDetails.phone) doc.text(`Phone: ${bill.customerDetails.phone}`, 120, 62);
      if (bill.customerDetails.dob) {
        try {
          const formattedDob = new Date(bill.customerDetails.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          doc.text(`DOB: ${formattedDob}`, 120, 69);
        } catch (e) {
          doc.text(`DOB: ${bill.customerDetails.dob}`, 120, 69);
        }
      }
    } else {
      doc.text(`Customer: ${bill.customer || 'Walk-in'}`, 120, 55);
    }

    // Items table
    const tableData = bill.items.map((item, i) => {
      const count = item.peopleCount || item.quantity || 1;
      const isService = item.itemType === 'service';
      return [
        i + 1,
        item.name,
        isService ? `${count} ${count === 1 ? 'Person' : 'People'}` : count,
        `Rs. ${item.price}`,
        `Rs. ${(item.price * count)}`
      ];
    });

    autoTable(doc, {
      startY: 85,
      head: [['#', 'Item', 'Service For / Qty', 'Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [15, 15, 15], 
        textColor: [255, 215, 0], // Bright Gold!
        font: 'times', 
        fontStyle: 'bold', 
        fontSize: 10 
      },
      bodyStyles: { 
        font: 'times', 
        fontSize: 10, 
        textColor: [40, 40, 40] 
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 15, right: 15 },
    });

    const finalY = doc.lastAutoTable.finalY + 12;
    let cursorY = finalY;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);

    // Service Total (Original pre-discount total)
    const displayOriginalAmount = bill.originalAmount || bill.total + (bill.discountAmount || 0);
    doc.setTextColor(100, 100, 100);
    doc.text(`Service Total: Rs. ${displayOriginalAmount.toFixed(2)}`, 195, cursorY, { align: 'right' });
    cursorY += 8;

    // Coupon or manual discount line-items
    if (bill.discountAmount && bill.discountAmount > 0) {
      doc.setTextColor(34, 139, 34); // Forest green
      if (bill.discountType === 'coupon' || bill.couponCode) {
        doc.text(`Coupon Applied (${bill.couponCode}): -Rs. ${bill.discountAmount.toFixed(2)}`, 195, cursorY, { align: 'right' });
      } else if (bill.discountType === 'manual') {
        doc.text(`Manual Discount: -Rs. ${bill.discountAmount.toFixed(2)}`, 195, cursorY, { align: 'right' });
      }
      cursorY += 8;
    }

    if (bill.gst && bill.gst > 0) {
      doc.setTextColor(100, 100, 100);
      doc.text(`GST Included: Rs. ${bill.gst.toFixed(2)}`, 195, cursorY, { align: 'right' });
      cursorY += 8;
    }
    
    cursorY += 4;
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 215, 0); // Bright Gold!
    doc.text(`Final Amount Paid: Rs. ${bill.total.toFixed(2)}`, 195, cursorY, { align: 'right' });

    // Footer
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
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
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="billing-customer"
                type="text"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                placeholder="Enter customer name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="billing-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">
                Date of Birth (Optional)
              </label>
              <input
                id="billing-dob"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
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

            {/* Discount selector & input */}
            <div className="pt-4 mt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-2">Discount Option</label>
              <div className="flex gap-2 mb-3">
                {[
                  { key: 'none', label: 'None' },
                  { key: 'coupon', label: 'Coupon' },
                  { key: 'manual', label: 'Manual' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setDiscountType(opt.key);
                      setCouponError('');
                      if (opt.key !== 'coupon') {
                        setCouponCode('');
                        setAppliedCoupon(null);
                      }
                      if (opt.key !== 'manual') {
                        setManualDiscount('');
                      }
                    }}
                    className={`flex-grow py-2 rounded-lg font-cinzel text-[0.65rem] font-bold uppercase tracking-wider transition-all border ${
                      discountType === opt.key
                        ? 'bg-[#111] text-[#FFD700] border-black shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {discountType === 'coupon' && (
                <div className="space-y-2 p-3 bg-amber-50/40 border border-amber-200/40 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-grow border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-amber-400 font-cinzel uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isCouponValidating || !couponCode.trim()}
                      className="px-4 py-2 rounded-lg font-cinzel text-xs font-bold uppercase bg-[#111] text-white disabled:opacity-50"
                    >
                      {isCouponValidating ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs font-inter">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-green-600 text-xs font-semibold font-inter flex items-center gap-1">
                      <CheckCircle size={12} /> Coupon "{appliedCoupon.code}" applied! ({appliedCoupon.discountPercentage}% off)
                    </p>
                  )}
                </div>
              )}

              {discountType === 'manual' && (
                <div className="p-3 bg-amber-50/40 border border-amber-200/40 rounded-lg space-y-2">
                  <label className="block text-xs font-cinzel font-semibold text-gray-500 uppercase">Discount Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    max={originalAmount}
                    placeholder="Enter discount amount"
                    value={manualDiscount}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setManualDiscount(val);
                        setCouponError('');
                      } else {
                        const num = Number(val);
                        if (num >= 0 && num <= originalAmount) {
                          setManualDiscount(val);
                          setCouponError('');
                        } else if (num < 0) {
                          setCouponError('Negative values not allowed');
                        } else {
                          setCouponError(`Discount cannot exceed total amount (₹${originalAmount})`);
                        }
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-900 focus:outline-none focus:border-amber-400 text-sm"
                  />
                  {couponError && <p className="text-red-500 text-xs font-inter">{couponError}</p>}
                </div>
              )}
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
                      ? 'bg-[#111] text-[#FFD700] shadow-md'
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
              <div ref={dropdownRef} className="relative w-full">
                {/* Trigger Button */}
                <button
                  type="button"
                  id="billing-item-select-trigger"
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 font-cormorant text-lg transition-colors flex items-center justify-between text-left"
                >
                  <span className="truncate">
                    {selectedItem
                      ? `${catalogueItems.find(i => i.id === selectedItem)?.name || ''} — ₹${catalogueItems.find(i => i.id === selectedItem)?.price || ''}`
                      : `— Select ${category === 'services' ? 'a service' : 'a product'} —`}
                  </span>
                  <ChevronDown size={18} className="text-gray-500 shrink-0 ml-2" />
                </button>

                {/* Dropdown Menu Popover */}
                {isOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto flex flex-col p-2">
                    {/* Search Input */}
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder={`Search ${category === 'services' ? 'services' : 'products'}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37] text-gray-900 placeholder-gray-400 bg-gray-50"
                        autoFocus
                      />
                      <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                    </div>

                    {/* Grouped Items List */}
                    <div className="overflow-y-auto flex-1 max-h-56">
                      {Object.keys(groupedItems).length === 0 ? (
                        <div className="text-center py-4 text-xs text-gray-500 font-cormorant italic">
                          No matching items found.
                        </div>
                      ) : (
                        Object.keys(groupedItems).map(catName => {
                          const isCatExpanded = searchTerm.trim() !== '' || expandedCategories[catName];
                          const catItems = groupedItems[catName];

                          return (
                            <div key={catName} className="mb-2">
                              {/* Category Header */}
                              <button
                                type="button"
                                onClick={() => toggleCategory(catName)}
                                className="w-full flex items-center gap-1.5 py-1.5 px-2 text-left font-cinzel font-bold text-[0.7rem] text-gray-700 hover:bg-gray-50 rounded transition-colors uppercase tracking-wider"
                              >
                                {isCatExpanded ? (
                                  <ChevronDown size={12} className="text-[#D4AF37]" />
                                ) : (
                                  <ChevronRight size={12} className="text-gray-400" />
                                )}
                                {catName}
                              </button>

                              {/* Category Options */}
                              {isCatExpanded && (
                                <div className="mt-0.5 ml-2 pl-2 border-l border-gray-100 space-y-0.5">
                                  {catItems.map(item => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedItem(item.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                      }}
                                      className={`w-full text-left py-1.5 px-3 rounded text-sm font-cormorant text-gray-800 transition-colors flex justify-between items-center ${
                                        selectedItem === item.id
                                          ? 'bg-amber-50 font-bold text-amber-900'
                                          : 'hover:bg-[#FFFCF5] hover:text-[#D4AF37]'
                                      }`}
                                    >
                                      <span className="truncate">{item.name}</span>
                                      <span className="font-bold text-gray-900 text-xs shrink-0 ml-2">₹{item.price}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700 mb-1.5">
                  {category === 'services' ? 'Service For (People)' : 'Quantity'}
                </label>
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
            <p className="text-[#FFD700] font-cinzel font-bold tracking-wide text-sm uppercase">B2 Bridal Studio</p>
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
                        ₹{item.price} × {item.itemType === 'service' ? `Service For: ${item.quantity} ${item.quantity === 1 ? 'Person' : 'People'}` : `Qty: ${item.quantity}`}
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-gray-500">Service Total</span>
              <span className="text-sm font-semibold text-gray-900">₹{originalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-green-600">
                  {discountType === 'coupon' ? `Coupon Applied (${appliedCoupon?.code})` : 'Manual Discount'}
                </span>
                <span className="text-sm font-semibold text-green-600">-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {gstAmount > 0 ? (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-cinzel font-bold uppercase tracking-wide text-gray-500">GST Included</span>
                <span className="text-sm font-semibold text-gray-900">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            ) : null}

            <div className="flex justify-between items-center mb-4 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <span className="text-sm font-cinzel font-bold uppercase tracking-wide text-gray-700">Final Amount Paid</span>
              <span className="text-2xl font-bold text-gray-900 font-cinzel">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
              <span>Source: <strong className="text-gray-900 capitalize">{source}</strong> | Payment: <strong className="text-gray-900 capitalize">{paymentMethod}</strong></span>
              <div className="text-right">
                <div>Customer: <strong className="text-gray-900">{customer || '—'}</strong></div>
                {phone && <div className="text-[10px] text-gray-500">Phone: {phone}</div>}
              </div>
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

            {successBill && (
              <div className="mt-4 p-4 border border-green-200 bg-green-50/60 rounded-xl space-y-3 shadow-sm" style={{ animation: 'slideDown 0.3s ease-out' }}>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-green-900">
                      Bill generated successfully!
                    </p>
                    <p className="text-[10px] text-green-700 mt-0.5">
                      Bill #{successBill.bill._id.slice(-8).toUpperCase()} — {successBill.revenueCreated ? 'Revenue updated.' : 'Revenue entry failed.'}
                    </p>
                  </div>
                  <button onClick={() => setSuccessBill(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`/bill/${successBill.bill._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wide bg-[#111] text-[#FFD700] hover:bg-black transition-all hover:shadow-md"
                  >
                    <FileText size={14} /> View Bill
                  </a>
                  <button
                    onClick={() => sendWhatsApp(successBill.bill)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wide bg-green-500 text-white hover:bg-green-600 transition-colors hover:shadow-md"
                  >
                    <Send size={14} /> Send Bill
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => generatePDF(successBill.bill)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wide border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Download size={14} /> PDF
                  </button>
                  <button
                    onClick={() => handlePrint(successBill.bill)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wide border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
