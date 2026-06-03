import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Calendar, Clock, Check, Trash2, ChevronDown, ChevronUp, MapPin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HOUR_SLOTS = [
  { label: '10 AM', value: '10' },
  { label: '11 AM', value: '11' },
  { label: '12 PM', value: '12' },
  { label: '1 PM',  value: '13' },
  { label: '2 PM',  value: '14' },
  { label: '3 PM',  value: '15' },
  { label: '4 PM',  value: '16' },
  { label: '5 PM',  value: '17' },
  { label: '6 PM',  value: '18' },
  { label: '7 PM',  value: '19' },
];
const API = import.meta.env.VITE_API_URL;
const groupServicesByCategory = (data) => {
  if (!Array.isArray(data)) return []; // safety

  const grouped = {};

  data.forEach(service => {
    if (!service || !service.category) return; // safety

    if (!grouped[service.category]) {
      grouped[service.category] = [];
    }

    grouped[service.category].push({
      ...service,
      options: service.options || [] // ensure always array
    });
  });

  return Object.keys(grouped).map(category => ({
    category,
    services: grouped[category]
  }));
};

const SERVICE_CATEGORIES = [
  {
    category: 'Threading',
    services: [
      { _id: 't1', name: 'Eye Brows', price: 50 },
      { _id: 't2', name: 'Fore Head', price: 40 },
      { _id: 't3', name: 'Chin & Neck', price: 40 },
      { _id: 't4', name: 'Upper Lip', price: 40 },
      { _id: 't5', name: 'Side Locks', price: 100 },
      { _id: 't6', name: 'Full Face', price: 250 },
    ]
  },
  {
    category: 'Skin Brightening Mask',
    services: [
      { _id: 'm1', name: 'Vitamin C Peel-Off Mask', price: 850 },
      { _id: 'm2', name: 'Glass Skin Mask', price: 750 },
      { _id: 'm3', name: 'Pack Mask', price: 650 },
    ]
  },
  {
    category: 'Detan',
    services: [
      { 
        _id: 'd_face', name: 'Detan - Face', 
        options: [ { _id: 'd1', name: 'Raga', price: 700 }, { _id: 'd2', name: 'Fruit', price: 600 } ]
      },
      { 
        _id: 'd_neck', name: 'Detan - Neck Front & Back', 
        options: [ { _id: 'd3', name: 'Raga', price: 500 }, { _id: 'd4', name: 'Fruit', price: 400 } ]
      },
      { 
        _id: 'd_arms', name: 'Detan - Under Arms', 
        options: [ { _id: 'd5', name: 'Raga', price: 400 }, { _id: 'd6', name: 'Fruit', price: 600 } ]
      },
      { 
        _id: 'd_feet', name: 'Detan - Feet', 
        options: [ { _id: 'd7', name: 'Raga', price: 700 }, { _id: 'd8', name: 'Fruit', price: 600 } ]
      },
    ]
  },
  {
    category: 'Bleach',
    services: [
      { _id: 'b_face', name: 'Bleach - Face', options: [ { _id: 'b1', name: 'Oxy', price: 800 }, { _id: 'b2', name: 'Fruit', price: 600 } ] },
      { _id: 'b_neck', name: 'Bleach - Neck Front & Back', options: [ { _id: 'b3', name: 'Oxy', price: 500 }, { _id: 'b4', name: 'Fruit', price: 400 } ] },
      { _id: 'b_arms', name: 'Bleach - Under Arms', options: [ { _id: 'b5', name: 'Oxy', price: 400 }, { _id: 'b6', name: 'Fruit', price: 300 } ] },
      { _id: 'b_hands', name: 'Bleach - Full Hands', options: [ { _id: 'b7', name: 'Oxy', price: 1000 }, { _id: 'b8', name: 'Fruit', price: 800 } ] },
      { _id: 'b_feet', name: 'Bleach - Feet', options: [ { _id: 'b9', name: 'Oxy', price: 600 }, { _id: 'b10', name: 'Fruit', price: 400 } ] },
      { _id: 'b_leg', name: 'Bleach - Full Leg', options: [ { _id: 'b11', name: 'Oxy', price: 1500 }, { _id: 'b12', name: 'Fruit', price: 1200 } ] },
      { _id: 'b_body', name: 'Bleach - Full Body', options: [ { _id: 'b13', name: 'Oxy', price: 3000 }, { _id: 'b14', name: 'Fruit', price: 2000 } ] },
    ]
  },
  {
    category: 'Pedicure & Manicure',
    services: [
      { _id: 'p_nail', name: 'Nail Cut & File / Polish', options: [ { _id: 'p1', name: 'Feet', price: 150 }, { _id: 'p2', name: 'Hands', price: 150 } ] },
      { _id: 'p_express', name: 'Express', options: [ { _id: 'p3', name: 'Feet', price: 750 }, { _id: 'p4', name: 'Hands', price: 650 } ] },
      { _id: 'p_refresh', name: 'Refresh', options: [ { _id: 'p5', name: 'Feet', price: 950 }, { _id: 'p6', name: 'Hands', price: 850 } ] },
      { _id: 'p_aroma', name: 'Aroma', options: [ { _id: 'p7', name: 'Feet', price: 1200 }, { _id: 'p8', name: 'Hands', price: 900 } ] },
      { _id: 'p_avl', name: 'AVL Express', options: [ { _id: 'p9', name: 'Feet', price: 1300 }, { _id: 'p10', name: 'Hands', price: 1000 } ] },
      { _id: 'p_sika', name: 'Sika Signature', options: [ { _id: 'p11', name: 'Feet', price: 1500 }, { _id: 'p12', name: 'Hands', price: 1200 } ] },
    ]
  },
  {
    category: 'Bridal Services',
    services: [
      { _id: 'br1', name: 'Normal Makeup', price: 10000 },
      { _id: 'br2', name: 'Waterproof / Sweatproof Makeup', price: 15000 },
      { _id: 'br3', name: 'HD Makeup', price: 20000 },
      { _id: 'br4', name: 'Air Brush Makeup', price: 25000 },
      { _id: 'br_saree', name: 'Only Saree Drape', options: [ { _id: 'br5', name: 'Simple', price: 700 }, { _id: 'br6', name: 'Simple Iron & Drape', price: 1000 }, { _id: 'br7', name: 'Ironing & Drape', price: 2000 } ] },
      { _id: 'br_hair', name: 'Hair Do', options: [ { _id: 'br8', name: 'Simple', price: 700 }, { _id: 'br9', name: 'Simple Iron & Drape', price: 1500 }, { _id: 'br10', name: 'Ironing & Drape', price: 2500 } ] },
      { _id: 'br11', name: 'Makeup', price: 1500 },
      { _id: 'br12', name: 'Party Makeup', price: 3000 },
      { _id: 'br13', name: 'Brides Maid Makeup', price: 5000 },
      { _id: 'br14', name: 'Saree Box Folding', price: 700 },
      { _id: 'br15', name: 'Fluffy Pleats', price: 1400 },
    ]
  },
  {
    category: 'Hair Filter (Nashi Argan)',
    services: [
      { _id: 'hf1', name: 'Express Filler Therapy', price: 1500 },
      { _id: 'hf2', name: 'Filler Therapy', price: 2500 },
      { _id: 'hf3', name: 'Dandruff Treatment', price: 1800 },
    ]
  },
  {
    category: 'Hair Spa (Loreal)',
    services: [
      { _id: 'hs1', name: 'Classic Spa', price: 1400 },
      { _id: 'hs2', name: 'Advanced Smoothing Spa', price: 2500 },
      { _id: 'hs3', name: 'Texture Spa', price: 1800 },
    ]
  },
  {
    category: 'Hair Colouring',
    services: [
      { _id: 'hc1', name: 'Global Color Basic Shade', price: 1500 },
      { _id: 'hc2', name: 'Grey Hair Coverage (Ammonia Free)', price: 3500 },
      { _id: 'hc3', name: 'Grey Hair Coverage', price: 2500 },
      { _id: 'hc4', name: 'Fashion Highlights (Starting)', price: 3500 },
    ]
  },
  {
    category: 'Cosmetic Enhancement',
    services: [
      { _id: 'ce1', name: 'Nose Piercing', price: 350 },
      { _id: 'ce2', name: 'Ear Piercing', price: 550 },
      { _id: 'ce3', name: 'Warts Removal (per wart)', price: 250 },
    ]
  },
  {
    category: 'Treatment',
    services: [
      { _id: 'tr1', name: 'Hairfall Treatment', price: 1500 },
      { _id: 'tr2', name: 'Dandruff Treatment', price: 1500 },
      { _id: 'tr3', name: 'Hair Smoothening', price: 4000 },
      { _id: 'tr4', name: 'Anti-Frizz Treatment', price: 5000 },
      { _id: 'tr_botox', name: 'Botox', options: [ { _id: 'tr5a', name: 'Starting', price: 6500 }, { _id: 'tr5b', name: 'Advanced', price: 8500 } ] },
      { _id: 'tr_straight', name: 'Hair Straightening', options: [ { _id: 'tr6a', name: 'Starting', price: 1000 }, { _id: 'tr6b', name: 'Advanced', price: 3000 } ] },
      { _id: 'tr7', name: 'Under Eye Treatment', price: 1000 },
    ]
  },
  {
    category: 'Waxing',
    services: [
      { _id: 'w_lip', name: 'Upper Lip', options: [ { _id: 'w1', name: 'Honey', price: 100 }, { _id: 'w2', name: 'Flavour', price: 200 }, { _id: 'w3', name: 'Stripless', price: 250 } ] },
      { _id: 'w_chin', name: 'Chin & Neck', options: [ { _id: 'w4', name: 'Honey', price: 110 }, { _id: 'w5', name: 'Flavour', price: 210 }, { _id: 'w6', name: 'Stripless', price: 350 } ] },
      { _id: 'w_side', name: 'Side', options: [ { _id: 'w7', name: 'Honey', price: 200 }, { _id: 'w8', name: 'Flavour', price: 350 }, { _id: 'w9', name: 'Stripless', price: 400 } ] },
      { _id: 'w_arm', name: 'Under Arm', options: [ { _id: 'w10', name: 'Honey', price: 200 }, { _id: 'w11', name: 'Flavour', price: 300 }, { _id: 'w12', name: 'Stripless', price: 500 } ] },
      { _id: 'w_tummy', name: 'Tummy', options: [ { _id: 'w13', name: 'Honey', price: 350 }, { _id: 'w14', name: 'Flavour', price: 450 }, { _id: 'w15', name: 'Stripless', price: 600 } ] },
      { _id: 'w_hand', name: 'Full Hand', options: [ { _id: 'w16', name: 'Honey', price: 800 }, { _id: 'w17', name: 'Flavour', price: 1000 }, { _id: 'w18', name: 'Rollon', price: 1200 } ] },
      { _id: 'w_legs', name: 'Full Legs', options: [ { _id: 'w19', name: 'Honey', price: 1000 }, { _id: 'w20', name: 'Flavour', price: 1400 }, { _id: 'w21', name: 'Rollon', price: 1600 } ] },
      { _id: 'w_body', name: 'Full Body', options: [ { _id: 'w22', name: 'Honey', price: 2000 }, { _id: 'w23', name: 'Flavour', price: 4000 } ] },
    ]
  },
  {
    category: 'Facial',
    services: [
      { _id: 'f1', name: 'Clean Up / Mini Facial', price: 750 },
      { _id: 'f2', name: 'Aroma Facial', price: 950 },
      { _id: 'f3', name: 'Vitamin C Papaya', price: 2500 },
      { _id: 'f4', name: 'Wine Facial', price: 2000 },
      { _id: 'f5', name: 'Diamond', price: 1900 },
      { _id: 'f6', name: 'Gold Glow', price: 2000 },
      { _id: 'f7', name: 'Charcoal', price: 2500 },
      { _id: 'f8', name: 'Anti Ageing', price: 1400 },
      { _id: 'f9', name: 'Bridal Glow', price: 3000 },
      { _id: 'f10', name: 'Hydra Facial', price: 3500 },
    ]
  },
  {
    category: 'Hair Cut',
    services: [
      { _id: 'hc_1', name: 'Straight Cut', price: 300 },
      { _id: 'hc_2', name: 'Baby Hair Cut', price: 300 },
      { _id: 'hc_3', name: 'Front Fringe Cut', price: 400 },
      { _id: 'hc_4', name: 'U Cut', price: 350 },
      { _id: 'hc_5', name: 'V Cut', price: 350 },
      { _id: 'hc_6', name: 'Advance Cuts', price: 800 },
      { _id: 'hc_7', name: 'Hair Wash', price: 350 },
      { _id: 'hc_8', name: 'Hair Setting', price: 600 },
      { _id: 'hc_9', name: 'Hair Wash with Conditioner (Loreal)', price: 400 },
      { _id: 'hc_10', name: 'Hair Service', price: 1500 },
    ]
  },
  {
    category: 'Massage',
    services: [
      { _id: 'ms1', name: 'Face Massage (15 mins)', price: 500 },
      { _id: 'ms2', name: 'Neck, Arms & Back Massage (15 mins)', price: 600 },
      { _id: 'ms3', name: 'Legs Massage', price: 700 },
      { _id: 'ms4', name: 'Full Body Moisturising (30 mins)', price: 3500 },
      { _id: 'ms5', name: 'Full Body with Oil (30 mins)', price: 2500 },
    ]
  }
];

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('services_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [bookingDate, setBookingDate] = useState(() => {
    return localStorage.getItem('services_bookingDate') || '';
  });
  const [bookingTime, setBookingTime] = useState(() => {
    return localStorage.getItem('services_bookingTime') || '';
  });
  const [bookingBranch, setBookingBranch] = useState(() => {
    return localStorage.getItem('services_bookingBranch') || '';
  });
  const [bookingErrors, setBookingErrors] = useState({});
  const [slotChecking, setSlotChecking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullSlots, setFullSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [isDayBlocked, setIsDayBlocked] = useState(false);

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', serviceName: '' });
  const [pendingCounts, setPendingCounts] = useState({});

  const triggerAuthToast = (message) => {
    setToast({ show: true, message, serviceName: '', isWarning: true });
    setTimeout(() => {
      navigate('/auth');
    }, 2500);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('services_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('services_bookingDate', bookingDate);
  }, [bookingDate]);

  useEffect(() => {
    localStorage.setItem('services_bookingTime', bookingTime);
  }, [bookingTime]);

  useEffect(() => {
    localStorage.setItem('services_bookingBranch', bookingBranch);
  }, [bookingBranch]);

  useEffect(() => {
    const fetchServices = async () => {
  try {
    const res = await axios.get(`${API}/api/services`);
    setServices(groupServicesByCategory(res.data));
  } catch (err) {
    console.error('Failed to fetch services', err);
  } finally {
    setLoading(false); // ✅ THIS FIXES LOADING ISSUE
  }
};
    fetchServices();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchFullSlots = async () => {
      if (!bookingBranch || !bookingDate) {
        setFullSlots([]);
        setBlockedSlots([]);
        setIsDayBlocked(false);
        return;
      }
      try {
        const res = await fetch(`${API}/api/bookings/full-slots?branch=${encodeURIComponent(bookingBranch)}&date=${encodeURIComponent(bookingDate)}`);
        const data = await res.json();
        setFullSlots(data.fullSlots || []);
        setBlockedSlots(data.blockedSlots || []);
        setIsDayBlocked(!!data.isDayBlocked);
      } catch (err) {
        console.error("Failed to fetch full slots:", err);
        setFullSlots([]);
        setBlockedSlots([]);
        setIsDayBlocked(false);
      }
    };
    fetchFullSlots();
  }, [bookingBranch, bookingDate]);

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleOptionChange = (serviceId, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [serviceId]: optionId
    }));
  };

  const isBridalCategory = (name) => name.toLowerCase().includes('bridal');
  const isHairExtensionCategory = (name) => name.toLowerCase() === 'hair extension';

  const filteredCategories = services.map(cat => {
    const matchedServices = cat.services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, services: matchedServices };
  }).filter(cat => cat.services.length > 0)
    .sort((a, b) => {
      const aB = isBridalCategory(a.category);
      const bB = isBridalCategory(b.category);
      const aH = isHairExtensionCategory(a.category);
      const bH = isHairExtensionCategory(b.category);
      // Bridal first, then Hair Extension, then everything else
      const aPriority = aB ? 0 : aH ? 1 : 2;
      const bPriority = bB ? 0 : bH ? 1 : 2;
      return aPriority - bPriority;
    });


  const addToCart = (serviceItem, initialCount = 1) => {
    if (cart.find(item => item._id === serviceItem._id)) return;

    // Hair Extension services are inquiry-only — never add to cart
    if (isHairExtensionCategory(serviceItem.category || '')) return;

    const isAddingBridal = isBridalCategory(serviceItem.category || '');
    const cartHasBridal = cart.some(item => isBridalCategory(item.category || ''));
    const cartHasRegular = cart.some(item => !isBridalCategory(item.category || ''));

    if (isAddingBridal && cartHasRegular) {
      setToast({ show: true, message: 'Bridal Services are handled separately via WhatsApp inquiry and cannot be combined with regular service bookings.', serviceName: '', isWarning: true });
      return;
    }
    if (!isAddingBridal && cartHasBridal) {
      setToast({ show: true, message: 'Bridal Services require separate WhatsApp consultation bookings and cannot be combined with regular services.', serviceName: '', isWarning: true });
      return;
    }

    setCart([...cart, { ...serviceItem, peopleCount: initialCount }]);
    setToast({ show: true, message: `"${serviceItem.name}" added successfully. Scroll down to view your cart.`, serviceName: serviceItem.name });
  };

  const handleHairExtensionWhatsAppInquiry = (service) => {
    const stored = localStorage.getItem('user');
    let user = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && (parsed.email || parsed.phone)) {
          user = parsed;
        }
      } catch (e) {}
    }

    if (!user) {
      triggerAuthToast('Please login with your account details to book or enquire.');
      return;
    }

    const message = `Hello B2 Bridal Studio! I would like to inquire about the Hair Extension service "${service.name}". Prefilled Customer Info: Name: ${user.name}, Phone: ${user.phone || 'N/A'}, Email: ${user.email || 'N/A'}. Please let me know the pricing and availability. Thank you!`;
    const whatsappUrl = `https://wa.me/919361527951?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const removeFromCart = (serviceId) => {
    setCart(cart.filter(item => item._id !== serviceId));
  };

  const updatePeopleCount = (serviceId, count) => {
    if (count < 1) {
      removeFromCart(serviceId);
      return;
    }
    if (count > 10) {
      setToast({ show: true, message: 'Maximum booking limit is 10 people per service.', serviceName: '', isWarning: true });
      return;
    }
    setCart(prev => prev.map(item => item._id === serviceId ? { ...item, peopleCount: count } : item));
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * (curr.peopleCount || 1), 0);
  const gstTotal = 0;
  const total = subtotal;
  const hasBridalService = cart.some(item => item.category === 'Bridal Services');

  const handleSingleServiceWhatsAppInquiry = (service, activeOption, categoryName) => {
    const stored = localStorage.getItem('user');
    let user = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && (parsed.email || parsed.phone)) {
          user = parsed;
        }
      } catch (e) {}
    }

    if (!user) {
      triggerAuthToast('Please login with your account details to book or enquire.');
      return;
    }

    const serviceName = activeOption 
      ? `${service.name} - ${activeOption.name}` 
      : service.name;
    const price = activeOption ? activeOption.price : service.price;

    let dateTimeInfo = '';
    if (bookingBranch || bookingDate || bookingTime) {
      const parts = [];
      if (bookingDate) {
        try {
          const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          parts.push(`on ${formattedDate}`);
        } catch (e) {
          // ignore
        }
      }
      if (bookingTime) {
        const timeLabel = HOUR_SLOTS.find(slot => slot.value === bookingTime)?.label || bookingTime;
        parts.push(`at ${timeLabel}`);
      }
      if (bookingBranch) {
        parts.push(`for the ${bookingBranch} branch`);
      }
      if (parts.length > 0) {
        dateTimeInfo = ` ${parts.join(' ')}`;
      }
    }

    const message = `Hello B2 Bridal Studio! I would like to inquire about booking the service "${serviceName}" (Price: ₹${price})${dateTimeInfo}. Prefilled Customer Info: Name: ${user.name}, Phone: ${user.phone || 'N/A'}, Email: ${user.email || 'N/A'}.`;
    const whatsappUrl = `https://wa.me/919361527951?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppInquiry = () => {
    const stored = localStorage.getItem('user');
    let user = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && (parsed.email || parsed.phone)) {
          user = parsed;
        }
      } catch (e) {}
    }

    if (!user) {
      triggerAuthToast('Please login to book or enquire.');
      return;
    }

    if (cart.length === 0) return;

    // Validation
    const errs = {};
    if (!bookingBranch) errs.branch = 'Please select a branch';
    if (!bookingDate)   errs.date   = 'Please select a booking date';
    if (!bookingTime)   errs.time   = 'Please select a booking time';
    if (Object.keys(errs).length > 0) {
      setBookingErrors(errs);
      return;
    }
    setBookingErrors({});

    // Filter bridal services in the cart
    const bridalItems = cart.filter(item => item.category === 'Bridal Services');
    const bridalNames = bridalItems.map(item => `${item.name} (Service For: ${item.peopleCount || 1} ${item.peopleCount === 1 ? 'Person' : 'People'})`).join(', ');

    // Prefilled message formatting
    const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const timeLabel = HOUR_SLOTS.find(slot => slot.value === bookingTime)?.label || bookingTime;

    const message = `Hello B2 Bridal Studio! I would like to inquire about Bridal Services (${bridalNames}) for ${formattedDate} at the ${bookingBranch} branch around ${timeLabel}. Prefilled Customer Info: Name: ${user.name}, Phone: ${user.phone || 'N/A'}, Email: ${user.email || 'N/A'}.`;
    
    const whatsappUrl = `https://wa.me/919361527951?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleProceedToPayment = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;

    // Inline validation — no alert()
    const errs = {};
    if (!bookingBranch) errs.branch = 'Please select a branch';
    if (!bookingDate)   errs.date   = 'Please select a booking date';
    if (!bookingTime)   errs.time   = 'Please select a booking time';
    if (Object.keys(errs).length > 0) {
      setBookingErrors(errs);
      return;
    }
    if (isDayBlocked) {
      setBookingErrors({ date: 'This date is unavailable for booking.' });
      return;
    }
    if (blockedSlots.includes(bookingTime)) {
      setBookingErrors({ slot: 'This time slot is blocked. Please choose another slot.' });
      return;
    }
    setBookingErrors({});

    // Slot availability check
    setSlotChecking(true);
    try {
      const res = await fetch(
        `${API}/api/bookings/slot-check?branch=${encodeURIComponent(bookingBranch)}&date=${encodeURIComponent(bookingDate)}&hour=${encodeURIComponent(bookingTime)}`
      );
      const data = await res.json();
      if (!data.available) {
        setBookingErrors({ slot: 'This slot is already booked. Please choose another time slot.' });
        setSlotChecking(false);
        return;
      }
    } catch (_) {
      // If slot-check fails (network), allow through — backend is source of truth
    }
    setSlotChecking(false);

     const serviceData = {
      items: cart.map(item => ({ 
        ...item, 
        quantity: item.peopleCount || 1,
        peopleCount: item.peopleCount || 1
      })),
      subtotal,
      gstTotal,
      total,
      branch: bookingBranch,
      date: bookingDate,
      hour: bookingTime,
    };
    navigate('/payment', { state: { serviceData } });
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Banner */}
      <div className="page-hero">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Treatments</span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </div>
          <h1 className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>Premium Services</h1>
          <p className="font-cormorant italic mt-4" style={{ fontSize: '1.2rem', color: 'rgba(248,245,240,0.92)' }}>Explore our luxury treatments and book your appointment today.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services List */}
        <div className="lg:col-span-2">
          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Search services..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-luxury rounded-sm" 
              style={{ paddingLeft: '3rem' }}
            />
            <Search className="absolute left-4 top-4" size={18} style={{ color: 'rgba(255,195,0,0.4)' }} />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(255,195,0,0.2)', borderTopColor: '#FFD700' }} /></div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredCategories.map((category) => (
                <div key={category.category} className="card-luxury rounded-sm overflow-hidden">
                  <button onClick={() => toggleCategory(category.category)} className="w-full px-6 py-4 flex justify-between items-center transition-colors" style={{ background: 'rgba(255,195,0,0.03)' }}>
                    <span className="font-cinzel text-sm tracking-[0.2em] uppercase font-semibold" style={{ color: '#F8F5F0' }}>
                      {isBridalCategory(category.category) || isHairExtensionCategory(category.category)
                        ? `${category.category} (WhatsApp Inquiry Only)`
                        : category.category}
                    </span>
                    {expandedCategory === category.category
                      ? <ChevronUp size={16} style={{ color: '#FFD700' }} />
                      : <ChevronDown size={16} style={{ color: 'rgba(248,245,240,0.3)' }} />}
                  </button>
                  {expandedCategory === category.category && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ borderTop: '1px solid rgba(255,195,0,0.08)' }}>
                      {category.services.map(service => {
                        const isDropdown = Array.isArray(service.options) && service.options.length > 0;
                        const activeOptionId = isDropdown ? (selectedOptions[service._id] || service.options?.[0]?._id) : null;
                        const activeOption = isDropdown ? service.options?.find(opt => opt._id === activeOptionId) : null;
                        const priceToDisplay = isDropdown && activeOption ? activeOption.price : service.price;
                        const serviceGst = service.gstPercentage || 0;
                        const cartItem = isDropdown
                          ? { _id: activeOption._id, name: `${service.name} - ${activeOption.name}`, price: activeOption.price, category: category.category, gstPercentage: serviceGst }
                          : { _id: service._id, name: service.name, price: service.price, category: category.category, gstPercentage: serviceGst };
                        const isAdded = cart.find(item => item._id === cartItem._id);
                        const serviceCount = isAdded ? (isAdded.peopleCount || 1) : (pendingCounts[cartItem._id] || 1);

                        const handleDecrement = () => {
                          if (isAdded) {
                            updatePeopleCount(cartItem._id, serviceCount - 1);
                          } else {
                            const current = pendingCounts[cartItem._id] || 1;
                            if (current > 1) {
                              setPendingCounts(prev => ({ ...prev, [cartItem._id]: current - 1 }));
                            }
                          }
                        };

                        const handleIncrement = () => {
                          if (isAdded) {
                            updatePeopleCount(cartItem._id, serviceCount + 1);
                          } else {
                            const current = pendingCounts[cartItem._id] || 1;
                            if (current < 10) {
                              setPendingCounts(prev => ({ ...prev, [cartItem._id]: current + 1 }));
                            } else {
                              setToast({ show: true, message: 'Maximum booking limit is 10 people per service.', serviceName: '', isWarning: true });
                            }
                          }
                        };
                        return (
                          <div key={service._id} className="glass-dark p-5 rounded-sm flex flex-col justify-between">
                            <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 sm:gap-3 mb-3">
                                 <div className="min-w-0">
                                  <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase block mb-1 font-bold" style={{ color: '#FFD700' }}>{category.category}</span>
                                  <h3 className="font-playfair text-base font-semibold" style={{ color: '#F8F5F0' }}>{service.name}</h3>
                                  {(category.category === 'Bridal Services' || isHairExtensionCategory(category.category)) && (
                                    <span className="inline-block whitespace-nowrap text-[0.55rem] font-cinzel tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-sm mt-1.5" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                                      WhatsApp Inquiry Only
                                    </span>
                                  )}
                                </div>
                                <span className="font-cinzel text-sm font-bold text-left sm:text-right sm:ml-3" style={{ color: '#FFD700' }}>
                                  {isHairExtensionCategory(category.category) ? `Starting From ₹${priceToDisplay}` : `₹${priceToDisplay}`}
                                  {serviceGst > 0 && (
                                    <span className="text-[0.65rem] text-left sm:text-right block font-normal normal-case mt-0.5" style={{ color: 'rgba(248,245,240,0.5)' }}>
                                      (incl. GST)
                                    </span>
                                  )}
                                </span>
                              </div>
                              {isDropdown && (
                                <select value={activeOptionId} onChange={(e) => handleOptionChange(service._id, e.target.value)} className="w-full px-3 py-2 rounded-sm text-sm font-cormorant outline-none mb-3" style={{ background: 'rgba(255,195,0,0.06)', border: '1px solid rgba(255,195,0,0.15)', color: '#F8F5F0' }}>
                                  {service.options.map(opt => (<option key={opt._id} value={opt._id} style={{ background: '#111' }}>{opt.name} — ₹{opt.price}</option>))}
                                </select>
                              )}
                            </div>
                            {isHairExtensionCategory(category.category) ? (
                              <button
                                onClick={() => handleSingleServiceWhatsAppInquiry(service, activeOption, category.category)}
                                className="w-full py-2.5 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2 mt-2 transition-all rounded-sm"
                                style={{
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                  color: '#FFF',
                                  fontWeight: 700,
                                  boxShadow: '0 2px 10px rgba(37,211,102,0.25)'
                                }}
                              >
                                <MessageCircle size={14} /> Book via WhatsApp
                              </button>
                            ) : isBridalCategory(category.category) ? (
                              <button
                                onClick={() => handleSingleServiceWhatsAppInquiry(service, activeOption, category.category)}
                                className="w-full py-2.5 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2 mt-2 transition-all rounded-sm"
                                style={{
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                  color: '#FFF',
                                  fontWeight: 700,
                                  boxShadow: '0 2px 10px rgba(37,211,102,0.25)'
                                }}
                              >
                                <MessageCircle size={14} /> Book via WhatsApp
                              </button>
                            ) : (
                              <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center justify-between px-3 py-2 rounded-sm" style={{ background: 'rgba(255,195,0,0.05)', border: '1px solid rgba(255,195,0,0.15)' }}>
                                  <span className="font-cinzel text-[0.65rem] tracking-[0.1em] uppercase font-bold" style={{ color: '#FFD700' }}>Service For:</span>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={handleDecrement}
                                      className="w-6 h-6 flex items-center justify-center text-sm font-bold transition-all rounded-sm cursor-pointer hover:bg-yellow-500/20"
                                      style={{ border: '1px solid rgba(255,195,0,0.3)', color: '#FFD700', background: 'transparent' }}
                                    >
                                      -
                                    </button>
                                    <span className="font-cinzel text-xs font-bold w-6 text-center" style={{ color: '#F8F5F0' }}>
                                      {serviceCount}
                                    </span>
                                    <button 
                                      onClick={handleIncrement}
                                      className="w-6 h-6 flex items-center justify-center text-sm font-bold transition-all rounded-sm cursor-pointer hover:bg-yellow-500/20"
                                      style={{ border: '1px solid rgba(255,195,0,0.3)', color: '#FFD700', background: 'transparent' }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {isAdded ? (
                                  <div className="flex gap-2 w-full">
                                    <span className="flex-grow py-2 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase flex items-center justify-center gap-1.5 rounded-sm" style={{ background: 'rgba(255,195,0,0.12)', color: '#FFD700', fontWeight: 700, border: '1px solid rgba(255,195,0,0.25)' }}>
                                      <Check size={13} /> Added
                                    </span>
                                    <button onClick={() => removeFromCart(cartItem._id)} className="px-3 py-2 font-cinzel text-[0.6rem] tracking-[0.1em] uppercase flex items-center justify-center gap-1.5 rounded-sm transition-all" style={{ background: 'transparent', color: '#f87171', fontWeight: 700, border: '1px solid rgba(248,113,113,0.3)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}>
                                      <Trash2 size={13} /> Remove
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => addToCart(cartItem, serviceCount)} className="w-full py-2.5 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all rounded-sm" style={{ border: 'none', background: 'linear-gradient(135deg, #FFED8A, #FFD700, #FFCA28, #E5A100)', color: '#000', fontWeight: 700, boxShadow: '0 2px 10px rgba(255,195,0,0.25)' }}>
                                    <ShoppingCart size={14} /> Add
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-dark rounded-sm p-6 sticky top-24" style={{ border: '1px solid rgba(255,195,0,0.15)' }}>
            <h2 className="font-cinzel text-sm tracking-[0.2em] uppercase mb-6 pb-4" style={{ color: '#F8F5F0', borderBottom: '1px solid rgba(255,195,0,0.1)' }}>Your Booking</h2>
            <div className="flex flex-col gap-4 mb-8">

              {/* Branch */}
              <div>
                <label className="block font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>Branch *</label>
                <div className="flex gap-2">
                  {['Chennai', 'Madurai'].map(branch => (
                    <button
                      key={branch}
                      type="button"
                      onClick={() => { setBookingBranch(branch); setBookingErrors(prev => ({ ...prev, branch: '' })); }}
                      className="flex-1 py-2.5 font-cinzel text-[0.7rem] tracking-[0.15em] uppercase rounded-sm transition-all cursor-pointer"
                      style={{
                        border: '2px solid #FFD700',
                        background: bookingBranch === branch ? 'linear-gradient(135deg, #FFD700, #FFE566)' : 'transparent',
                        color: bookingBranch === branch ? '#000' : '#FFD700',
                        fontWeight: 'bold',
                        boxShadow: bookingBranch === branch ? '0 2px 8px rgba(255,215,0,0.2)' : 'none',
                      }}
                    >
                      {branch}
                    </button>
                  ))}
                </div>
                {bookingErrors.branch && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{bookingErrors.branch}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>    Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => { setBookingDate(e.target.value); setBookingErrors(prev => ({ ...prev, date: '', slot: '' })); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-luxury rounded-sm text-sm"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Calendar className="absolute left-3 top-3.5" size={16} style={{ color: '#FFD700' }} />
                </div>
                {bookingErrors.date && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{bookingErrors.date}</p>}
              </div>

              {/* Time — hourly slots only */}
              <div>
                <label className="block font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>    Time Slot *</label>
                {isDayBlocked && (
                  <div className="p-3 text-xs rounded-sm mb-3 text-center" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    This date is unavailable for booking.
                  </div>
                )}
                <div className="relative">
                  <select
                    value={bookingTime}
                    onChange={(e) => { setBookingTime(e.target.value); setBookingErrors(prev => ({ ...prev, time: '', slot: '' })); }}
                    disabled={isDayBlocked}
                    className="input-luxury rounded-sm text-sm"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)',
                      opacity: isDayBlocked ? 0.5 : 1,
                      cursor: isDayBlocked ? 'not-allowed' : 'default',
                      paddingLeft: '2.5rem'
                    }}
                  >
                    <option value="" style={{ background: '#111' }}>Select a time slot</option>
                    {HOUR_SLOTS.map(slot => {
                      const isFull = fullSlots.includes(slot.value);
                      const isBlocked = blockedSlots.includes(slot.value);
                      const isDisabled = isFull || isBlocked;
                      return (
                        <option
                          key={slot.value}
                          value={slot.value}
                          disabled={isDisabled}
                          style={{
                            background: '#111',
                            color: isDisabled ? 'rgba(248,245,240,0.2)' : '#F8F5F0',
                            textDecoration: isDisabled ? 'line-through' : 'none'
                          }}
                        >
                          {slot.label} {isBlocked ? '(Blocked)' : isFull ? '(Unavailable/Full)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <Clock className="absolute left-3 top-3.5" size={16} style={{ color: '#FFD700' }} />
                </div>
                {bookingErrors.time && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{bookingErrors.time}</p>}
              </div>

              {/* Slot full error */}
              {bookingErrors.slot && (
                <p className="text-xs px-3 py-2 rounded-sm" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {bookingErrors.slot}
                </p>
              )}

            </div>
            <h3 className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-3 font-bold" style={{ color: '#FFD700' }}>Selected Services</h3>
            {cart.length === 0 ? (
              <p className="font-cormorant italic text-sm text-center py-4" style={{ color: 'rgba(248,245,240,0.68)' }}>No services selected.</p>
            ) : (
              <ul className="flex flex-col gap-3 mb-4">{cart.map(item => (
                <li key={item._id} className="flex flex-col gap-2 pb-3" style={{ borderBottom: '1px solid rgba(255,195,0,0.08)' }}>
                  <div className="flex justify-between items-start text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="block font-cormorant mb-1 truncate text-white" style={{ fontSize: '1.125rem', fontWeight: 500, letterSpacing: '0.01em' }}>
                        {item.name}
                      </span>
                      <span className="font-cinzel text-xs font-bold" style={{ color: '#FFD700' }}>₹{item.price} each</span>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="p-1.5 rounded-sm transition-all cursor-pointer" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'; }}><Trash2 size={14} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-[0.65rem] tracking-[0.1em] uppercase font-bold" style={{ color: 'rgba(248,245,240,0.6)' }}>Service For:</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updatePeopleCount(item._id, (item.peopleCount || 1) - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs transition-all rounded-sm cursor-pointer hover:bg-yellow-500/20"
                        style={{ border: '1px solid rgba(255,195,0,0.2)', color: 'rgba(248,245,240,0.6)', background: 'transparent' }}
                      >
                        −
                      </button>
                      <span className="font-cinzel text-xs w-6 text-center text-white">
                        {item.peopleCount || 1}
                      </span>
                      <button 
                        onClick={() => updatePeopleCount(item._id, (item.peopleCount || 1) + 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs transition-all rounded-sm cursor-pointer hover:bg-yellow-500/20"
                        style={{ border: '1px solid rgba(255,195,0,0.2)', color: 'rgba(248,245,240,0.6)', background: 'transparent' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}</ul>
            )}
            {cart.length > 0 && (
              <div className="pt-4 mb-4 flex flex-col gap-2 text-sm" style={{ borderTop: '1px solid rgba(255,195,0,0.1)' }}>
                <div className="flex justify-between font-cinzel text-base pt-2 font-bold" style={{ color: '#FFD700' }}><span>Total</span><span style={{ color: '#FFD700' }}>₹{total.toFixed(2)}</span></div>
              </div>
            )}
            {hasBridalService ? (
              <button
                onClick={handleWhatsAppInquiry}
                disabled={cart.length === 0}
                className="w-full py-3 font-cinzel text-[0.65rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all rounded-sm"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#FFF',
                  cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  boxShadow: cart.length > 0 ? '0 2px 10px rgba(37,211,102,0.25)' : 'none',
                  opacity: cart.length > 0 ? 1 : 0.4,
                  border: 'none',
                }}
              >
                <MessageCircle size={14} /> Inquire via WhatsApp
              </button>
            ) : (
              <button
                onClick={handleProceedToPayment}
                disabled={cart.length === 0 || slotChecking}
                className="w-full py-3 font-cinzel text-[0.65rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all rounded-sm"
                style={{
                  background: cart.length > 0 ? 'linear-gradient(135deg, #FFD700, #FFE566)' : 'rgba(255,255,255,0.03)',
                  color: cart.length > 0 ? '#000' : 'rgba(248,245,240,0.5)',
                  cursor: cart.length > 0 && !slotChecking ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  opacity: slotChecking ? 0.7 : 1,
                }}
              >
                {slotChecking ? 'Checking availability...' : 'Proceed to Payment'}
              </button>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {toast.show && (
          <>
            {/* Mobile Toast */}
            <motion.div
              key="mobile-toast"
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed bottom-6 left-1/2 z-[9999] lg:hidden w-[90%] max-w-md animate-glow-pulse"
            >
              <div className="glass-dark border-gold-glow px-4 py-3 rounded-md flex items-center justify-between shadow-2xl relative overflow-hidden" style={{ background: 'rgba(10, 10, 10, 0.95)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: toast.isWarning ? 'rgba(248,113,113,0.1)' : 'rgba(255, 215, 0, 0.1)', border: toast.isWarning ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(255, 215, 0, 0.3)' }}>
                    {toast.isWarning ? <span style={{ color: '#f87171', fontSize: '16px' }}>⚠</span> : <Check size={16} style={{ color: '#FFD700' }} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-playfair text-[0.85rem] font-semibold leading-snug" style={{ color: '#F8F5F0' }}>
                      {toast.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  className="ml-3 transition-colors text-xs font-sans px-2 py-1 rounded"
                  style={{ color: 'rgba(248, 245, 240, 0.5)' }}
                >
                  ✕
                </button>
              </div>
            </motion.div>

            {/* Desktop Toast */}
            <motion.div
              key="desktop-toast"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-24 right-6 z-[9999] hidden lg:block w-full max-w-sm animate-glow-pulse"
            >
              <div className="glass-dark border-gold-glow px-4 py-3 rounded-md flex items-center justify-between shadow-2xl relative overflow-hidden" style={{ background: 'rgba(10, 10, 10, 0.95)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: toast.isWarning ? 'rgba(248,113,113,0.1)' : 'rgba(255, 215, 0, 0.1)', border: toast.isWarning ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(255, 215, 0, 0.3)' }}>
                    {toast.isWarning ? <span style={{ color: '#f87171', fontSize: '16px' }}>⚠</span> : <Check size={16} style={{ color: '#FFD700' }} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-playfair text-[0.85rem] font-semibold leading-snug" style={{ color: '#F8F5F0' }}>
                      {toast.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  className="ml-3 transition-colors text-xs font-sans px-2 py-1 rounded"
                  style={{ color: 'rgba(248, 245, 240, 0.5)' }}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
