import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarCheck, Plus, Save, AlertCircle, Lock, Download, Search, RotateCcw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Attendance = () => {
  const [staffList, setStaffList] = useState([]);
  const [records, setRecords]     = useState([]);

  const todayStr = getTodayStr();

  /* ── filter form and active applied state ── */
  const [filterForm, setFilterForm] = useState({
    fromDate: todayStr,
    toDate:   '',
    staffId:  '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: todayStr,
    toDate:   '',
    staffId:  '',
  });

  /* ── form state ── */
  const [form, setForm] = useState({
    staffId:     '',
    date:        todayStr,
    entryTime:   '',
    exitTime:    '',
    leaveReason: '',
    status:      'Present',
  });
  const [errors, setErrors] = useState({});

  /* ── inline exit-edit state ── */
  const [editRecordId, setEditRecordId] = useState(null);
  const [editExitTime, setEditExitTime] = useState('');

  /* ─── fetch helpers ─────────────────────────────────────── */
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API}/api/staff`);
      setStaffList(res.data);
    } catch (err) { console.error('fetchStaff', err); }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API}/api/attendance`);
      setRecords(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) { console.error('fetchAttendance', err); }
  };

  useEffect(() => { fetchStaff(); fetchAttendance(); }, []);

  /* ─── validation ────────────────────────────────────────── */
  const validate = () => {
    const newErrors = {};
    if (!form.staffId) newErrors.staffId = 'Please select a staff member';
    if (!form.date)    newErrors.date    = 'Please select a date';
 
    if (form.status === 'Present') {
      if (!form.entryTime) {
        newErrors.entryTime = 'Entry time is required for Present records';
      }
    } else if (form.status === 'Permission') {
      if (!form.entryTime) {
        newErrors.entryTime = 'Permission From Time is required';
      }
      if (!form.exitTime) {
        newErrors.exitTime = 'Permission To Time is required';
      } else if (form.entryTime && form.exitTime <= form.entryTime) {
        newErrors.exitTime = 'To time must be after From time';
      }
      if (!form.leaveReason || !form.leaveReason.trim()) {
        newErrors.leaveReason = 'Permission reason is required';
      }
    } else if (form.status === 'Absent') {
      if (!form.leaveReason || !form.leaveReason.trim()) {
        newErrors.leaveReason = 'Absence reason/notes are required';
      }
    }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ─── submit handler ────────────────────────────────────── */
  const handleAdd = async () => {
    if (!validate()) return;
 
    let payload = {};
    if (form.status === 'Present') {
      payload = {
        staffId:    form.staffId,
        date:       form.date,
        status:     'Present',
        entryTime:  form.entryTime,
        exitTime:   form.exitTime || undefined,
        exitLocked: !!form.exitTime,
      };
    } else if (form.status === 'Permission') {
      payload = {
        staffId:     form.staffId,
        date:        form.date,
        status:      'Permission',
        entryTime:   form.entryTime, // From Time
        exitTime:    form.exitTime,  // To Time
        leaveReason: form.leaveReason.trim(),
        exitLocked:  true,
      };
    } else { // Absent
      payload = {
        staffId:     form.staffId,
        date:        form.date,
        status:      'Absent',
        leaveReason: form.leaveReason.trim(),
        exitLocked:  false,
      };
    }

    try {
      await axios.post(`${API}/api/attendance`, payload);

      // Reset form
      setForm({
        staffId:     '',
        date:        filterForm.fromDate || todayStr,
        entryTime:   '',
        exitTime:    '',
        leaveReason: '',
        status:      'Present',
      });
      setErrors({});
      fetchAttendance();
    } catch (err) {
      console.error('Error adding attendance', err);
    }
  };

  /* ─── exit-time edit handlers ───────────────────────────── */
  const handleEditClick = (record) => {
    setEditRecordId(record._id);
    setEditExitTime(record.exitTime || '');
  };

  const handleSaveExitTime = async (id) => {
    try {
      await axios.put(`${API}/api/attendance/${id}`, { exitTime: editExitTime });
      setEditRecordId(null);
      setEditExitTime('');
      fetchAttendance();
    } catch (err) {
      console.error('Error updating exit time', err);
    }
  };

  /* ─── filter handlers ─────────────────────────────────────── */
  const handleApplyFilter = () => {
    setAppliedFilters({ ...filterForm });
  };

  const handleResetFilter = () => {
    const resetForm = {
      fromDate: todayStr,
      toDate:   '',
      staffId:  '',
    };
    setFilterForm(resetForm);
    setAppliedFilters(resetForm);
  };

  /* ─── Excel / CSV download handler ───────────────────────── */
  const handleExportExcel = () => {
    const headers = ['Staff ID', 'Staff Name', 'Date', 'Status', 'Entry Time', 'Exit Time', 'Leave Reason'];
    
    const rows = filteredRecords.map(r => {
      const isLeave = r.status === 'Leave';
      const staffId = r.staffId?.staffId || '-';
      const staffName = r.staffId?.name || 'Unknown';
      const formattedDate = new Date(r.date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      });
      const status = r.status || 'Present';
      const entryTime = isLeave ? '-' : (r.entryTime || '-');
      const exitTime = isLeave ? '-' : (r.exitTime || '-');
      const leaveReason = r.status !== 'Present' ? (r.leaveReason || '-') : '-';
      
      return [
        staffId,
        staffName,
        formattedDate,
        status,
        entryTime,
        exitTime,
        leaveReason
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(value => {
          const stringVal = String(value);
          if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
          }
          return stringVal;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Staff_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ─── records list filtering logic ────────────────────────── */
  const filteredRecords = records.filter((r) => {
    if (!r.date) return false;
    
    const recordDateStr = r.date.split('T')[0];
    
    // 1. From Date is mandatory
    if (appliedFilters.fromDate) {
      if (recordDateStr < appliedFilters.fromDate) return false;
    } else {
      return false;
    }
    
    // 2. To Date is optional
    if (appliedFilters.toDate) {
      if (recordDateStr > appliedFilters.toDate) return false;
    } else {
      // If only From Date is selected, show records from that date until today
      if (recordDateStr > todayStr) return false;
    }
    
    // 3. Staff is optional
    if (appliedFilters.staffId) {
      if (r.staffId?._id !== appliedFilters.staffId) return false;
    }
    
    return true;
  });

  /* ─── derived: is the current form in leave mode? ──────── */
  const leaveMode = form.status !== 'Present';

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <CalendarCheck size={24} className="text-[#D4AF37]" />
            Attendance Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track daily staff check-ins, check-outs, and leaves.</p>
        </div>

      </div>

      {/* ── Advanced Filter & Export Panel ── */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 pb-3 border-b border-gray-100 gap-3">
          <h2 className="text-sm font-cinzel font-bold uppercase tracking-wide text-gray-700">
            Search &amp; Filter History
          </h2>
          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            disabled={filteredRecords.length === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all border ${
              filteredRecords.length > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
            }`}
          >
            <Download size={14} className={filteredRecords.length > 0 ? 'text-emerald-600' : 'text-gray-400'} />
            Excel Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* From Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
              From Date <span className="text-amber-600">*</span>
            </label>
            <input
              type="date"
              value={filterForm.fromDate}
              onChange={(e) => setFilterForm({ ...filterForm, fromDate: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
              To Date <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span>
            </label>
            <input
              type="date"
              value={filterForm.toDate}
              onChange={(e) => setFilterForm({ ...filterForm, toDate: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>

          {/* Staff filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
              Select Staff <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span>
            </label>
            <select
              value={filterForm.staffId}
              onChange={(e) => setFilterForm({ ...filterForm, staffId: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            >
              <option value="">-- All Staff --</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}{s.staffId ? ` - ${s.staffId}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApplyFilter}
              disabled={!filterForm.fromDate}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${
                filterForm.fromDate
                  ? 'bg-[#111] text-white hover:bg-gray-800 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              <Search size={14} className={filterForm.fromDate ? 'text-[#FFD700]' : 'text-gray-400'} />
              Apply
            </button>
            <button
              onClick={handleResetFilter}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wider border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h2
          className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          {form.status === 'Present' ? 'Mark Attendance' : `Log Staff ${form.status}`}
        </h2>

        {/* Row 1 — always-visible fields (Staff & Date) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Staff dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
              Select Staff <span className="text-amber-600">*</span>
            </label>
            <select
              value={form.staffId}
              onChange={(e) => {
                setForm({ ...form, staffId: e.target.value });
                if (errors.staffId) setErrors({ ...errors, staffId: null });
              }}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                errors.staffId
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            >
              <option value="">-- Select Staff --</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}{s.staffId ? ` - ${s.staffId}` : ''}
                </option>
              ))}
            </select>
            {errors.staffId && (
              <span className="text-red-500 text-xs font-medium mt-0.5">{errors.staffId}</span>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
              Date <span className="text-amber-600">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: null });
              }}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                errors.date
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            />
            {errors.date && (
              <span className="text-red-500 text-xs font-medium mt-0.5">{errors.date}</span>
            )}
          </div>

        </div>

        {/* Row 2 — Attendance Type Selection */}
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-xs font-cinzel font-bold uppercase tracking-wide text-gray-700">
            Attendance Type <span className="text-amber-600">*</span>
          </label>
          <div className="flex bg-gray-50 p-1 rounded-xl w-full max-w-xl border border-gray-200 flex-wrap gap-1 md:gap-0">
            {['Present', 'Absent', 'Permission'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setForm({ ...form, status: type });
                  if (type === 'Present') {
                    if (errors.leaveReason) setErrors({ ...errors, leaveReason: null });
                  } else {
                    if (errors.entryTime) setErrors({ ...errors, entryTime: null });
                  }
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-cinzel text-[0.65rem] font-bold uppercase tracking-widest transition-all min-w-[100px] ${
                  form.status === type
                    ? 'bg-[#111] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 bg-transparent'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3 — Present & Permission Time Fields */}
        {(form.status === 'Present' || form.status === 'Permission') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Entry/From time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
                {form.status === 'Present' ? 'Entry Time' : 'Permission From Time'} <span className="text-amber-600">*</span>
              </label>
              <input
                type="time"
                value={form.entryTime}
                onChange={(e) => {
                  setForm({ ...form, entryTime: e.target.value });
                  if (errors.entryTime) setErrors({ ...errors, entryTime: null });
                }}
                className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                  errors.entryTime
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
                }`}
              />
              {errors.entryTime && (
                <span className="text-red-500 text-xs font-medium mt-0.5">{errors.entryTime}</span>
              )}
            </div>

            {/* Exit/To time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
                {form.status === 'Present' ? (
                  <>Exit Time <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span></>
                ) : (
                  <>Permission To Time <span className="text-amber-600">*</span></>
                )}
              </label>
              <input
                type="time"
                value={form.exitTime}
                onChange={(e) => {
                  setForm({ ...form, exitTime: e.target.value });
                  if (errors.exitTime) setErrors({ ...errors, exitTime: null });
                }}
                className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                  errors.exitTime
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
                }`}
              />
              {errors.exitTime && (
                <span className="text-red-500 text-xs font-medium mt-0.5">{errors.exitTime}</span>
              )}
            </div>
          </div>
        )}

        {/* Row 4 — Reason / Details for Absent & Permission & Leave */}
        {form.status !== 'Present' && (
          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
              {form.status} Reason/Details <span className="text-amber-600">*</span>
            </label>
            <textarea
              placeholder={`e.g. Reason for ${form.status.toLowerCase()}...`}
              value={form.leaveReason}
              onChange={(e) => {
                setForm({ ...form, leaveReason: e.target.value });
                if (errors.leaveReason) setErrors({ ...errors, leaveReason: null });
              }}
              rows={3}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors resize-none ${
                errors.leaveReason
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            />
            {errors.leaveReason && (
              <span className="text-red-500 text-xs font-medium mt-0.5">{errors.leaveReason}</span>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg bg-[#111] text-white"
          >
            <Plus size={16} className="text-[#FFD700]" />
            {leaveMode ? 'Save Leave' : 'Mark Attendance'}
          </button>
        </div>
      </div>

      {/* ── Results table ── */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Staff</th>
                <th className="p-4      text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Date</th>
                <th className="p-4      text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Status</th>
                <th className="p-4      text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Entry Time</th>
                <th className="p-4      text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Exit Time</th>
                <th className="p-4      text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Reason / Notes</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => {
                  const isLeave   = r.status === 'Leave';
                  const isPresent = !isLeave;
                  const isEditing = editRecordId === r._id;

                  return (
                    <tr key={r._id} className={`transition-colors ${isLeave ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-[#FFFCF5]'}`}>

                      {/* Staff */}
                      <td className="p-4 pl-6">
                        <div className="font-medium text-gray-900 font-playfair">{r.staffId?.name || 'Unknown'}</div>
                        <div className="text-xs mt-0.5 tracking-wider font-mono text-amber-700">{r.staffId?.staffId || '—'}</div>
                      </td>

                      {/* Date */}
                      <td className="p-4 font-cormorant text-lg text-gray-600">
                        {new Date(r.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          r.status === 'Leave'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : r.status === 'Absent'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : r.status === 'Permission'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {r.status || 'Present'}
                        </span>
                      </td>

                      {/* Entry time */}
                      <td className="p-4">
                        {(r.status === 'Leave' || r.status === 'Absent') ? (
                          <span className="text-gray-300 text-sm">—</span>
                        ) : (
                          r.entryTime
                            ? <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${r.status === 'Permission' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{r.entryTime}</span>
                            : <span className="italic text-sm text-gray-300">—</span>
                        )}
                      </td>

                      {/* Exit time */}
                      <td className="p-4">
                        {(r.status === 'Leave' || r.status === 'Absent') ? (
                          <span className="text-gray-300 text-sm">—</span>
                        ) : isEditing ? (
                          <input
                            type="time"
                            value={editExitTime}
                            onChange={(e) => setEditExitTime(e.target.value)}
                            className="p-2 rounded-lg border border-amber-200 focus:outline-none focus:border-amber-400 bg-amber-50 text-sm text-gray-800"
                            autoFocus
                          />
                        ) : r.exitTime ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${r.status === 'Permission' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{r.exitTime}</span>
                        ) : (
                          <span className="italic text-sm text-gray-300">Not marked</span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="p-4 max-w-[200px]">
                        {r.status !== 'Present' ? (
                          <span
                            className={`text-sm font-cormorant leading-snug block truncate font-semibold ${
                              r.status === 'Leave' ? 'text-amber-800' : r.status === 'Absent' ? 'text-red-700' : 'text-indigo-700'
                            }`}
                            title={r.leaveReason || ''}
                          >
                            {r.leaveReason || '—'}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        {r.status !== 'Present' ? (
                          /* ── Non-present records: never show edit exit ── */
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            r.status === 'Leave'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : r.status === 'Absent'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : r.status === 'Permission'
                              ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                              : 'bg-green-50 text-green-600 border-green-200'
                          }`}>
                            {r.status}
                          </span>
                        ) : r.exitLocked ? (
                          /* ── Locked present records ── */
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">
                            <Lock size={10} /> Locked
                          </span>
                        ) : isEditing ? (
                          /* ── Editing exit time ── */
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSaveExitTime(r._id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider bg-[#111] text-white transition-colors"
                            >
                              <Save size={14} className="text-[#FFD700]" /> Save
                            </button>
                            <button
                              onClick={() => setEditRecordId(null)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          /* ── Unlocked present record: show edit button ── */
                          <button
                            onClick={() => handleEditClick(r)}
                            className="font-cinzel font-bold text-xs uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg text-amber-700 border border-amber-200 hover:bg-amber-50"
                          >
                            Edit Exit
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="text-gray-300 mb-2">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-cormorant italic text-lg">
                      No attendance or leave records found for the selected date.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;