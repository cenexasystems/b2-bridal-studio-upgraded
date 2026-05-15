import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    exitTime: ''
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
    if (!form.entryTime) newErrors.entryTime = 'Please enter entry time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ➕ Add attendance
  const handleAdd = async () => {
    if (!validate()) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance`, form);

      setForm({
        staffId: '',
        date: filterDate || todayStr, // Default to currently viewed date
        entryTime: '',
        exitTime: ''
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold font-playfair tracking-wide text-zinc-900">Attendance Management</h1>
        
        {/* Date Filter */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-zinc-200">
          <label className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">Filter Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border-none bg-transparent focus:outline-none focus:ring-0 text-zinc-900 font-medium cursor-pointer"
          />
        </div>
      </div>

      {/* ➕ FORM CARD */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 mb-8">
        <h2 className="text-lg font-semibold mb-5 text-zinc-800 border-b border-zinc-100 pb-3">Mark Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Staff Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">Select Staff <span className="text-red-500">*</span></label>
            <select
              value={form.staffId}
              onChange={(e) => {
                setForm({ ...form, staffId: e.target.value });
                if (errors.staffId) setErrors({ ...errors, staffId: null });
              }}
              className={`border p-2.5 rounded-md focus:outline-none transition-shadow bg-zinc-50 ${errors.staffId ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'border-zinc-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'}`}
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
            <label className="text-sm font-medium text-zinc-700">Attendance Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                if (errors.date) setErrors({ ...errors, date: null });
              }}
              className={`border p-2.5 rounded-md focus:outline-none transition-shadow bg-zinc-50 ${errors.date ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'border-zinc-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'}`}
            />
            {errors.date && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.date}</span>}
          </div>

          {/* Entry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">Entry Time <span className="text-red-500">*</span></label>
            <input
              type="time"
              value={form.entryTime}
              onChange={(e) => {
                setForm({ ...form, entryTime: e.target.value });
                if (errors.entryTime) setErrors({ ...errors, entryTime: null });
              }}
              className={`border p-2.5 rounded-md focus:outline-none transition-shadow bg-zinc-50 ${errors.entryTime ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'border-zinc-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'}`}
            />
            {errors.entryTime && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.entryTime}</span>}
          </div>

          {/* Exit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">Exit Time <span className="text-zinc-400 text-xs font-normal ml-1">(Optional)</span></label>
            <input
              type="time"
              value={form.exitTime}
              onChange={(e) => setForm({ ...form, exitTime: e.target.value })}
              className="border border-zinc-200 bg-zinc-50 p-2.5 rounded-md focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-shadow"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleAdd}
            className="bg-zinc-900 text-white px-8 py-2.5 rounded-md uppercase tracking-widest font-semibold text-sm hover:bg-[#D4AF37] transition-colors shadow-sm"
          >
            Mark Attendance
          </button>
        </div>
      </div>

      {/* 📋 TABLE CARD */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Staff Details</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Entry Time</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Exit Time</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-900">{r.staffId?.name || 'Unknown Staff'}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 tracking-wide">{r.staffId?.staffId || 'NO ID'}</div>
                    </td>
                    <td className="p-4 text-zinc-700 font-medium">
                      {new Date(r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border border-emerald-100">
                        {r.entryTime}
                      </span>
                    </td>
                    <td className="p-4">
                      {editRecordId === r._id ? (
                        <input
                          type="time"
                          value={editExitTime}
                          onChange={(e) => setEditExitTime(e.target.value)}
                          className="border border-zinc-300 p-1.5 rounded focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm shadow-inner"
                          autoFocus
                        />
                      ) : (
                        r.exitTime ? (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border border-blue-100">
                            {r.exitTime}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic text-sm">- Not marked -</span>
                        )
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {editRecordId === r._id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSaveExitTime(r._id)}
                            className="bg-[#D4AF37] text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-yellow-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditRecordId(null)}
                            className="bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(r)}
                          className="text-[#D4AF37] hover:text-yellow-700 font-bold text-xs uppercase tracking-wider transition-colors border border-transparent hover:border-[#D4AF37] px-3 py-1.5 rounded"
                        >
                          Edit Exit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="text-zinc-400 mb-2">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-zinc-500 font-medium">No attendance records found for the selected date.</p>
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