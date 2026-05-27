import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Save, X, PlusCircle, Search, ChevronDown, ChevronUp, ChevronRight, Scissors } from 'lucide-react';
const API = import.meta.env.VITE_API_URL;

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({
    category: '',
    name: '',
    price: '',
    options: [],
    gstPercentage: ''
  });

  // Search & Grouping State
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [highlightedServiceId, setHighlightedServiceId] = useState(null);
  const scrollRef = useRef({});

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API}/api/services`);
      setServices(res.data);
    } catch (err) {
      setError('Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Cleanup empty options
    const payload = {
      ...currentService,
      options: currentService.options.filter(opt => opt.name && opt.price)
    };
    if (payload.options.length === 0) delete payload.options;

    // Calculate dynamic basePrice and finalPrice if GST percentage is entered
    const gstPercent = parseFloat(currentService.gstPercentage) || 0;
    payload.gstPercentage = gstPercent;

    if (gstPercent > 0) {
      if (payload.options && payload.options.length > 0) {
        payload.options = payload.options.map(opt => {
          const base = parseFloat(opt.price) || 0;
          const final = base + (base * gstPercent / 100);
          return {
            name: opt.name,
            price: final, // keep backward compatibility
            basePrice: base,
            finalPrice: final
          };
        });
        delete payload.price;
        delete payload.basePrice;
        delete payload.finalPrice;
      } else {
        const base = parseFloat(currentService.price) || 0;
        const final = base + (base * gstPercent / 100);
        payload.basePrice = base;
        payload.finalPrice = final;
        payload.price = final; // keep backward compatibility
      }
    } else {
      // Simplified no-GST flow
      if (payload.options && payload.options.length > 0) {
        payload.options = payload.options.map(opt => {
          const base = parseFloat(opt.price) || 0;
          return {
            name: opt.name,
            price: base,
            basePrice: base,
            finalPrice: base
          };
        });
        delete payload.price;
        delete payload.basePrice;
        delete payload.finalPrice;
      } else {
        const base = parseFloat(currentService.price) || 0;
        payload.basePrice = base;
        payload.finalPrice = base;
        payload.price = base;
      }
    }

    try {
      if (currentService._id) {
        await axios.put(`${API}/api/services/${currentService._id}`, payload, config);
      } else {
        await axios.post(`${API}/api/services`, payload, config);
      }
      setIsEditing(false);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  const addOptionField = () => {
    setCurrentService({
      ...currentService,
      options: [...currentService.options, { name: '', price: '' }]
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...currentService.options];
    newOptions[index][field] = value;
    setCurrentService({ ...currentService, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = currentService.options.filter((_, i) => i !== index);
    setCurrentService({ ...currentService, options: newOptions });
  };

  // Grouping Logic
  const groupServicesByCategory = (data) => {
    if (!Array.isArray(data)) return [];
    const grouped = {};
    data.forEach(service => {
      if (!service || !service.category) return;
      if (!grouped[service.category]) grouped[service.category] = [];
      grouped[service.category].push({
        ...service,
        options: service.options || []
      });
    });
    return Object.keys(grouped).map(category => ({
      category,
      services: grouped[category]
    }));
  };

  const groupedServices = groupServicesByCategory(services);
  const uniqueCategories = groupedServices.map(g => g.category);

  // Search Logic
  const filteredCategories = groupedServices.map(cat => {
    const matchedServices = cat.services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, services: matchedServices };
  }).filter(cat => cat.services.length > 0);

  // Auto-expand and scroll effect
  useEffect(() => {
    if (searchTerm) {
      const newExpanded = {};
      let firstMatchId = null;
      
      filteredCategories.forEach(cat => {
        if (cat.services.length > 0) {
          newExpanded[cat.category] = true;
          if (!firstMatchId) {
            firstMatchId = cat.services[0]._id;
          }
        }
      });
      setExpandedCategories(newExpanded);
      setHighlightedServiceId(firstMatchId);
      
      if (firstMatchId) {
        setTimeout(() => {
          if (scrollRef.current[firstMatchId]) {
            scrollRef.current[firstMatchId].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } else {
      setExpandedCategories({});
      setHighlightedServiceId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, services]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSidebarClick = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: true
    }));
    
    setTimeout(() => {
      const el = document.getElementById(`category-${category}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (loading) return (
    <div className="text-center py-20 flex justify-center bg-[#FDFDFD] min-h-screen">
      <div className="w-8 h-8 rounded-full animate-spin border-2 border-gray-200 border-t-[#FFD700]"></div>
    </div>
  );

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-cinzel uppercase tracking-wide text-gray-900 flex items-center gap-3">
          <Scissors size={24} className="text-[#D4AF37]" />
          Manage Services
        </h1>
        <p className="font-cormorant italic text-base text-gray-600 mt-1">Organize and update your premium offerings.</p>
      </div>

      {error && <div className="text-red-500 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-cormorant">{error}</div>}

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold font-cinzel tracking-wide text-gray-900 uppercase">
              {currentService._id ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-cinzel tracking-wide text-gray-700 uppercase mb-1.5 font-semibold">Category</label>
                <select
                  value={currentService.category}
                  onChange={e => setCurrentService({...currentService, category: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm text-gray-800 transition-colors"
                  required
                >
                  <option value="">Select Category</option>
                  {[...new Set(services.map(s => s.category))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="NEW" className="text-[#B8860B] font-bold">+ Add New Category</option>
                </select>

                {currentService.category === "NEW" && (
                  <input
                    type="text"
                    placeholder="Enter new category"
                    className="w-full mt-3 p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm text-gray-800 transition-colors"
                    onChange={e => setCurrentService({...currentService, category: e.target.value})}
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-wide text-gray-700 uppercase mb-1.5 font-semibold">Service Name</label>
                <input 
                  type="text" required 
                  value={currentService.name} 
                  onChange={e => setCurrentService({...currentService, name: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm text-gray-800 transition-colors"
                  placeholder="e.g. Premium Bridal Makeup"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-cinzel tracking-wide text-gray-700 uppercase mb-1.5 font-semibold">GST % (Optional)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={currentService.gstPercentage || ''} 
                  onChange={e => setCurrentService({...currentService, gstPercentage: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm text-gray-800 transition-colors"
                  placeholder="e.g. 18 (Leave empty or 0 if no GST)"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <h4 className="text-sm font-cinzel tracking-wide text-gray-900 uppercase font-bold">Pricing Options</h4>
                <span className="text-[0.65rem] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                  Base Price OR Sub-Options
                </span>
              </div>
              
              {currentService.options.length === 0 && (
                <div className="mb-6 max-w-sm">
                  <label className="block text-xs font-cinzel tracking-wide text-gray-700 uppercase mb-1.5 font-semibold">Base Price (₹)</label>
                  <input 
                    type="number" 
                    value={currentService.price || ''} 
                    onChange={e => setCurrentService({...currentService, price: e.target.value})}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 text-sm text-gray-800 transition-colors"
                    placeholder="e.g. 1500"
                  />
                </div>
              )}

              {currentService.options.length > 0 && (
                <div className="space-y-4 mb-6">
                  {currentService.options.map((opt, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex-1 w-full">
                        <input 
                          type="text" placeholder="Option Name (e.g. Honey, Fruit)" required
                          value={opt.name} onChange={e => updateOption(idx, 'name', e.target.value)}
                          className="w-full p-2 bg-transparent text-sm focus:outline-none border-b border-gray-200 focus:border-[#FFD700] text-gray-900 transition-colors"
                        />
                      </div>
                      <div className="w-full sm:w-40">
                        <input 
                          type="number" placeholder="Price (₹)" required
                          value={opt.price} onChange={e => updateOption(idx, 'price', e.target.value)}
                          className="w-full p-2 bg-transparent text-sm focus:outline-none border-b border-gray-200 focus:border-[#FFD700] text-gray-900 transition-colors font-medium"
                        />
                      </div>
                      <button type="button" onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500 transition-colors p-2 mt-2 sm:mt-0">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                type="button" 
                onClick={addOptionField}
                className="flex items-center gap-2 text-xs font-cinzel font-bold tracking-wide text-[#B8860B] hover:text-gray-900 uppercase transition-colors"
              >
                <PlusCircle size={16} /> Add Sub-Option
              </button>
            </div>



            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
              <button 
                type="button" onClick={() => setIsEditing(false)}
                className="px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-lg font-cinzel text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg bg-[#111] text-white"
              >
                <Save size={16} className="text-[#FFD700]" /> Save Service
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* TOP SECTION: ADD SERVICE & SEARCH */}
          <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-5 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h2 className="text-base font-cinzel font-bold tracking-wide uppercase text-gray-900 flex items-center gap-2">
                <Scissors className="text-[#FFD700]" size={20}/>
                Services Menu
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative w-full md:w-80 group">
                  <input 
                    type="text" 
                    placeholder="Search services by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all text-sm shadow-sm"
                  />
                  <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
                </div>
                
                <button 
                  onClick={() => {
                    setCurrentService({ category: '', name: '', price: '', options: [], gstPercentage: '' });
                    setIsEditing(true);
                  }}
                  className="whitespace-nowrap w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2 rounded-lg font-cinzel text-xs uppercase tracking-wide transition-all font-bold shadow-md hover:shadow-lg bg-[#111] text-white"
                >
                  <Plus size={16} className="text-[#FFD700]"/> Add Service
                </button>
              </div>
            </div>
          </div>

          {/* SPLIT LAYOUT: SIDEBAR & MAIN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR: CATEGORIES */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden sticky top-6 hidden lg:block">
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-cinzel font-bold text-gray-800 uppercase tracking-wide text-xs">Categories</h3>
                </div>
                <div className="flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
                  {uniqueCategories.map(cat => {
                    const count = services.filter(s => s.category === cat).length;
                    const isSelected = expandedCategories[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => handleSidebarClick(cat)}
                        className={`w-full text-left px-4 py-3 flex justify-between items-center transition-all duration-300 border-l-3 ${
                          isSelected
                            ? 'border-[#FFD700] bg-[#FFFAF0] text-gray-900 font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="font-cinzel uppercase tracking-wide text-xs font-bold flex items-center gap-2">
                          {cat}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#FFD700]/20 text-gray-800' : 'bg-gray-100 text-gray-400'}`}>
                            {count}
                          </span>
                          <ChevronRight size={16} className={isSelected ? 'text-[#FFD700]' : 'text-gray-300'} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Sidebar Fallback */}
              <div className="lg:hidden mb-6">
                <select 
                  onChange={(e) => handleSidebarClick(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-white font-cinzel font-bold uppercase tracking-wide text-xs text-gray-800"
                >
                  <option value="">Jump to Category...</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* RIGHT PANEL: SERVICES LIST */}
            <div className="lg:col-span-9 flex flex-col gap-4">
              {filteredCategories.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center shadow-sm">
                  <Scissors size={48} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="font-cinzel font-bold text-gray-600 uppercase tracking-wide text-sm">No Services Found</h4>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or add a new service.</p>
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <div key={cat.category} id={`category-${cat.category}`} className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-300 scroll-mt-24">
                    {/* Category Header (Minimal Accordion Toggle) */}
                    <button 
                      onClick={() => toggleCategory(cat.category)} 
                      className="w-full px-5 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors border-b border-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-cinzel font-bold tracking-wide text-gray-900 text-sm uppercase">
                          {cat.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                          {cat.services.length} {cat.services.length === 1 ? 'Service' : 'Services'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        {expandedCategories[cat.category] ? (
                          <ChevronUp size={20} className="text-[#B8860B]" />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </button>
                    
                    {/* Expandable Content (Services Rows) */}
                    {expandedCategories[cat.category] && (
                      <div className="bg-gray-50/50 p-4">
                        <div className="grid grid-cols-1 gap-4">
                          {cat.services.map(service => {
                            const isHighlighted = highlightedServiceId === service._id || (searchTerm && service.name.toLowerCase().includes(searchTerm.toLowerCase()));
                            
                            return (
                              <div 
                                key={service._id} 
                                ref={(el) => (scrollRef.current[service._id] = el)}
                                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-white transition-all duration-500 border ${
                                  isHighlighted 
                                    ? 'border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.15)] scale-[1.01]'
                                    : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                                }`}
                              >
                                <div className="flex-1 w-full mb-3 sm:mb-0">
                                  <h4 className="text-gray-900 font-semibold text-base mb-1">{service.name}</h4>
                                  
                                  {service.options && service.options.length > 0 ? (
                                    <div className="space-y-1">
                                      {service.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                          <span className="flex-1">{opt.name}</span> 
                                          <span className="font-semibold text-gray-900">₹{opt.price}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="font-semibold text-base text-gray-900">₹{service.price}</span>
                                  )}

                                </div>
                                
                                <div className="flex justify-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                                  <button 
                                    onClick={() => {
                                      const hasGst = service.gstPercentage > 0;
                                      const editableService = {
                                        ...service,
                                        price: hasGst && service.basePrice !== undefined ? service.basePrice : service.price,
                                        options: (service.options || []).map(opt => ({
                                          ...opt,
                                          price: hasGst && opt.basePrice !== undefined ? opt.basePrice : opt.price
                                        })),
                                        gstPercentage: service.gstPercentage || ''
                                      };
                                      setCurrentService(editableService);
                                      setIsEditing(true);
                                    }}
                                    className="p-2 rounded-md text-gray-400 hover:text-[#B8860B] hover:bg-yellow-50 transition-colors"
                                    title="Edit Service"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(service._id)}
                                    className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete Service"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageServices;
