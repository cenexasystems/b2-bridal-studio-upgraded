import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Scissors, Receipt, CreditCard, TrendingUp, FileText, Menu, X, Lock, Eye, EyeOff } from 'lucide-react';
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


const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const navItems = user?.role === "owner"
    ? [
      { name: 'Revenue', path: '/admin/revenue', icon: TrendingUp },
    ]
    : [
      { name: 'Services', path: '/admin/services', icon: Scissors },
      { name: 'Bookings', path: '/admin/bookings', icon: Receipt },
      { name: 'Payments', path: '/admin/payments', icon: CreditCard },
      { name: 'Products', path: '/admin/products', icon: LayoutDashboard },
      { name: 'Courses', path: '/admin/courses', icon: LayoutDashboard },
      { name: 'Stock', path: '/admin/stock', icon: LayoutDashboard },
      { name: 'Billing', path: '/admin/billing', icon: FileText },
      { name: 'Staff', path: '/admin/staff', icon: LayoutDashboard },
      { name: 'Attendance', path: '/admin/attendance', icon: LayoutDashboard },
      { name: 'Coupons', path: '/admin/coupons', icon: Receipt },
      { name: 'Revenue', path: '/admin/revenue', icon: TrendingUp },
    ];

  const handleNavClick = (e, item) => {
    if (item.name === 'Revenue' && user?.role !== 'owner') {
      e.preventDefault();
      setShowPasswordModal(true);
      setRevenuePassword('');
      setPasswordError('');
    }
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
    <div className="admin-root flex h-screen overflow-hidden" style={{ background: '#f4f4f4' }}>
      {/* Sidebar */}
      <div className={`flex flex-col hidden md:flex admin-sidebar transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64 shrink-0'}`}>
        <div className={`admin-sidebar-header flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between'} transition-all duration-300`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <img src="/b2-logo.png" alt="B2" style={{ width: 36, height: 36, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <h1 className="text-base font-bold tracking-widest uppercase text-white whitespace-nowrap" style={{ letterSpacing: '0.18em' }}>Admin Panel</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:text-white transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <Menu size={24} /> : <X size={20} />}
          </button>
        </div>

        <nav className={`flex-1 py-5 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'} overflow-x-hidden`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`admin-nav-item${isActive ? ' active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.name : ''}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className={`admin-logout-btn flex items-center gap-2 text-white hover:text-white transition-colors ${isCollapsed ? 'justify-center w-full px-0' : ''}`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 flex items-center justify-between px-4 md:hidden" style={{ background: '#0a0a0aff', borderBottom: '1px solid #222' }}>
          <div className="flex items-center gap-2">
            <img src="/b2-logo.png" alt="B2" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <h1 className="text-sm font-bold tracking-widest uppercase text-white">Admin Panel</h1>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
            <LogOut size={22} />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8" style={{ background: '#f4f4f4' }}>
          <Routes>
            <Route path="/" element={<div className="p-8 text-center" style={{ color: '#666' }}>Select an option from the menu.</div>} />
            <Route path="services" element={<ManageServices />} />
            <Route path="bookings" element={<ViewBookings />} />
            <Route path="payments" element={<PaymentVerification />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="stock" element={<ManageStock />} />
            <Route path="staff" element={<ManageStaff />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="billing" element={<Billing />} />
            <Route path="coupons" element={<ManageCoupons />} />
          </Routes>
        </main>
      </div>

      {/* Password Modal for Revenue */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-dark border border-yellow-500/20 rounded-lg p-8 w-full max-w-md shadow-2xl relative animate-fade-up">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20">
                <Lock size={32} className="text-yellow-500" />
              </div>
            </div>

            <h2 className="text-2xl font-cinzel font-bold text-center text-white mb-2 tracking-wider">Owner Access</h2>
            <p className="text-center text-gray-400 font-cormorant italic mb-8">Please enter the owner password to access Revenue.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={revenuePassword}
                    onChange={(e) => setRevenuePassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-black/50 border border-yellow-500/20 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors font-inter"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
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
                  className="flex-1 py-3 px-4 bg-transparent border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors font-cinzel text-sm tracking-wider uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-md hover:from-yellow-500 hover:to-yellow-400 transition-colors font-cinzel text-sm tracking-wider uppercase disabled:opacity-50"
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
