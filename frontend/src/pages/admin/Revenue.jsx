import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  TrendingUp, Wifi, WifiOff, ExternalLink, Trash2,
  CalendarRange, X, Search, RotateCcw, Wallet
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

/* ─────────────────── date helpers ─────────────────── */

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayYMD() { return toYMD(new Date()); }

function startOfWeekYMD() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return toYMD(d);
}

function startOfMonthYMD() {
  const d = new Date();
  d.setDate(1);
  return toYMD(d);
}

function startOfYearYMD() {
  const d = new Date();
  d.setMonth(0, 1);
  return toYMD(d);
}

function formatDisplayDate(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─────────────────── Premium Date Filter ─────────────────── */

const PRESETS = [
  { label: 'Today',      from: () => todayYMD(),      to: () => todayYMD()      },
  { label: 'This Week',  from: () => startOfWeekYMD(), to: () => todayYMD()     },
  { label: 'This Month', from: () => startOfMonthYMD(), to: () => todayYMD()    },
  { label: 'This Year',  from: () => startOfYearYMD(), to: () => todayYMD()     },
];

const DateFilterPanel = ({ onApply, onClear, isActive, appliedFrom, appliedTo }) => {
  const [from, setFrom] = useState('');
  const [to, setTo]     = useState('');
  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (preset, idx) => {
    const f = preset.from();
    const t = preset.to();
    setFrom(f);
    setTo(t);
    setActivePreset(idx);
    onApply(f, t);
  };

  const handleApply = () => {
    if (!from) return;
    setActivePreset(null);
    onApply(from, to);
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    setActivePreset(null);
    onClear();
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fffdf7 100%)',
      borderRadius: 20,
      border: isActive ? '1.5px solid rgba(212,175,55,0.4)' : '1px solid rgba(212,175,55,0.18)',
      boxShadow: isActive
        ? '0 4px 32px rgba(212,175,55,0.14), 0 2px 8px rgba(0,0,0,0.04)'
        : '0 4px 24px rgba(212,175,55,0.07), 0 2px 8px rgba(0,0,0,0.03)',
      overflow: 'hidden',
      marginBottom: 28,
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px 12px',
        borderBottom: '1px solid rgba(212,175,55,0.1)',
        background: 'linear-gradient(90deg, rgba(212,175,55,0.05) 0%, transparent 100%)',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarRange size={15} style={{ color: '#D4AF37' }} />
          </div>
          <div>
            <div style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700,
              fontSize: '0.7rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#374151',
            }}>
              Date Range Filter
            </div>
            {isActive && (
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.6rem',
                color: '#D4AF37', letterSpacing: '0.08em',
              }}>
                {formatDisplayDate(appliedFrom)} → {appliedTo ? formatDisplayDate(appliedTo) : 'Today'}
              </div>
            )}
          </div>
        </div>

        {/* Active badge */}
        {isActive && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 20, padding: '3px 10px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', display: 'inline-block' }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.58rem', fontWeight: 700, color: '#B8960C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Filter Active
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '18px 24px 22px' }}>
        {/* Quick Preset Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: '0.58rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af',
            marginRight: 4,
          }}>
            Quick:
          </span>
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p, i)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: activePreset === i
                  ? '1.5px solid #D4AF37'
                  : '1px solid rgba(212,175,55,0.2)',
                background: activePreset === i
                  ? 'linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)'
                  : 'rgba(212,175,55,0.04)',
                color: activePreset === i ? '#fff' : '#92400e',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: activePreset === i ? '0 2px 8px rgba(212,175,55,0.3)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Date inputs row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto auto',
          gap: 12,
          alignItems: 'end',
        }}
          className="rev-filter-grid"
        >
          {/* FROM */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: 6,
            }}>
              From Date <span style={{ color: '#D4AF37' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={from}
                onChange={e => { setFrom(e.target.value); setActivePreset(null); }}
                max={todayYMD()}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: from ? '1.5px solid rgba(212,175,55,0.4)' : '1px solid #e5e7eb',
                  background: from ? 'rgba(212,175,55,0.04)' : '#f9fafb',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.82rem',
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.18s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = from ? 'rgba(212,175,55,0.4)' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* TO */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: 6,
            }}>
              To Date <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.52rem', color: '#9ca3af', fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="date"
              value={to}
              onChange={e => { setTo(e.target.value); setActivePreset(null); }}
              min={from || undefined}
              max={todayYMD()}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: to ? '1.5px solid rgba(212,175,55,0.4)' : '1px solid #e5e7eb',
                background: to ? 'rgba(212,175,55,0.04)' : '#f9fafb',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.82rem',
                color: '#111827',
                outline: 'none',
                transition: 'all 0.18s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = to ? 'rgba(212,175,55,0.4)' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Apply */}
          <button
            onClick={handleApply}
            disabled={!from}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: from
                ? 'linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)'
                : '#e5e7eb',
              color: from ? '#fff' : '#9ca3af',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: from ? 'pointer' : 'not-allowed',
              transition: 'all 0.18s ease',
              boxShadow: from ? '0 3px 12px rgba(212,175,55,0.3)' : 'none',
              whiteSpace: 'nowrap',
              height: 42,
            }}
            onMouseEnter={e => { if (from) e.currentTarget.style.boxShadow = '0 4px 18px rgba(212,175,55,0.45)'; }}
            onMouseLeave={e => { if (from) e.currentTarget.style.boxShadow = '0 3px 12px rgba(212,175,55,0.3)'; }}
          >
            <Search size={13} />
            Apply
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#6b7280',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
              height: 42,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            <RotateCcw size={12} />
            Clear
          </button>
        </div>

        {/* Helper text */}
        {!from && (
          <p style={{
            marginTop: 10,
            fontFamily: 'Cinzel, serif',
            fontSize: '0.58rem',
            color: '#9ca3af',
            letterSpacing: '0.06em',
          }}>
            Select a From date to filter. To date is optional — if empty, shows data up to today.
          </p>
        )}
      </div>

      {/* Responsive styles for filter grid */}
      <style>{`
        @media (max-width: 640px) {
          .rev-filter-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .rev-filter-grid > button {
            grid-column: span 1;
          }
        }
        @media (max-width: 420px) {
          .rev-filter-grid {
            grid-template-columns: 1fr !important;
          }
          .rev-filter-grid > button {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────── Main Component ─────────────────────── */

const Revenue = () => {
  /* ── existing state (unchanged) ── */
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, count: 0 });
  const [filter, setFilter] = useState('all'); // 'all' | 'online' | 'offline'
  const [expenses, setExpenses] = useState([]);

  /* ── new date-filter state ── */
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo]     = useState('');
  const isDateFiltered = Boolean(appliedFrom);

  /* ── fetch (unchanged) ── */
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = sessionStorage.getItem('revenueToken') || localStorage.getItem('adminToken');
        const [entriesRes, statsRes, expensesRes] = await Promise.all([
          axios.get(`${API}/api/revenue`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/revenue/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setEntries(entriesRes.data);
        setStats(statsRes.data);
        setExpenses(expensesRes.data);
      } catch (err) {
        console.error('Failed to fetch revenue', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  /* ── delete (unchanged) ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this revenue entry?")) return;
    console.log("Deleting ID:", id);
    try {
      const token = sessionStorage.getItem('revenueToken') || localStorage.getItem('adminToken');
      await axios.delete(`${API}/api/revenue/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove entry from UI instantly
      setEntries(prev => prev.filter(e => e._id !== id));
      // Re-fetch stats to keep dashboard accurate
      const statsRes = await axios.get(`${API}/api/revenue/stats`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(statsRes.data);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  /* ── date-range filtered entries (memoised) ── */
  const dateFiltered = useMemo(() => {
    if (!appliedFrom) return entries;
    const from = new Date(appliedFrom);
    from.setHours(0, 0, 0, 0);
    const to = appliedTo ? new Date(appliedTo) : new Date();
    to.setHours(23, 59, 59, 999);
    return entries.filter(e => {
      const d = new Date(e.date);
      return d >= from && d <= to;
    });
  }, [entries, appliedFrom, appliedTo]);

  /* ── source filter applied on top of date filter (unchanged logic) ── */
  const filtered = filter === 'all'
    ? dateFiltered
    : dateFiltered.filter(e => e.source === filter);

  /* ── live stats: use API stats when no date filter, compute live otherwise ── */
  const displayStats = useMemo(() => {
    if (!isDateFiltered) return stats;
    return {
      total:   dateFiltered.reduce((s, e) => s + Number(e.total  || 0), 0),
      online:  dateFiltered.filter(e => e.source === 'online').reduce((s, e) => s + Number(e.total || 0), 0),
      offline: dateFiltered.filter(e => e.source === 'offline').reduce((s, e) => s + Number(e.total || 0), 0),
      count:   dateFiltered.length,
    };
  }, [isDateFiltered, dateFiltered, stats]);

  /* ── date-range filtered expenses (memoised) ── */
  const dateFilteredExpenses = useMemo(() => {
    if (!appliedFrom) return expenses;
    const from = new Date(appliedFrom);
    from.setHours(0, 0, 0, 0);
    const to = appliedTo ? new Date(appliedTo) : new Date();
    to.setHours(23, 59, 59, 999);
    return expenses.filter(e => {
      const d = new Date(e.expenseDate);
      return d >= from && d <= to;
    });
  }, [expenses, appliedFrom, appliedTo]);

  // Dynamic calculations for expenses & net revenue
  const totalRevenue = useMemo(() => {
    return isDateFiltered
      ? dateFiltered.reduce((s, e) => s + Number(e.total || 0), 0)
      : stats.total;
  }, [isDateFiltered, dateFiltered, stats.total]);

  const totalExpenses = useMemo(() => {
    return dateFilteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  }, [dateFilteredExpenses]);

  const netRevenue = useMemo(() => {
    return totalRevenue - totalExpenses;
  }, [totalRevenue, totalExpenses]);

  /* ── handlers ── */
  const handleApply = (from, to) => {
    setAppliedFrom(from);
    setAppliedTo(to);
  };
  const handleClear = () => {
    setAppliedFrom('');
    setAppliedTo('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      {/* ── Header (unchanged) ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
          <TrendingUp size={24} className="text-[#D4AF37]" />
          Revenue Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">Track all income across online and offline channels.</p>
      </div>

      {/* ══════════════════════════════════════════
          PREMIUM DATE RANGE FILTER (NEW)
      ══════════════════════════════════════════ */}
      <DateFilterPanel
        onApply={handleApply}
        onClear={handleClear}
        isActive={isDateFiltered}
        appliedFrom={appliedFrom}
        appliedTo={appliedTo}
      />

      {/* ══════════════════════════════════════════
          STATS CARDS — now reflect date filter & expenses
      ══════════════════════════════════════════ */}
      {/* Primary Financial Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" style={isDateFiltered ? { borderColor: 'rgba(212,175,55,0.25)' } : {}}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex justify-between items-center">
            <span>Total Revenue</span>
            {isDateFiltered && (
              <span style={{
                padding: '1px 7px', borderRadius: 10,
                background: 'rgba(212,175,55,0.1)', color: '#B8960C',
                fontSize: '0.55rem', fontFamily: 'Cinzel, serif',
                fontWeight: 700, letterSpacing: '0.08em',
              }}>
                Filtered
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">{isDateFiltered ? dateFiltered.length : stats.count} bills generated</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" style={isDateFiltered ? { borderColor: 'rgba(239, 68, 68, 0.2)' } : {}}>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex justify-between items-center">
            <span className="flex items-center gap-1"><Wallet size={12} className="text-rose-500" /> Total Expenses</span>
            {isDateFiltered && (
              <span style={{
                padding: '1px 7px', borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                fontSize: '0.55rem', fontFamily: 'Cinzel, serif',
                fontWeight: 700, letterSpacing: '0.08em',
              }}>
                Filtered
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-rose-600">
            ₹{totalExpenses?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">{dateFilteredExpenses.length} expenses logged</div>
        </div>

        {/* Net Revenue */}
        <div className="bg-[#FAF8F5] rounded-xl shadow-sm border border-amber-200/40 p-6" style={{ background: 'linear-gradient(135deg, #FFFDF9 0%, #FAF6EE 100%)', border: '1.5px solid rgba(212,175,55,0.3)' }}>
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1 flex justify-between items-center font-cinzel">
            <span>Net Revenue</span>
            <span className="text-[0.6rem] text-amber-600/80 font-serif italic lowercase">revenue - expenses</span>
          </div>
          <div className="text-3xl font-bold text-amber-700">
            ₹{netRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500 mt-1 italic font-cormorant">Overall profit after expenses</div>
        </div>
      </div>

      {/* Secondary Revenue Channel Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Online */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <Wifi size={12} className="text-blue-400" />
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Online Revenue</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            ₹{displayStats.online?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {dateFiltered.filter(e => e.source === 'online').length} booking bills
          </div>
        </div>

        {/* Offline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <WifiOff size={12} className="text-amber-500" />
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Offline Revenue</div>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            ₹{displayStats.offline?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {dateFiltered.filter(e => e.source === 'offline').length} walk-in bills
          </div>
        </div>
      </div>

      {/* Active filter indicator bar */}
      {isDateFiltered && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', marginBottom: 16,
          background: 'linear-gradient(90deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 100%)',
          borderRadius: 10, border: '1px solid rgba(212,175,55,0.2)',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', fontWeight: 600, color: '#92400e', letterSpacing: '0.06em' }}>
            📅 Showing revenue from <strong>{formatDisplayDate(appliedFrom)}</strong>
            {' '}to <strong>{appliedTo ? formatDisplayDate(appliedTo) : 'Today'}</strong>
            {' '}— {dateFiltered.length} of {entries.length} entries
          </span>
          <button
            onClick={handleClear}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 8,
              border: '1px solid rgba(212,175,55,0.25)',
              background: 'white', color: '#6b7280',
              fontFamily: 'Cinzel, serif', fontSize: '0.58rem',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <X size={11} /> Clear Filter
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SOURCE FILTER TABS (unchanged)
      ══════════════════════════════════════════ */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'online', label: 'Online' },
          { key: 'offline', label: 'Offline' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-cinzel font-bold uppercase tracking-wide transition-all ${
              filter === f.key
                ? 'bg-[#111] text-amber-400 shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          REVENUE TABLE (unchanged)
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Date</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Customer</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Source</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Mode</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Total</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400 text-sm">
                    {entries.length === 0
                      ? 'No revenue yet. Revenue is recorded when bills are generated.'
                      : isDateFiltered
                        ? 'No revenue entries found for the selected date range.'
                        : 'No entries match this filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map(entry => (
                  <tr key={entry._id} className="hover:bg-[#FFFCF5] transition-colors">
                    <td className="p-4 pl-6 text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 text-sm">{entry.customer}</div>
                      {entry.branch && <div className="text-xs text-gray-400">{entry.branch}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        entry.source === 'online'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {entry.source === 'online' ? <Wifi size={10} /> : <WifiOff size={10} />}
                        {entry.source}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{entry.mode || '—'}</td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900">
                        ₹{Number(entry.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center gap-2">
                        {entry.billId ? (
                          <a
                            href={`/bill/${entry.billId?._id || entry.billId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-btn-primary"
                          >
                            <ExternalLink size={12} /> View
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="admin-btn-danger"
                          title="Delete Revenue"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
