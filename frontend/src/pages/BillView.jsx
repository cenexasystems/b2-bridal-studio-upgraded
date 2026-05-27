import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = import.meta.env.VITE_API_URL;

const HOUR_LABELS = { '10':'10 AM','11':'11 AM','12':'12 PM','13':'1 PM','14':'2 PM','15':'3 PM','16':'4 PM','17':'5 PM','18':'6 PM','19':'7 PM' };

const getScheduledDetails = (dateTimeStr) => {
  if (!dateTimeStr) return { date: '', time: '' };
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return { date: dateTimeStr, time: '' };
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const dateVal = `${day} ${month} ${year}`;
    const hour = String(d.getHours());
    const timeVal = HOUR_LABELS[hour] || d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date: dateVal, time: timeVal };
  } catch {
    return { date: dateTimeStr, time: '' };
  }
};

const BillView = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/billing/${id}`)
      .then(r => r.json())
      .then(setBill)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const generatePDF = () => {
    if (!bill) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(201, 162, 39);
    doc.setFontSize(20);
    doc.text('B2 Bridal Studio', 105, 18, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(180, 170, 150);
    doc.text('Premium Beauty & Artistry', 105, 26, { align: 'center' });

    // Bill info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Bill #${bill._id.slice(-8).toUpperCase()}`, 15, 52);
    doc.text(`Date: ${new Date(bill.date).toLocaleDateString('en-IN')}`, 15, 59);
    if (bill.branch) doc.text(`Branch: ${bill.branch}`, 15, 66);
    if (bill.paymentMethod) doc.text(`Payment Mode: ${bill.paymentMethod}`, 15, 73);

    // Customer
    if (bill.customerDetails?.name) {
      doc.text(`Customer: ${bill.customerDetails.name}`, 120, 52);
      if (bill.customerDetails.phone) doc.text(`Phone: ${bill.customerDetails.phone}`, 120, 59);
      
      if (bill.source === 'online' && bill.customerDetails.date) {
        const { date, time } = getScheduledDetails(bill.customerDetails.date);
        doc.text(`Scheduled Date: ${date}`, 120, 66);
        doc.text(`Scheduled Time: ${time}`, 120, 73);
      }
    }

    // Table
    const tableData = bill.items.map((item, i) => [
      i + 1,
      item.name,
      item.quantity || 1,
      `₹${item.price}`,
      `₹${(item.price * (item.quantity || 1))}`
    ]);

    autoTable(doc, {
      startY: 82,
      head: [['#', 'Item', 'Qty', 'Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 30, 30], textColor: [201, 162, 39], fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 15, right: 15 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    let cursorY = finalY;
    doc.setFontSize(10);

    // If the bill has GST
    if (bill.gst && bill.gst > 0) {
      doc.setTextColor(100, 100, 100);
      doc.text(`Service Total: ₹${bill.subtotal.toFixed(2)}`, 150, cursorY, { align: 'right' });
      cursorY += 7;

      if (bill.couponCode && bill.discountAmount > 0) {
        doc.setTextColor(34, 139, 34);
        doc.text(`Coupon Discount (${bill.couponCode}): -₹${bill.discountAmount.toFixed(2)}`, 150, cursorY, { align: 'right' });
        cursorY += 7;
      }

      doc.setTextColor(100, 100, 100);
      doc.text(`GST Included: ₹${bill.gst.toFixed(2)}`, 150, cursorY, { align: 'right' });
      cursorY += 7;
    } else {
      // Show original total + coupon discount if applicable
      if (bill.couponCode && bill.discountAmount > 0) {
        doc.setTextColor(100, 100, 100);
        doc.text(`Service Total: ₹${(bill.originalTotal || (bill.total + bill.discountAmount)).toFixed(2)}`, 150, cursorY, { align: 'right' });
        cursorY += 7;
        doc.setTextColor(34, 139, 34);
        doc.text(`Coupon Discount (${bill.couponCode}): -₹${bill.discountAmount.toFixed(2)}`, 150, cursorY, { align: 'right' });
        cursorY += 7;
      } else {
        doc.setTextColor(100, 100, 100);
        doc.text(`Service Total: ₹${bill.total.toFixed(2)}`, 150, cursorY, { align: 'right' });
        cursorY += 7;
      }
    }

    cursorY += 3;

    // Final total (actual paid amount)
    doc.setFontSize(12);
    doc.setTextColor(201, 162, 39);
    doc.text(`Final Amount Paid: ₹${bill.total.toFixed(2)}`, 150, cursorY, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing B2 Bridal Studio', 105, 280, { align: 'center' });

    doc.save(`B2-Bill-${bill._id.slice(-8).toUpperCase()}.pdf`);
  };

  if (loading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(255,195,0,0.2)', borderTopColor: '#FFD700' }} />
      </div>
    );
  }

  if (!bill) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center px-6">
          <span className="text-5xl block mb-6">📄</span>
          <h2 className="font-cinzel text-lg tracking-[0.1em] uppercase mb-3" style={{ color: '#F8F5F0' }}>Bill Not Found</h2>
          <Link to="/" className="btn-outline-gold py-2 px-6 text-xs mt-4">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <section className="relative" style={{ padding: '9rem 0 6rem' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.04), transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto px-6"
        >
          {/* Bill Card */}
          <div className="glass-dark rounded-sm overflow-hidden" style={{ border: '1px solid rgba(255,195,0,0.2)' }}>
            {/* Header */}
            <div className="p-8 text-center" style={{ background: 'linear-gradient(180deg, rgba(255,195,0,0.08), transparent)', borderBottom: '1px solid rgba(255,195,0,0.1)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ border: '1px solid rgba(255,195,0,0.4)' }}>
                <span className="font-cinzel text-lg font-bold text-gold-gradient">B2</span>
              </div>
              <h1 className="font-cinzel text-sm tracking-[0.3em] uppercase" style={{ color: '#F8F5F0' }}>B2 Bridal Studio</h1>
              <p className="font-cormorant italic text-xs mt-1" style={{ color: 'rgba(248,245,240,0.4)' }}>Premium Beauty & Artistry</p>
            </div>

            {/* Bill Info */}
            <div className="p-6 flex flex-wrap gap-6 justify-between" style={{ borderBottom: '1px solid rgba(255,195,0,0.06)' }}>
              <div>
                <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(255,195,0,0.4)' }}>Bill No</span>
                <span className="font-inter text-sm" style={{ color: '#F8F5F0' }}>#{bill._id.slice(-8).toUpperCase()}</span>
              </div>
              <div>
                <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(255,195,0,0.4)' }}>Date</span>
                <span className="font-inter text-sm" style={{ color: '#F8F5F0' }}>{new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              {bill.branch && (
                <div>
                  <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(255,195,0,0.4)' }}>Branch</span>
                  <span className="font-inter text-sm" style={{ color: '#F8F5F0' }}>{bill.branch}</span>
                </div>
              )}
              {bill.paymentMethod && (
                <div>
                  <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-1" style={{ color: 'rgba(255,195,0,0.4)' }}>Mode</span>
                  <span className="font-inter text-sm" style={{ color: '#F8F5F0' }}>{bill.paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Customer & Scheduled Appointment */}
            {bill.customerDetails?.name && (
              <div className="px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4" style={{ borderBottom: '1px solid rgba(255,195,0,0.06)' }}>
                <div>
                  <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(255,195,0,0.4)' }}>Customer</span>
                  <span className="font-inter text-sm block" style={{ color: '#F8F5F0' }}>{bill.customerDetails.name}</span>
                  {bill.customerDetails.phone && <span className="font-inter text-xs" style={{ color: 'rgba(248,245,240,0.4)' }}>{bill.customerDetails.phone}</span>}
                </div>
                {bill.source === 'online' && bill.customerDetails?.date && (() => {
                  const { date, time } = getScheduledDetails(bill.customerDetails.date);
                  return (
                    <div>
                      <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(255,195,0,0.4)' }}>Appointment Slot</span>
                      <span className="font-inter text-xs block" style={{ color: '#F8F5F0' }}>Scheduled Date: <strong style={{ color: '#FFD700' }}>{date}</strong></span>
                      <span className="font-inter text-xs block mt-1" style={{ color: '#F8F5F0' }}>Scheduled Time: <strong style={{ color: '#FFD700' }}>{time}</strong></span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Items */}
            <div className="px-6 py-4">
              <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-4" style={{ color: 'rgba(255,195,0,0.4)' }}>Items</span>
              {bill.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2.5" style={{ borderBottom: i < bill.items.length - 1 ? '1px solid rgba(255,195,0,0.04)' : 'none' }}>
                  <div>
                    <span className="font-cormorant text-sm" style={{ color: '#F8F5F0' }}>{item.name}</span>
                    <span className="font-cinzel text-[0.5rem] ml-2" style={{ color: 'rgba(248,245,240,0.3)' }}>× {item.quantity || 1}</span>
                  </div>
                  <span className="font-cinzel text-sm" style={{ color: '#FFD700' }}>₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-5" style={{ background: 'rgba(255,195,0,0.03)', borderTop: '1px solid rgba(255,195,0,0.1)' }}>
              {bill.gst && bill.gst > 0 ? (
                <>
                  <div className="flex justify-between mb-2 font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                    <span>Service Total</span><span>₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  {bill.couponCode && bill.discountAmount > 0 && (
                    <div className="flex justify-between mb-2 font-cormorant text-sm" style={{ color: '#4ade80' }}>
                      <span className="flex items-center gap-1.5">
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>{bill.couponCode}</span>
                        Coupon Discount{bill.discountPercentage ? ` (${bill.discountPercentage}%)` : ''}
                      </span>
                      <span>-₹{bill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2 font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                    <span>GST Included</span><span>₹{bill.gst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Coupon discount breakdown */}
                  {bill.couponCode && bill.discountAmount > 0 ? (
                    <>
                      <div className="flex justify-between mb-2 font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                        <span>Service Total</span><span>₹{(bill.originalTotal || (bill.total + bill.discountAmount)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2 font-cormorant text-sm" style={{ color: '#4ade80' }}>
                        <span className="flex items-center gap-1.5">
                          <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>{bill.couponCode}</span>
                          Coupon Discount{bill.discountPercentage ? ` (${bill.discountPercentage}%)` : ''}
                        </span>
                        <span>-₹{bill.discountAmount.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between mb-2 font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                      <span>Service Total</span><span>₹{bill.total.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between font-cinzel text-lg pt-3" style={{ borderTop: '1px solid rgba(255,195,0,0.12)', color: '#F8F5F0' }}>
                <span>Final Amount Paid</span><span style={{ color: '#FFD700' }}>₹{bill.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center" style={{ borderTop: '1px solid rgba(255,195,0,0.06)' }}>
              <p className="font-cormorant italic text-sm mb-4" style={{ color: 'rgba(248,245,240,0.35)' }}>Thank you for choosing B2 Bridal Studio</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={generatePDF} className="btn-gold py-3 px-8 text-xs">
                  Download PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-3 px-8 text-xs font-semibold rounded"
                  style={{ border: '1px solid rgba(255,195,0,0.3)', color: 'rgba(255,195,0,0.7)', background: 'transparent' }}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default BillView;
