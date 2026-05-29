import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarCheck, Plus, Save, AlertCircle, Lock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/* ─── tiny helper ─────────────────────────────────────────── */
const isLeaveEntry = (leaveReason) =>
  typeof leaveReason === 'string' && leaveReason.trim().length > 0;

const Attendance = () => {
  const [staffList, setStaffList] = useState([]);
  const [records, setRecords]     = useState([]);

  const todayStr = getTodayStr();
  const [filterDate, setFilterDate] = useState(todayStr);

  /* ── form state ── */
  const [form, setForm] = useState({
    staffId:     '',
    date:        todayStr,
    entryTime:   '',
    exitTime:    '',
    leaveReason: '',
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

    // Entry time is required ONLY when it is NOT a leave entry
    if (!isLeaveEntry(form.leaveReason) && !form.entryTime) {
      newErrors.entryTime = 'Entry time is required for Present records';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ─── submit handler ────────────────────────────────────── */
  const handleAdd = async () => {
    if (!validate()) return;

    const leaveMode = isLeaveEntry(form.leaveReason);

    // Build a clean, explicit payload — no undefined values sent
    const payload = leaveMode
      ? {
          staffId:     form.staffId,
          date:        form.date,
          status:      'Leave',
          leaveReason: form.leaveReason.trim(),
          exitLocked:  false,
          // entryTime / exitTime intentionally omitted
        }
      : {
          staffId:    form.staffId,
          date:       form.date,
          status:     'Present',
          entryTime:  form.entryTime,
          exitTime:   form.exitTime || undefined,
          exitLocked: !!form.exitTime,
          // leaveReason intentionally omitted
        };

    try {
      await axios.post(`${API}/api/attendance`, payload);

      // Reset form
      setForm({
        staffId:     '',
        date:        filterDate || todayStr,
        entryTime:   '',
        exitTime:    '',
        leaveReason: '',
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

  /* ─── date filter ───────────────────────────────────────── */
  const filteredRecords = records.filter((r) => {
    if (!filterDate) return true;
    if (!r.date) return false;
    return r.date.split('T')[0] === filterDate;
  });

  /* ─── derived: is the current form in leave mode? ──────── */
  const leaveMode = isLeaveEntry(form.leaveReason);

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

        {/* Date filter */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
          <label className="text-xs font-cinzel font-bold uppercase tracking-wide text-gray-700">Filter:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border-none bg-transparent focus:outline-none focus:ring-0 font-cormorant text-lg text-gray-800 cursor-pointer"
          />
        </div>
      </div>

      {/* ── Leave-mode banner ── */}
      {leaveMode && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl border border-amber-200 bg-amber-50">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <p className="text-xs font-cinzel font-semibold uppercase tracking-wide text-amber-800">
            Leave Mode Active — Entry &amp; Exit time fields are disabled. This record will be saved as <strong>Leave</strong>.
          </p>
        </div>
      )}

      {/* ── Form card ── */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h2
          className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          {leaveMode ? 'Log Staff Leave' : 'Mark Attendance'}
        </h2>

        {/* Row 1 — always-visible fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

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

          {/* Entry time — disabled in leave mode */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-cinzel font-semibold uppercase tracking-wider ${leaveMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Entry Time{!leaveMode && <span className="text-amber-600"> *</span>}
            </label>
            <input
              type="time"
              value={form.entryTime}
              onChange={(e) => {
                setForm({ ...form, entryTime: e.target.value });
                if (errors.entryTime) setErrors({ ...errors, entryTime: null });
              }}
              disabled={leaveMode}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                leaveMode
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed opacity-40'
                  : errors.entryTime
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            />
            {errors.entryTime && !leaveMode && (
              <span className="text-red-500 text-xs font-medium mt-0.5">{errors.entryTime}</span>
            )}
          </div>

          {/* Exit time — disabled in leave mode */}
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-cinzel font-semibold uppercase tracking-wide ${leaveMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Exit Time <span className="text-xs font-normal text-gray-400 ml-1">(Optional)</span>
            </label>
            <input
              type="time"
              value={form.exitTime}
              onChange={(e) => setForm({ ...form, exitTime: e.target.value })}
              disabled={leaveMode}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                leaveMode
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed opacity-40'
                  : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            />
          </div>
        </div>

        {/* Row 2 — Leave Reason (full width, separate row) */}
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">
            Leave Reason
            <span className="text-xs font-normal normal-case tracking-normal text-gray-400 ml-2">
              (optional — filling this field marks the record as Leave and disables entry/exit times)
            </span>
          </label>
          <textarea
            placeholder="e.g. Sick leave, Personal emergency..."
            value={form.leaveReason}
            onChange={(e) => {
              setForm({ ...form, leaveReason: e.target.value });
              // Dismiss any entryTime error when switching to leave mode
              if (errors.entryTime) setErrors({ ...errors, entryTime: null });
            }}
            rows={2}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors resize-none"
          />
        </div>

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
                <th className="p-4      text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Leave Reason</th>
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
                          isLeave
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {r.status || 'Present'}
                        </span>
                      </td>

                      {/* Entry time */}
                      <td className="p-4">
                        {isLeave ? (
                          <span className="text-gray-300 text-sm">—</span>
                        ) : (
                          r.entryTime
                            ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">{r.entryTime}</span>
                            : <span className="italic text-sm text-gray-300">—</span>
                        )}
                      </td>

                      {/* Exit time */}
                      <td className="p-4">
                        {isLeave ? (
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
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">{r.exitTime}</span>
                        ) : (
                          <span className="italic text-sm text-gray-300">Not marked</span>
                        )}
                      </td>

                      {/* Leave Reason */}
                      <td className="p-4 max-w-[200px]">
                        {isLeave ? (
                          <span
                            className="text-sm text-amber-800 font-cormorant leading-snug block truncate"
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
                        {isLeave ? (
                          /* ── Leave records: never show edit exit ── */
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                            Leave
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