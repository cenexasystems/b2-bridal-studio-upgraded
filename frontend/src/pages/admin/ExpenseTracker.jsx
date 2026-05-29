import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Wallet, Plus, Trash2, Calendar, Search, Filter, RotateCcw, X, Check, FileSpreadsheet } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const ExpenseTracker = () => {
  const [staffList, setStaffList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    staffId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    amount: ''
  });

  // Filter Inputs (From Date is Mandatory per requirements)
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterStaffId, setFilterStaffId] = useState('');

  // Applied Filter States
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    staffId: ''
  });
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [staffRes, expensesRes] = await Promise.all([
        axios.get(`${API}/api/staff`),
        axios.get(`${API}/api/expenses`, config)
      ]);

      setStaffList(staffRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch required data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save expense entry
  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.staffId) {
      setError('Please select a staff member.');
      return;
    }
    if (!form.expenseDate) {
      setError('Please select an expense date.');
      return;
    }
    if (!form.description.trim()) {
      setError('Expense description is required.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    const selectedStaff = staffList.find(s => s.staffId === form.staffId || s._id === form.staffId);
    if (!selectedStaff) {
      setError('Selected staff member is invalid.');
      return;
    }

    setIsSaving(true);

    const payload = {
      staffId: selectedStaff.staffId || selectedStaff._id,
      staffName: selectedStaff.name,
      expenseDate: form.expenseDate,
      description: form.description.trim(),
      amount: Number(form.amount)
    };

    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${API}/api/expenses`, payload, config);

      if (res.status === 201) {
        setSuccessMsg('Expense record saved successfully!');
        // Reset form except staffId and date for quicker repetitive entries
        setForm(prev => ({
          ...prev,
          description: '',
          amount: ''
        }));
        
        // Re-fetch expense list
        const expensesRes = await axios.get(`${API}/api/expenses`, config);
        setExpenses(expensesRes.data);

        // Clear success message after 4 seconds
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save expense entry.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete expense
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API}/api/expenses/${id}`, config);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    } catch (err) {
      alert('Failed to delete the record.');
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    if (!filterFromDate) {
      setError('From Date is mandatory for filtering.');
      // Clear error after 4 seconds
      setTimeout(() => setError(''), 4000);
      return;
    }
    setError('');
    setAppliedFilters({
      fromDate: filterFromDate,
      toDate: filterToDate,
      staffId: filterStaffId
    });
    setIsFilterActive(true);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterFromDate('');
    setFilterToDate('');
    setFilterStaffId('');
    setAppliedFilters({
      fromDate: '',
      toDate: '',
      staffId: ''
    });
    setIsFilterActive(false);
    setError('');
  };

  // Filter logic calculated in frontend
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // 1. Mandatory From Date Filter
      if (appliedFilters.fromDate) {
        const from = new Date(appliedFilters.fromDate);
        from.setHours(0, 0, 0, 0);

        const expDate = new Date(exp.expenseDate);
        expDate.setHours(0, 0, 0, 0);

        if (expDate < from) return false;
      }

      // 2. Optional To Date Filter (If empty, shows records until today)
      if (appliedFilters.fromDate) {
        const to = appliedFilters.toDate ? new Date(appliedFilters.toDate) : new Date();
        to.setHours(23, 59, 59, 999);

        const expDate = new Date(exp.expenseDate);
        if (expDate > to) return false;
      }

      // 3. Optional Staff Filter
      if (appliedFilters.staffId && exp.staffId !== appliedFilters.staffId) {
        return false;
      }

      return true;
    });
  }, [expenses, appliedFilters]);

  // Excel/CSV export function
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert('No records to export.');
      return;
    }

    const headers = ['Date', 'Staff ID', 'Staff Name', 'Expense Description', 'Amount'];
    const rows = filteredExpenses.map(exp => {
      const dateFormatted = new Date(exp.expenseDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
      return [
        dateFormatted,
        exp.staffId,
        exp.staffName,
        exp.description,
        exp.amount
      ];
    });

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="text-center py-20 flex justify-center bg-[#FDFDFD] min-h-screen">
        <div className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <Wallet size={24} className="text-[#D4AF37]" />
            Expense Tracker
          </h1>
          <p className="font-cormorant italic text-base text-gray-600 mt-1">Track day-to-day business expenses made by staff members.</p>
        </div>
      </div>

      {error && <div className="text-red-500 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-cormorant">{error}</div>}
      {successMsg && <div className="text-green-600 mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg font-cormorant flex items-center gap-2"><Check size={18} /> {successMsg}</div>}

      {/* 🛠️ ADD EXPENSE ENTRY FORM */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h3 className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Log New Expense</h3>
        <form onSubmit={handleSaveEntry} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Staff Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Select Staff Member <span className="text-amber-600">*</span></label>
              <select
                value={form.staffId}
                onChange={e => setForm({ ...form, staffId: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                required
              >
                <option value="">-- Choose Staff Member --</option>
                {staffList.map((s) => (
                  <option key={s._id} value={s.staffId || s._id}>
                    {s.name} {s.staffId ? `(${s.staffId})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Expense Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Expense Date <span className="text-amber-600">*</span></label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                required
              />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Amount (₹) <span className="text-amber-600">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                required
              />
            </div>

          </div>

          {/* Expense Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Expense Description <span className="text-amber-600">*</span></label>
            <textarea
              placeholder="e.g., Tea for Customers, Snacks, Water Bottles, Cleaning Materials, Printing Charges, Travel Expense, Miscellaneous..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors resize-none"
              required
            />
            <p className="text-[0.7rem] text-gray-400 font-cinzel uppercase tracking-wide mt-1">
              Examples: Tea, Snacks, Water bottles, Printing, Cleaning materials, Travel, Miscellaneous expenses.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg bg-[#111] text-white disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>

      {/* 🔍 FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h3 className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Filter size={16} className="text-[#D4AF37]" /> Filter Expenses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          
          {/* From Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">From Date <span className="text-amber-600">*</span></label>
            <input
              type="date"
              value={filterFromDate}
              onChange={e => setFilterFromDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-gray-50 text-sm font-inter text-gray-800 transition-colors"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">To Date <span className="text-gray-400 font-cinzel text-[0.65rem] lowercase">(optional)</span></label>
            <input
              type="date"
              value={filterToDate}
              onChange={e => setFilterToDate(e.target.value)}
              min={filterFromDate || undefined}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-gray-50 text-sm font-inter text-gray-800 transition-colors"
            />
          </div>

          {/* Staff filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">Filter By Staff <span className="text-gray-400 font-cinzel text-[0.65rem] lowercase">(optional)</span></label>
            <select
              value={filterStaffId}
              onChange={e => setFilterStaffId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D4AF37] bg-gray-50 text-sm text-gray-800 transition-colors"
            >
              <option value="">-- All Staff --</option>
              {staffList.map(s => {
                const sId = s.staffId || s._id;
                return (
                  <option key={s._id} value={sId}>
                    {s.name} ({sId})
                  </option>
                );
              })}
            </select>
          </div>

        </div>

        <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
          <p className="text-[0.7rem] text-red-500 font-cinzel uppercase tracking-wide">
            {!filterFromDate && "* 'From Date' is mandatory for filtering."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide transition-all shadow-sm hover:shadow-md bg-[#111] text-white"
            >
              <Search size={14} /> Apply Filter
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredExpenses.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide transition-all shadow-sm hover:shadow-md bg-green-700 text-white disabled:opacity-50"
            >
              <FileSpreadsheet size={14} /> Excel Download
            </button>
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {isFilterActive && (appliedFilters.fromDate || appliedFilters.toDate || appliedFilters.staffId) && (
        <div className="mb-4 p-3 bg-amber-50/40 border border-amber-200/50 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-[#92400e]">
          <span>
            Active Filter: 
            {appliedFilters.fromDate && ` From: ${appliedFilters.fromDate}`}
            {appliedFilters.toDate ? ` To: ${appliedFilters.toDate}` : ' To: Today'}
            {appliedFilters.staffId && ` Staff ID: ${appliedFilters.staffId}`}
            {` (Found ${filteredExpenses.length} entries)`}
          </span>
          <button onClick={handleClearFilters} className="text-gray-500 hover:text-amber-800 underline">Reset</button>
        </div>
      )}

      {/* 📋 EXPENSE RESULTS TABLE */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Date</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Staff Details</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Expense Description</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Amount (₹)</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500 font-cormorant italic text-lg">
                    {expenses.length === 0 
                      ? 'No expenses logged yet.' 
                      : 'No expenses match the applied filters.'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-[#FFFCF5] transition-colors">
                    {/* Date */}
                    <td className="p-4 pl-6 text-gray-600 font-cormorant text-lg">
                      {new Date(exp.expenseDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Staff Details */}
                    <td className="p-4">
                      <div className="font-medium text-gray-900 font-playfair">{exp.staffName}</div>
                      <div className="text-xs mt-0.5 tracking-wider font-mono text-amber-700">{exp.staffId}</div>
                    </td>

                    {/* Description */}
                    <td className="p-4 text-gray-700 font-sans text-sm max-w-xs break-words">
                      {exp.description}
                    </td>

                    {/* Amount */}
                    <td className="p-4 text-right font-bold text-gray-900">
                      ₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDeleteEntry(exp._id)}
                        className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
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

export default ExpenseTracker;
