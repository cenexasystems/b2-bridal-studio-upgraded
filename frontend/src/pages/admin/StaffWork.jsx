import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Briefcase, Plus, Trash2, Calendar, Search, Filter, RotateCcw, X, Check, Download } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const StaffWork = () => {
  const [staffList, setStaffList] = useState([]);
  const [services, setServices] = useState([]);
  const [staffWorks, setStaffWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Work Entry Form State
  const [form, setForm] = useState({
    staffId: '',
    customerName: '',
    selectedCategory: '',
    selectedServiceName: '',
    workDate: new Date().toISOString().split('T')[0]
  });
  const [selectedServicesList, setSelectedServicesList] = useState([]);

  // Filter Input States
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterStaffId, setFilterStaffId] = useState('');
  const [searchCustomerName, setSearchCustomerName] = useState('');

  // Applied Filter States
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    staffId: '',
    customerName: ''
  });
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [staffRes, servicesRes, worksRes] = await Promise.all([
        axios.get(`${API}/api/staff`),
        axios.get(`${API}/api/services`),
        axios.get(`${API}/api/staff-work`, config)
      ]);

      setStaffList(staffRes.data);
      setServices(servicesRes.data);
      setStaffWorks(worksRes.data);
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

  // Compute unique categories from services
  const categories = useMemo(() => {
    if (!services || !services.length) return [];
    return [...new Set(services.map(s => s.category))];
  }, [services]);

  // Compute selectable services for current category selection
  const selectableServices = useMemo(() => {
    if (!form.selectedCategory) return [];
    const list = [];
    services.forEach(s => {
      if (s.category === form.selectedCategory) {
        if (s.options && s.options.length > 0) {
          s.options.forEach(opt => {
            list.push(`${s.name} - ${opt.name}`);
          });
        } else {
          list.push(s.name);
        }
      }
    });
    return list;
  }, [form.selectedCategory, services]);

  // Add service to list
  const handleAddService = () => {
    if (!form.selectedCategory || !form.selectedServiceName) {
      alert('Please select both a category and a service.');
      return;
    }

    // Prevent duplicates in current entry
    const isDuplicate = selectedServicesList.some(
      item => item.category === form.selectedCategory && item.serviceName === form.selectedServiceName
    );

    if (isDuplicate) {
      alert('This service has already been added to the list.');
      return;
    }

    setSelectedServicesList([
      ...selectedServicesList,
      { category: form.selectedCategory, serviceName: form.selectedServiceName }
    ]);

    // Clear service selection
    setForm(prev => ({
      ...prev,
      selectedServiceName: ''
    }));
  };

  // Remove service from list
  const handleRemoveService = (index) => {
    setSelectedServicesList(prev => prev.filter((_, i) => i !== index));
  };

  // Save work entry
  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.staffId) {
      setError('Please select a staff member.');
      return;
    }
    if (!form.customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (selectedServicesList.length === 0) {
      setError('Add at least one service performed.');
      return;
    }
    if (!form.workDate) {
      setError('Please choose a work date.');
      return;
    }

    const selectedStaff = staffList.find(s => s._id === form.staffId);
    if (!selectedStaff) {
      setError('Selected staff member is invalid.');
      return;
    }

    const payload = {
      staffId: selectedStaff.staffId || selectedStaff._id,
      staffName: selectedStaff.name,
      customerName: form.customerName.trim(),
      services: selectedServicesList,
      workDate: form.workDate
    };

    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${API}/api/staff-work`, payload, config);

      if (res.status === 201) {
        setSuccessMsg('Staff Work record saved successfully!');
        // Clear form
        setForm(prev => ({
          ...prev,
          customerName: '',
          selectedCategory: '',
          selectedServiceName: '',
          workDate: new Date().toISOString().split('T')[0]
        }));
        setSelectedServicesList([]);
        // Re-fetch staff work logs
        const worksRes = await axios.get(`${API}/api/staff-work`, config);
        setStaffWorks(worksRes.data);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save staff work entry.');
    }
  };

  // Delete work entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff work record?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API}/api/staff-work/${id}`, config);
      setStaffWorks(prev => prev.filter(w => w._id !== id));
    } catch (err) {
      alert('Failed to delete the record.');
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters({
      fromDate: filterFromDate,
      toDate: filterToDate,
      staffId: filterStaffId,
      customerName: searchCustomerName.trim()
    });
    setIsFilterActive(true);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilterFromDate('');
    setFilterToDate('');
    setFilterStaffId('');
    setSearchCustomerName('');
    setAppliedFilters({
      fromDate: '',
      toDate: '',
      staffId: '',
      customerName: ''
    });
    setIsFilterActive(false);
  };

  // Export filtered records to Excel (CSV)
  const handleExportExcel = () => {
    const headers = ['Work Date', 'Staff ID', 'Staff Name', 'Customer Name', 'Services Performed'];
    
    const rows = filteredWorks.map(w => {
      const formattedDate = new Date(w.workDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const staffId = w.staffId || '-';
      const staffName = w.staffName || 'Unknown';
      const customerName = w.customerName || '-';
      const servicesPerformed = (w.services || []).map(s => s.serviceName).join(', ');
      
      return [
        formattedDate,
        staffId,
        staffName,
        customerName,
        servicesPerformed
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
    
    const day = String(new Date().getDate()).padStart(2, '0');
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const year = new Date().getFullYear();
    const formattedFilename = `Staff_Work_Report_${day}-${month}-${year}.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', formattedFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered staff works computed reactively
  const filteredWorks = useMemo(() => {
    return staffWorks.filter(w => {
      // Date range filtering
      if (appliedFilters.fromDate) {
        const from = new Date(appliedFilters.fromDate);
        from.setHours(0, 0, 0, 0);
        const wDate = new Date(w.workDate);
        if (wDate < from) return false;
      }
      if (appliedFilters.toDate) {
        const to = new Date(appliedFilters.toDate);
        to.setHours(23, 59, 59, 999);
        const wDate = new Date(w.workDate);
        if (wDate > to) return false;
      }

      // Staff filter
      if (appliedFilters.staffId && w.staffId !== appliedFilters.staffId) {
        return false;
      }

      // Customer name filter
      if (appliedFilters.customerName) {
        const term = appliedFilters.customerName.toLowerCase();
        if (!w.customerName.toLowerCase().includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [staffWorks, appliedFilters]);

  if (loading) return (
    <div className="text-center py-20 flex justify-center bg-[#FDFDFD] min-h-screen">
      <div className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
            <Briefcase size={24} className="text-[#D4AF37]" />
            Staff Work Tracker
          </h1>
          <p className="font-cormorant italic text-base text-gray-600 mt-1">Track and manage services completed by staff members.</p>
        </div>
      </div>

      {error && <div className="text-red-500 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-cormorant">{error}</div>}
      {successMsg && <div className="text-green-600 mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg font-cormorant flex items-center gap-2"><Check size={18} /> {successMsg}</div>}

      {/* 🛠️ ADD WORK ENTRY FORM */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h3 className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Log New Work Entry</h3>
        <form onSubmit={handleSaveEntry} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Staff Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Select Staff Member <span className="text-amber-600">*</span></label>
              <select
                value={form.staffId}
                onChange={e => setForm({ ...form, staffId: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                required
              >
                <option value="">-- Choose Staff Member --</option>
                {staffList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.staffId ? `(${s.staffId})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Customer Name <span className="text-amber-600">*</span></label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                required
              />
            </div>

            {/* Work Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-700">Work Date <span className="text-amber-600">*</span></label>
              <input
                type="date"
                value={form.workDate}
                onChange={e => setForm({ ...form, workDate: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
                required
              />
            </div>

          </div>

          {/* ➕ SERVICES SUB-FORM SECTION */}
          <div className="p-4 rounded-xl bg-gray-50/50 border border-dashed border-gray-200">
            <h4 className="text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
              Add Services Performed
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">Service Category</label>
                <select
                  value={form.selectedCategory}
                  onChange={e => setForm({ ...form, selectedCategory: e.target.value, selectedServiceName: '' })}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-white font-cormorant text-lg text-gray-800 transition-colors"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">Select Service</label>
                <select
                  value={form.selectedServiceName}
                  onChange={e => setForm({ ...form, selectedServiceName: e.target.value })}
                  disabled={!form.selectedCategory}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-white font-cormorant text-lg text-gray-800 transition-colors disabled:opacity-50"
                >
                  <option value="">-- Select Service --</option>
                  {selectableServices.map(srv => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>

              {/* Add service button */}
              <button
                type="button"
                onClick={handleAddService}
                disabled={!form.selectedCategory || !form.selectedServiceName}
                className="flex justify-center items-center gap-2 p-2.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Plus size={16} /> Add Service
              </button>
            </div>

            {/* List of currently added services for this entry */}
            {selectedServicesList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs font-cinzel font-semibold text-gray-500 uppercase mb-2">Added Services for entry:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServicesList.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFAF0] text-gray-800 border border-[#FFD700]/30 shadow-sm"
                    >
                      <span className="text-[0.65rem] font-bold uppercase text-amber-700 tracking-wider bg-amber-100/60 px-1.5 py-0.5 rounded mr-1">
                        {item.category}
                      </span>
                      {item.serviceName}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove service"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg bg-[#111] text-white"
            >
              Save Work Entry
            </button>
          </div>
        </form>
      </div>

      {/* 🔍 FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <h3 className="text-sm font-cinzel font-bold uppercase tracking-wide mb-5 pb-3 text-gray-700 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Filter size={16} className="text-[#D4AF37]" /> Filter Log Records
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          
          {/* From Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">From Date</label>
            <input
              type="date"
              value={filterFromDate}
              onChange={e => setFilterFromDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm font-inter text-gray-800 transition-colors"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">To Date</label>
            <input
              type="date"
              value={filterToDate}
              onChange={e => setFilterToDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm font-inter text-gray-800 transition-colors"
            />
          </div>

          {/* Staff filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">Filter By Staff</label>
            <select
              value={filterStaffId}
              onChange={e => setFilterStaffId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm text-gray-800 transition-colors"
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

          {/* Customer Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-cinzel font-semibold uppercase tracking-wide text-gray-500">Search Customer Name</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search..."
                value={searchCustomerName}
                onChange={e => setSearchCustomerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm text-gray-800 transition-colors"
              />
              <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={16} />
            </div>
          </div>

        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handleExportExcel}
            disabled={filteredWorks.length === 0}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wider transition-all border ${
              filteredWorks.length > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
            }`}
          >
            <Download size={14} className={filteredWorks.length > 0 ? 'text-emerald-600' : 'text-gray-400'} />
            Export to Excel
          </button>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <RotateCcw size={14} /> Clear
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide transition-all shadow-sm hover:shadow-md bg-[#111] text-white"
          >
            <Search size={14} /> Apply Filter
          </button>
        </div>
      </div>

      {/* Active filters summary */}
      {isFilterActive && (appliedFilters.fromDate || appliedFilters.toDate || appliedFilters.staffId || appliedFilters.customerName) && (
        <div className="mb-4 p-3 bg-amber-50/40 border border-amber-200/50 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-[#92400e]">
          <span>
            Active Filter: 
            {appliedFilters.fromDate && ` From: ${appliedFilters.fromDate}`}
            {appliedFilters.toDate && ` To: ${appliedFilters.toDate}`}
            {appliedFilters.staffId && ` Staff ID: ${appliedFilters.staffId}`}
            {appliedFilters.customerName && ` Customer: "${appliedFilters.customerName}"`}
            {` (Found ${filteredWorks.length} entries)`}
          </span>
          <button onClick={handleClearFilters} className="text-gray-500 hover:text-amber-800 underline">Reset</button>
        </div>
      )}

      {/* 📋 STAFF WORK RESULTS TABLE */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Date</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Staff Details</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Customer Name</th>
                <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700">Services Performed</th>
                <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500 font-cormorant italic text-lg">
                    {staffWorks.length === 0 
                      ? 'No staff work records logged yet.' 
                      : 'No work records match the applied filters.'}
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work) => (
                  <tr key={work._id} className="hover:bg-[#FFFCF5] transition-colors">
                    {/* Date */}
                    <td className="p-4 pl-6 text-gray-600 font-cormorant text-lg">
                      {new Date(work.workDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Staff Details */}
                    <td className="p-4">
                      <div className="font-medium text-gray-900 font-playfair">{work.staffName}</div>
                      <div className="text-xs mt-0.5 tracking-wider font-mono text-amber-700">{work.staffId}</div>
                    </td>

                    {/* Customer */}
                    <td className="p-4 text-gray-900 font-playfair font-medium">
                      {work.customerName}
                    </td>

                    {/* Services performed list */}
                    <td className="p-4">
                      <ul className="space-y-1">
                        {(work.services || []).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1 py-0.5 rounded leading-none mr-1">
                              {s.category}
                            </span>
                            {s.serviceName}
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDeleteEntry(work._id)}
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

export default StaffWork;
