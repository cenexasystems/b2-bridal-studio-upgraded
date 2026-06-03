import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Scissors, Receipt, CreditCard, 
  TrendingUp, FileText, Menu, X, Lock, Eye, EyeOff, 
  Package, GraduationCap, Boxes, Users, CalendarCheck, 
  Tag, CalendarOff, Briefcase, Wallet, ShieldCheck, 
  Search, ShieldAlert, Award, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import ManageServices from './ManageServices.jsx';
import ViewBookings from './ViewBookings.jsx';
import ManageProducts from './ManageProducts.jsx';
import ManageCourses from './ManageCourses';
import ManageStock from '../ManageStock';
import ManageStaff from '../ManageStaff';
import Attendance from '../Attendance';
import PaymentVerification from './PaymentVerification';
import Revenue from './Revenue';
import Billing from './Billing';
import ManageCoupons from './ManageCoupons';
import SlotManagement from './SlotManagement.jsx';
import StaffWork from './StaffWork.jsx';
import ExpenseTracker from './ExpenseTracker.jsx';
import StaffReports from './StaffReports.jsx';

const API = import.meta.env.VITE_API_URL;

// ─── 🛡️ SECURE CUSTOMER LOGINS COMPONENT (NEW) ───
const CustomerLogins = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dobOption, setDobOption] = useState('none');

  const fetchCustomers = async () => {
    try {
      const token = sessionStorage.getItem('ownerToken');
      const res = await axios.get(`${API}/api/customer/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    if (!window.confirm(`Are you sure you want to change this customer's status to ${nextStatus}?`)) return;

    try {
      const token = sessionStorage.getItem('ownerToken');
      await axios.patch(`${API}/api/customer/${id}/status`, 
        { accountStatus: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = customers.filter(c => {
    const nameMatch = c.name?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = c.email?.toLowerCase().includes(search.toLowerCase());
    const phoneMatch = c.phone?.includes(search);
    const matchesSearch = nameMatch || emailMatch || phoneMatch;

    if (!matchesSearch) return false;
    if (statusFilter !== 'All' && c.accountStatus !== statusFilter) return false;

    if (dobOption === 'thisMonth') {
      if (!c.dob) return false;
      const dobMonth = new Date(c.dob).getMonth();
      const currentMonth = new Date().getMonth();
      return dobMonth === currentMonth;
    }
    
    if (dobOption === 'nextMonth') {
      if (!c.dob) return false;
      const dobMonth = new Date(c.dob).getMonth();
      const currentMonth = new Date().getMonth();
      const nextMonth = (currentMonth + 1) % 12;
      return dobMonth === nextMonth;
    }
    
    if (dobOption === 'today') {
      if (!c.dob) return false;
      const dobDate = new Date(c.dob);
      const today = new Date();
      return dobDate.getMonth() === today.getMonth() && dobDate.getDate() === today.getDate();
    }

    if (dobOption.startsWith('month_')) {
      if (!c.dob) return false;
      const targetMonth = parseInt(dobOption.split('_')[1], 10);
      const dobMonth = new Date(c.dob).getMonth();
      return dobMonth === targetMonth;
    }

    return true;
  });

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-[#D4AF37]"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-cinzel font-bold text-sm uppercase tracking-wide text-gray-800">Customer Accounts Grid</h3>
          <p className="text-xs text-gray-500 font-cormorant italic mt-0.5">Audit customer registration, status, and last active logins.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <input
              type="text"
              placeholder="Search Name, Email, Phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37] text-gray-900 placeholder-gray-400"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37] text-gray-900"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended Only</option>
          </select>
          <select
            value={dobOption}
            onChange={e => setDobOption(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37] text-gray-900"
          >
            <option value="none">DOB Filter</option>
            <option value="thisMonth">Birthdays This Month</option>
            <option value="nextMonth">Birthdays Next Month</option>
            <option value="today">Birthdays Today</option>
            <option value="month_0">January</option>
            <option value="month_1">February</option>
            <option value="month_2">March</option>
            <option value="month_3">April</option>
            <option value="month_4">May</option>
            <option value="month_5">June</option>
            <option value="month_6">July</option>
            <option value="month_7">August</option>
            <option value="month_8">September</option>
            <option value="month_9">October</option>
            <option value="month_10">November</option>
            <option value="month_11">December</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-700">
              <th className="p-4 pl-6 text-xs font-cinzel font-bold uppercase tracking-wider">Customer</th>
              <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider">Phone / Email</th>
              <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider">Date of Birth</th>
              <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider">Registered</th>
              <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider">Last Login</th>
              <th className="p-4 text-xs font-cinzel font-bold uppercase tracking-wider">Status</th>
              <th className="p-4 pr-6 text-xs font-cinzel font-bold uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="p-10 text-center font-cormorant italic text-lg text-gray-400">No customer login profiles recorded.</td></tr>
            ) : filtered.map(c => (
              <tr key={c._id} className="hover:bg-[#FFFCF5] transition-colors">
                <td className="p-4 pl-6">
                  <div className="font-bold text-gray-900 font-playfair">{c.name}</div>
                  <div className="text-[0.62rem] text-gray-400 tracking-wider font-mono">ID: {c._id}</div>
                </td>
                <td className="p-4 text-gray-700">
                  <div className="font-medium text-xs">{c.phone || 'N/A'}</div>
                  <div className="text-gray-500 font-cormorant text-base mt-0.5">{c.email}</div>
                </td>
                <td className="p-4 text-gray-600 font-cormorant text-lg">
                  {c.dob ? (
                    new Date(c.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  ) : (
                    <span className="italic text-gray-300">N/A</span>
                  )}
                </td>
                <td className="p-4 text-gray-600 font-cormorant text-lg">
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4 text-gray-600 font-cormorant text-lg">
                  {c.lastLoginDate ? (
                    new Date(c.lastLoginDate).toLocaleDateString('en-IN', { 
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })
                  ) : (
                    <span className="italic text-gray-300">Never active</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    c.accountStatus === 'Suspended'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {c.accountStatus || 'Active'}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <button
                    onClick={() => handleStatusChange(c._id, c.accountStatus || 'Active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-cinzel transition-all shadow-sm ${
                      c.accountStatus === 'Suspended'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {c.accountStatus === 'Suspended' ? 'Activate' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── 🛡️ SECURE OWNER PORTAL CONTAINER (NEW) ───
const OwnerPortal = () => {
  const [ownerTab, setOwnerTab] = useState('revenue');

  const tabs = [
    { id: 'revenue', label: 'Revenue Dashboard', icon: TrendingUp },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'reports', label: 'Performance Reports', icon: Award },
    { id: 'customers', label: 'Customer Logins', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      
      {/* Portal Tab Switchers */}
      <div className="flex bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex-wrap gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setOwnerTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wider transition-all ${
                ownerTab === tab.id
                  ? 'bg-[#111] text-amber-400 shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-transparent'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Unified Tab render */}
      <div className="bg-transparent rounded-xl">
        {ownerTab === 'revenue' && <Revenue />}
        {ownerTab === 'staff' && <ManageStaff />}
        {ownerTab === 'reports' && <StaffReports />}
        {ownerTab === 'customers' && <CustomerLogins />}
      </div>

    </div>
  );
};


const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [revenuePassword, setRevenuePassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!location.pathname.startsWith('/admin/owner')) {
      sessionStorage.removeItem('ownerToken');
      sessionStorage.removeItem('revenueToken');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('ownerToken');
    sessionStorage.removeItem('revenueToken');
    navigate('/admin-login');
  };

  // Restructured Menu items: Revenue & Staff removed, unified under secure "Owner" portal
  const navItems = [
    { name: 'Services', path: '/admin/services', icon: Scissors },
    { name: 'Bookings', path: '/admin/bookings', icon: Receipt },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Courses', path: '/admin/courses', icon: GraduationCap },
    { name: 'Stock', path: '/admin/stock', icon: Boxes },
    { name: 'Billing', path: '/admin/billing', icon: FileText },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Staff Work', path: '/admin/staff-work', icon: Briefcase },
    { name: 'Expense Tracker', path: '/admin/expenses', icon: Wallet },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Slot Management', path: '/admin/slots', icon: CalendarOff },
    { name: 'Owner Portal', path: '/admin/owner', icon: ShieldCheck }
  ];

  const handleNavClick = (e, item) => {
    if (item.name === 'Owner Portal') {
      const ownerToken = sessionStorage.getItem('ownerToken');
      if (!ownerToken) {
        e.preventDefault();
        setShowPasswordModal(true);
        setRevenuePassword('');
        setPasswordError('');
      }
    }
    setMobileMenuOpen(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!revenuePassword.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setIsVerifying(true);
    setPasswordError('');
    try {
      const res = await axios.post(`${API}/api/auth/verify-owner-password`, { password: revenuePassword });
      if (res.data.success) {
        sessionStorage.setItem('ownerToken', res.data.revenueToken);
        sessionStorage.setItem('revenueToken', res.data.revenueToken); // Backward compatibility
        setShowPasswordModal(false);
        navigate('/admin/owner');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAF8F5' }}>
      {/* Sidebar — Desktop */}
      <div className={`hidden md:flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} shrink-0`}
        style={{ background: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.06)', boxShadow: '2px 0 20px rgba(0,0,0,0.03)' }}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between px-5 py-5'} transition-all duration-300`}
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img src="/b2-admin-logo.svg" alt="B2" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.3))' }} />
              <div>
                <h1 className="text-sm font-bold tracking-wide uppercase font-cinzel" style={{ color: '#1a1a1a' }}>Admin Panel</h1>
                <p className="font-cormorant italic tracking-wide" style={{ color: '#000000', fontSize: '17px', fontWeight: 500, marginTop: '-2px' }}>B2 Bridal Studio</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="transition-colors p-1.5 rounded-lg hover:bg-gray-100"
            style={{ color: '#444' }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <Menu size={22} /> : <X size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className={`flex-1 py-4 space-y-0.5 ${isCollapsed ? 'px-2' : 'px-3'} overflow-y-auto overflow-x-hidden`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-gray-900 font-bold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                style={isActive ? { borderLeft: '3px solid #D4AF37' } : { borderLeft: '3px solid transparent' }}
                title={isCollapsed ? item.name : ''}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                {!isCollapsed && <span className="whitespace-nowrap font-cinzel text-xs font-semibold tracking-wide uppercase">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap font-cinzel text-xs font-semibold tracking-wide uppercase">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 flex items-center justify-between px-4 md:hidden"
          style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 8px rgba(0,0,0,0.03)' }}
        >
          <div className="flex items-center gap-2">
            <img src="/b2-admin-logo.png" alt="B2" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.3))' }} />
            <h1 className="text-sm font-bold tracking-wide uppercase font-cinzel" style={{ color: '#1a1a1a' }}>Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#444' }}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-600 hover:text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 z-50 shadow-xl border-b border-gray-100" style={{ background: '#FFFFFF' }}>
            <nav className="admin-nav-mobile-grid p-3 grid grid-cols-3 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${
                      isActive ? 'bg-amber-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-amber-600' : 'text-gray-500'} />
                    <span className="text-[0.6rem] font-cinzel font-bold tracking-wide uppercase">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col justify-between" style={{ background: '#FAF8F5' }}>
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    <LayoutDashboard size={28} style={{ color: '#D4AF37' }} />
                  </div>
                  <h2 className="font-cinzel text-xl font-bold tracking-wide uppercase text-gray-900 mb-2">Welcome to Admin Panel</h2>
                  <p className="font-cormorant italic text-gray-600 text-lg">Select an option from the sidebar to get started.</p>
                </div>
              } />
              <Route path="services" element={<ManageServices />} />
              <Route path="bookings" element={<ViewBookings />} />
              <Route path="payments" element={<PaymentVerification />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="courses" element={<ManageCourses />} />
              <Route path="stock" element={<ManageStock />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="staff-work" element={<StaffWork />} />
              <Route path="expenses" element={<ExpenseTracker />} />
              <Route path="billing" element={<Billing />} />
              <Route path="coupons" element={<ManageCoupons />} />
              <Route path="slots" element={<SlotManagement />} />
              <Route path="owner" element={<OwnerPortal />} />
            </Routes>
          </div>
          <footer className="mt-8 pt-4 text-center text-[0.65rem] border-t print:hidden" style={{ borderColor: 'rgba(0,0,0,0.05)', color: '#888' }}>
            Powered by{' '}
            <a href="https://cenexasystems.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: '#D4AF37' }}>
              Cenexa Systems
            </a>{' '}
            © 2026
          </footer>
        </main>
      </div>

      {/* Password Modal for Owner Authorization */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <Lock size={28} style={{ color: '#D4AF37' }} />
              </div>
            </div>

            <h2 className="text-2xl font-cinzel font-bold text-center text-gray-900 mb-2 tracking-wide">Owner Portal Access</h2>
            <p className="text-center text-gray-600 font-cormorant italic mb-8">Please enter the owner passcode to access secure resources.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={revenuePassword}
                    onChange={(e) => setRevenuePassword(e.target.value)}
                    placeholder="Enter owner password..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-amber-100 transition-all font-inter text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-2 font-inter flex items-center gap-1"><AlertCircle size={14} /> {passwordError}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 px-4 bg-transparent border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-cinzel text-sm tracking-wide uppercase font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-3 px-4 rounded-xl font-cinzel text-sm tracking-wide uppercase disabled:opacity-50 transition-all font-bold"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #C9A227)', color: '#fff', boxShadow: '0 4px 14px rgba(212,175,55,0.3)' }}
                >
                  {isVerifying ? 'Verifying...' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
