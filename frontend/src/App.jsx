import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
// Contact page removed — navbar scrolls to homepage #contact section
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';

// Booking / Payment Pages
import Payment from './pages/Payment';
import ConfirmBooking from './pages/ConfirmBooking';
import Profile from './pages/Profile';
import BillView from './pages/BillView';

// Auth Pages
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Admin / Owner Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

/* ─── Scroll-to-top on route change ─────────────────────── */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Skip scroll-to-top if there's a hash (e.g. /#contact)
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

/* Redirect /contact → home page #contact with smooth scroll */
const ContactRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', { replace: true });
    setTimeout(() => {
      const el = document.getElementById('contact');
      if (el) {
        const offset = 80; // navbar height
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 400);
  }, [navigate]);
  return null;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
              <Route path="/contact" element={<PublicLayout><ContactRedirect /></PublicLayout>} />
              {/* Blog routes */}
              <Route path="/blog" element={<PublicLayout><BlogList /></PublicLayout>} />
              <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
              <Route path="/blogs" element={<PublicLayout><BlogList /></PublicLayout>} />
              <Route path="/blogs/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />

              {/* BOOKING / PAYMENT ROUTES */}
              <Route path="/payment" element={<PublicLayout><Payment /></PublicLayout>} />
              <Route path="/confirm-booking" element={<PublicLayout><ConfirmBooking /></PublicLayout>} />
              <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
              <Route path="/bill/:id" element={<PublicLayout><BillView /></PublicLayout>} />

              {/* AUTH ROUTES */}
              <Route path="/auth" element={<PublicLayout><Auth /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Auth /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Auth /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
              <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

              {/* ADMIN ROUTES */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminDashboard />} />

            </Routes>
          </div>

          {/* Global Cart Drawer */}
          <CartDrawer />
        </Router>
      </LazyMotion>
    </CartProvider>
    </GoogleOAuthProvider>
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