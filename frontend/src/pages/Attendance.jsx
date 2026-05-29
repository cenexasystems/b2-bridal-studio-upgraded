import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarCheck, Plus, Save, X } from 'lucide-react';

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Attendance = () => {
  const [staffList, setStaffList] = useState([]);
  const [records, setRecords] = useState([]);
  
  // States for Date filtering
  const todayStr = getTodayStr();
  const [filterDate, setFilterDate] = useState(todayStr);

  const [form, setForm] = useState({
    staffId: '',
    date: todayStr, // Default to today
    entryTime: '',
    exitTime: '',
    leaveReason: ''
  });

  const [errors, setErrors] = useState({});
  const [editRecordId, setEditRecordId] = useState(null);
  const [editExitTime, setEditExitTime] = useState('');

  // 📥 Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff`);
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 📥 Fetch attendance
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`);
      // Sort records descending by date just in case
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchAttendance();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.staffId) newErrors.staffId = 'Please select staff';
    if (!form.date) newErrors.date = 'Please select attendance date';
    
    const isLeave = !!form.leaveReason;
    if (!isLeave && !form.entryTime) newErrors.entryTime = 'Please enter entry time';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ➕ Add attendance
  const handleAdd = async () => {
    if (!validate()) return;

    try {
      const isLeave = !!form.leaveReason;
      const payload = {
        staffId: form.staffId,
        date: form.date,
        status: isLeave ? 'Leave' : 'Present',
        leaveReason: isLeave ? form.leaveReason : undefined,
        entryTime: isLeave ? undefined : form.entryTime,
        exitTime: isLeave ? undefined : form.exitTime,
        exitLocked: !isLeave && !!form.exitTime
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance`, payload);

      setForm({
        staffId: '',
        date: filterDate || todayStr, // Default to currently viewed date
        entryTime: '',
        exitTime: '',
        leaveReason: ''
      });
      setErrors({});

      fetchAttendance();
    } catch (err) {
      console.error("Error adding attendance", err);
    }
  };

  // ✏️ Handle Edit Exit Time Click
  const handleEditClick = (record) => {
    setEditRecordId(record._id);
    setEditExitTime(record.exitTime || '');
  };

  // 💾 Save Edit Exit Time
  const handleSaveExitTime = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/attendance/${id}`, { exitTime: editExitTime });
      setEditRecordId(null);
      setEditExitTime('');
      fetchAttendance();
    } catch (err) {
      console.error("Error updating exit time", err);
    }
  };
  
  // Filter records by selected date
  const filteredRecords = records.filter((r) => {
    if (!filterDate) return true; // Show all if filter cleared
    if (!r.date) return false;
    const recordDateStr = r.date.split('T')[0];
    return recordDateStr === filterDate;
  });

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <CalendarCheck size={24} className="text-[#D4AF37]" />
            Attendance Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track daily staff check-ins, check-outs, and leaves.</p>
        </div>
        
        {/* Date Filter */}
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

      {/* ➕ FORM CARD */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h2 className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Mark Attendance / Log Leave</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Staff Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Select Staff <span className="text-amber-600">*</span></label>
            <select
              value={form.staffId}
              onChange={(e) => {
                setForm({ ...form, staffId: e.target.value });
                if (errors.staffId) setErrors({ ...errors, staffId: null });
              }}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                errors.staffId ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            >
              <option value="">-- Select Staff --</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.staffId ? `- ${s.staffId}` : ''}
                </option>
              ))}
            </select>
            {errors.staffId && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.staffId}</span>}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Date <span className="text-amber-600">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: null });
              }}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors ${
                errors.date ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            />
            {errors.date && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.date}</span>}
          </div>

          {/* Entry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wider text-gray-500">Entry Time <span className="text-amber-600">*</span></label>
            <input
              type="time"
              value={form.entryTime}
              onChange={(e) => {
                setForm({ ...form, entryTime: e.target.value });
                if (errors.entryTime) setErrors({ ...errors, entryTime: null });
              }}
              disabled={!!form.leaveReason}
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-1 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors disabled:opacity-50 ${
                errors.entryTime ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-[#FFD700] focus:ring-[#FFD700]/30'
              }`}
            />
            {errors.entryTime && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.entryTime}</span>}
          </div>

          {/* Exit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Exit Time <span className="text-xs font-normal text-gray-500 ml-1">(Optional)</span></label>
            <input
              type="time"
              value={form.exitTime}
              onChange={(e) => setForm({ ...form, exitTime: e.target.value })}
              disabled={!!form.leaveReason}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Leave Reason */}
          <div className="flex flex-col gap-1.5 md:col-span-4 mt-2">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Leave Reason <span className="text-xs font-normal text-gray-500 ml-1">(Optional - filling this logs record as a Leave and bypasses Entry/Exit requirements)</span></label>
            <textarea
              placeholder="Enter reason for leave..."
              value={form.leaveReason}
              onChange={(e) => {
                setForm({ ...form, leaveReason: e.target.value });
                if (errors.entryTime) setErrors({ ...errors, entryTime: null });
              }}
              rows="2"
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg bg-[#111] text-white"
          >
            <Plus size={16} className="text-[#FFD700]" /> Save Record
          </button>
        </div>
      </div>

      {/* 📋 TABLE CARD */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Staff Details</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Date</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Entry Time</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Exit Time</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Status</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Details / Reason</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-[#FFFCF5] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-medium text-gray-900 font-playfair">{r.staffId?.name || 'Unknown Staff'}</div>
                      <div className="text-xs mt-0.5 tracking-wider font-mono text-amber-700">{r.staffId?.staffId || 'NO ID'}</div>
                    </td>
                    <td className="p-4 font-cormorant text-lg text-gray-600">
                      {new Date(r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {r.status === 'Leave' ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          {r.entryTime}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.status === 'Leave' ? (
                        <span className="text-gray-300">—</span>
                      ) : editRecordId === r._id ? (
                        <input
                          type="time"
                          value={editExitTime}
                          onChange={(e) => setEditExitTime(e.target.value)}
                          className="p-2 rounded-lg border border-amber-200 focus:outline-none focus:border-amber-400 bg-amber-50 text-sm text-gray-800"
                          autoFocus
                        />
                      ) : (
                        r.exitTime ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {r.exitTime}
                          </span>
                        ) : (
                          <span className="italic text-sm text-gray-300">- Not marked -</span>
                        )
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        r.status === 'Leave'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {r.status || 'Present'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-cormorant text-lg text-gray-600 max-w-xs truncate" title={r.leaveReason || ''}>
                      {r.status === 'Leave' ? (r.leaveReason || '—') : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {r.status === 'Leave' ? (
                        <span className="text-xs text-gray-400 italic font-cinzel">Leave Record</span>
                      ) : r.exitLocked ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">Locked</span>
                      ) : editRecordId === r._id ? (
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
                        <button
                          onClick={() => handleEditClick(r)}
                          className="font-cinzel font-bold text-xs uppercase tracking-wider transition-colors px-3 py-1.5 rounded-lg text-amber-700 border border-amber-200 hover:bg-amber-50"
                        >
                          Edit Exit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="text-gray-300 mb-2">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-cormorant italic text-lg">No attendance or leave records found for the selected date.</p>
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