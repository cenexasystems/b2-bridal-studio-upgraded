import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Scissors, Receipt, CreditCard, TrendingUp, FileText, Menu, X, Lock, Eye, EyeOff, Package, GraduationCap, Boxes, Users, CalendarCheck, Tag, CalendarOff, Briefcase, Wallet } from 'lucide-react';
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


const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [revenuePassword, setRevenuePassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  const navItems = [
    { name: 'Services', path: '/admin/services', icon: Scissors },
    { name: 'Bookings', path: '/admin/bookings', icon: Receipt },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Courses', path: '/admin/courses', icon: GraduationCap },
    { name: 'Stock', path: '/admin/stock', icon: Boxes },
    { name: 'Billing', path: '/admin/billing', icon: FileText },
    { name: 'Staff', path: '/admin/staff', icon: Users },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Staff Work', path: '/admin/staff-work', icon: Briefcase },
    { name: 'Expense Tracker', path: '/admin/expenses', icon: Wallet },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Slot Management', path: '/admin/slots', icon: CalendarOff },
    { name: 'Revenue', path: '/admin/revenue', icon: TrendingUp },
  ];

  const handleNavClick = (e, item) => {
    if (item.name === 'Revenue' && user?.role !== 'owner') {
      e.preventDefault();
      setShowPasswordModal(true);
      setRevenuePassword('');
      setPasswordError('');
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
        sessionStorage.setItem('revenueToken', res.data.revenueToken);
        setShowPasswordModal(false);
        navigate('/admin/revenue');
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
              <img src="/b2-admin-logo.png" alt="B2" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.3))' }} />
              <div>
                <h1 className="text-sm font-bold tracking-wide uppercase font-cinzel" style={{ color: '#1a1a1a' }}>Admin Panel</h1>
                <p className="text-[0.6rem] font-cormorant italic" style={{ color: '#777' }}>B2 Bridal Studio</p>
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
          <div className="md:hidden absolute top-14 left-0 right-0 z-50 shadow-xl" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
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
              <Route path="staff" element={<ManageStaff />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="staff-work" element={<StaffWork />} />
              <Route path="expenses" element={<ExpenseTracker />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="billing" element={<Billing />} />
              <Route path="coupons" element={<ManageCoupons />} />
              <Route path="slots" element={<SlotManagement />} />
            </Routes>
          </div>
          <footer className="mt-8 pt-4 text-center text-[0.65rem] border-t" style={{ borderColor: 'rgba(0,0,0,0.05)', color: '#888' }}>
            Powered by{' '}
            <a href="https://cenexasystems.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: '#D4AF37' }}>
              Cenexa Systems
            </a>{' '}
            © 2026
          </footer>
        </main>
      </div>

      {/* Password Modal for Revenue */}
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <Lock size={28} style={{ color: '#D4AF37' }} />
              </div>
            </div>

            <h2 className="text-2xl font-cinzel font-bold text-center text-gray-900 mb-2 tracking-wide">Owner Access</h2>
            <p className="text-center text-gray-600 font-cormorant italic mb-8">Please enter the owner password to access Revenue.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={revenuePassword}
                    onChange={(e) => setRevenuePassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-inter"
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
                  <p className="text-red-500 text-sm mt-2 font-inter">{passwordError}</p>
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
                  {isVerifying ? 'Verifying...' : 'Access'}
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
