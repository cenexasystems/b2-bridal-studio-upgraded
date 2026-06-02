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

  const generatePDF = async () => {
    if (!bill) return;
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

    // Bill info block
    doc.setFont('times', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    
    // Left column
    doc.text(`Bill No: #${bill._id.slice(-8).toUpperCase()}`, 15, 55);
    doc.text(`Date: ${new Date(bill.date).toLocaleDateString('en-IN')}`, 15, 62);
    if (bill.branch) doc.text(`Branch: ${bill.branch}`, 15, 69);
    if (bill.paymentMethod) doc.text(`Payment Mode: ${bill.paymentMethod}`, 15, 76);

    // Right column (Customer details)
    if (bill.customerDetails?.name) {
      doc.text(`Customer: ${bill.customerDetails.name}`, 120, 55);
      if (bill.customerDetails.phone) doc.text(`Phone: ${bill.customerDetails.phone}`, 120, 62);
      
      if (bill.source === 'online' && bill.customerDetails.date) {
        const { date, time } = getScheduledDetails(bill.customerDetails.date);
        doc.text(`Scheduled Date: ${date}`, 120, 69);
        doc.text(`Scheduled Time: ${time}`, 120, 76);
      }
    }

    // Table
    const tableData = bill.items.map((item, i) => [
      i + 1,
      item.name,
      item.quantity || 1,
      `Rs. ${item.price}`,
      `Rs. ${(item.price * (item.quantity || 1))}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['#', 'Item', 'Qty', 'Price', 'Amount']],
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

    const displayOriginalAmount = bill.originalAmount || bill.originalTotal || (bill.total + (bill.discountAmount || 0));
    doc.setTextColor(100, 100, 100);
    doc.text(`Service Total: Rs. ${displayOriginalAmount.toFixed(2)}`, 195, cursorY, { align: 'right' });
    cursorY += 8;

    if (bill.discountAmount && bill.discountAmount > 0) {
      doc.setTextColor(34, 139, 34); // Forest green
      if (bill.discountType === 'coupon' || bill.couponCode) {
        doc.text(`Coupon Discount (${bill.couponCode}): -Rs. ${bill.discountAmount.toFixed(2)}`, 195, cursorY, { align: 'right' });
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

    // Final total (actual paid amount)
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 215, 0); // Bright Gold!
    doc.text(`Final Amount Paid: Rs. ${bill.total.toFixed(2)}`, 195, cursorY, { align: 'right' });

    // Footer
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text('Thank you for choosing B2 Bridal Studio', 105, 282, { align: 'center' });

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
            <div className="p-8 text-center" style={{ background: 'linear-gradient(180deg, rgba(255,215,0,0.08), transparent)', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ border: '1px solid rgba(255,215,0,0.4)', boxShadow: '0 0 15px rgba(255,215,0,0.15)', background: '#050505' }}>
                <img src="/b2-logo-transparent.svg" alt="B2 Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.3))' }} />
              </div>
              <h1 className="font-cinzel text-[1.1rem] tracking-[0.3em] uppercase font-bold" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.3)' }}>B2 Bridal Studio</h1>
              <p className="font-cormorant italic text-sm mt-1.5 font-semibold" style={{ color: 'rgba(248,245,240,0.6)', letterSpacing: '0.02em' }}>Premium Beauty & Artistry</p>
            </div>

            {/* Bill Info */}
            <div className="p-6 flex flex-wrap gap-6 justify-between" style={{ borderBottom: '1px solid rgba(255,215,0,0.08)' }}>
              <div>
                <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-1.5 font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>Bill No</span>
                <span className="font-inter text-[0.95rem] font-bold" style={{ color: '#F8F5F0' }}>#{bill._id.slice(-8).toUpperCase()}</span>
              </div>
              <div>
                <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-1.5 font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>Date</span>
                <span className="font-inter text-[0.95rem] font-bold" style={{ color: '#F8F5F0' }}>{new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              {bill.branch && (
                <div>
                  <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-1.5 font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>Branch</span>
                  <span className="font-inter text-[0.95rem] font-bold" style={{ color: '#F8F5F0' }}>{bill.branch}</span>
                </div>
              )}
              {bill.paymentMethod && (
                <div>
                  <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-1.5 font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>Mode</span>
                  <span className="font-inter text-[0.95rem] font-bold" style={{ color: '#F8F5F0' }}>{bill.paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Customer & Scheduled Appointment */}
            {bill.customerDetails?.name && (
              <div className="px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4" style={{ borderBottom: '1px solid rgba(255,215,0,0.08)' }}>
                <div>
                  <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-1.5 font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>Customer</span>
                  <span className="font-inter text-[0.95rem] font-bold block" style={{ color: '#F8F5F0' }}>{bill.customerDetails.name}</span>
                  {bill.customerDetails.phone && <span className="font-inter text-xs block mt-0.5 font-semibold" style={{ color: 'rgba(248,245,240,0.5)' }}>{bill.customerDetails.phone}</span>}
                </div>
                {bill.source === 'online' && bill.customerDetails?.date && (() => {
                  const { date, time } = getScheduledDetails(bill.customerDetails.date);
                  return (
                    <div>
                      <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-1.5 font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>Appointment Slot</span>
                      <span className="font-inter text-sm block font-medium" style={{ color: '#F8F5F0' }}>Scheduled Date: <strong style={{ color: '#FFD700', fontWeight: 'bold' }}>{date}</strong></span>
                      <span className="font-inter text-sm block mt-1.5 font-medium" style={{ color: '#F8F5F0' }}>Scheduled Time: <strong style={{ color: '#FFD700', fontWeight: 'bold' }}>{time}</strong></span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Items */}
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,215,0,0.04)' }}>
              <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-3 font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>Items</span>
              {bill.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2.5" style={{ borderBottom: i < bill.items.length - 1 ? '1px solid rgba(255,215,0,0.04)' : 'none' }}>
                  <div>
                    <span className="font-cormorant text-[1.1rem] font-medium" style={{ color: '#F8F5F0' }}>{item.name}</span>
                    <span className="font-cinzel text-xs ml-2" style={{ color: 'rgba(248,245,240,0.4)' }}>× {item.quantity || 1}</span>
                  </div>
                  <span className="font-cinzel text-[0.95rem] font-bold" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)' }}>₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-5" style={{ background: 'rgba(255,215,0,0.02)', borderTop: '1px solid rgba(255,215,0,0.1)' }}>
              {(() => {
                const displayOriginalAmount = bill.originalAmount || bill.originalTotal || (bill.total + (bill.discountAmount || 0));
                return (
                  <>
                    <div className="flex justify-between mb-2 font-cormorant text-[1rem] font-semibold" style={{ color: 'rgba(248,245,240,0.6)' }}>
                      <span>Service Total</span><span>₹{displayOriginalAmount.toFixed(2)}</span>
                    </div>

                    {bill.discountAmount && bill.discountAmount > 0 && (
                      <div className="flex justify-between mb-2 font-cormorant text-[1rem] font-bold" style={{ color: '#4ade80' }}>
                        <span className="flex items-center gap-1.5">
                          {bill.couponCode && (
                            <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', textTransform: 'uppercase' }}>
                              {bill.couponCode}
                            </span>
                          )}
                          {(bill.discountType === 'coupon' || bill.couponCode) ? 'Coupon Discount' : 'Manual Discount'}
                          {bill.discountPercentage && (bill.discountType === 'coupon' || bill.couponCode) ? ` (${bill.discountPercentage}%)` : ''}
                        </span>
                        <span>-₹{bill.discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {bill.gst && bill.gst > 0 ? (
                      <div className="flex justify-between mb-2 font-cormorant text-[1rem] font-semibold" style={{ color: 'rgba(248,245,240,0.6)' }}>
                        <span>GST Included</span><span>₹{bill.gst.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </>
                );
              })()}
              <div className="flex justify-between font-cinzel text-[1.15rem] pt-3.5 font-bold" style={{ borderTop: '1px solid rgba(255,215,0,0.15)', color: '#F8F5F0' }}>
                <span>Final Amount Paid</span><span style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.35)' }}>₹{bill.total.toFixed(2)}</span>
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
