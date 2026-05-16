import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Scissors, Receipt, CreditCard, TrendingUp, FileText, Menu, X } from 'lucide-react';
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
    ];

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
            className="text-gray-400 hover:text-white transition-colors"
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
            className={`admin-logout-btn flex items-center gap-2 text-[#f8f8f8] hover:text-white transition-colors ${isCollapsed ? 'justify-center w-full px-0' : ''}`}
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
        <header className="h-14 flex items-center justify-between px-4 md:hidden" style={{ background: '#0a0a0a', borderBottom: '1px solid #222' }}>
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
    </div>
  );
};

export default AdminDashboard;
