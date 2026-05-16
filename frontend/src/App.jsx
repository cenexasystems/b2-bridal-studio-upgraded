import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFAB from './components/WhatsAppFAB';
import ScrollProgressBar from './components/ScrollProgressBar';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import Services from './pages/Services';
import Products from './pages/Products';
import Gallery from './pages/Gallery';
import Certificates from './pages/Certificates';
import About from './pages/About';
import Contact from './pages/Contact';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';

// Booking / Payment Pages
import Payment from './pages/Payment';
import ConfirmBooking from './pages/ConfirmBooking';
import Profile from './pages/Profile';
import BillView from './pages/BillView';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin / Owner Pages
import AdminLogin from './pages/AdminLogin';
import OwnerLogin from './pages/OwnerLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';

/* ─── Scroll-to-top on route change ─────────────────────── */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  return (
    <CartProvider>
      <LazyMotion features={domAnimation}>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen" style={{ background: '#000' }}>
            <Routes>

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
              <Route path="/courses/:category" element={<PublicLayout><Courses /></PublicLayout>} />
              <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
              <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
              <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
              <Route path="/certificates" element={<PublicLayout><Certificates /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              {/* Blog routes removed — content integrated into About page */}
              {/* <Route path="/blog" element={<PublicLayout><BlogList /></PublicLayout>} /> */}
              {/* <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} /> */}

              {/* BOOKING / PAYMENT ROUTES */}
              <Route path="/payment" element={<PublicLayout><Payment /></PublicLayout>} />
              <Route path="/confirm-booking" element={<PublicLayout><ConfirmBooking /></PublicLayout>} />
              <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
              <Route path="/bill/:id" element={<PublicLayout><BillView /></PublicLayout>} />

              {/* AUTH ROUTES */}
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

              {/* ADMIN ROUTES */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminDashboard />} />

              {/* OWNER ROUTES */}
              <Route path="/owner-login" element={<OwnerLogin />} />
              <Route path="/owner/*" element={<OwnerDashboard />} />

            </Routes>
          </div>

          {/* Global Cart Drawer */}
          <CartDrawer />
        </Router>
      </LazyMotion>
    </CartProvider>
  );
}

const PublicLayout = ({ children }) => (
  <>
    <ScrollProgressBar />
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
    <WhatsAppFAB />
  </>
);

export default App;