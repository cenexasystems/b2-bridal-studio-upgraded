import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Save, X, Search, ChevronRight, PlusCircle, BookOpen, Clock } from 'lucide-react';
const API = import.meta.env.VITE_API_URL;

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    category: '',
    title: '',
    duration: '',
    learnings: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // UI State
  const [selectedCategory, setSelectedCategory] = useState('beautician');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedCourseId, setHighlightedCourseId] = useState(null);
  const scrollRef = useRef({});

  // 🔥 FETCH COURSES
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/api/courses`);
      setCourses(res.data);
      // Auto-select category if none matches or array is fetched
      if (res.data.length > 0 && !selectedCategory) {
        setSelectedCategory(res.data[0].category || 'beautician');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search Logic (Auto-select category and scroll)
  useEffect(() => {
    if (searchTerm) {
      const matchedCourse = courses.find(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchedCourse) {
        setSelectedCategory(matchedCourse.category);
        setHighlightedCourseId(matchedCourse._id);
        
        setTimeout(() => {
          if (scrollRef.current[matchedCourse._id]) {
            scrollRef.current[matchedCourse._id].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        setHighlightedCourseId(null);
      }
    } else {
      setHighlightedCourseId(null);
    }
  }, [searchTerm, courses]);

  // Derived Categories
  const ALL_CATEGORIES = ['beautician', 'fashion', 'embroidery', 'jewellery', 'bags', 'kids', 'special'];
  const activeCategoriesFromData = courses.map(c => c.category).filter(Boolean);
  const uniqueCategories = Array.from(new Set([...ALL_CATEGORIES, ...activeCategoriesFromData]));

  // Filtered Courses for selected category
  const displayCourses = courses.filter(c => c.category === selectedCategory);

  // 🔥 ADD COURSE
  const handleAdd = async () => {
    if (!newCourse.title || !newCourse.category) {
      alert("Please fill required fields (Category and Title)");
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");

      await axios.post(
        `${API}/api/courses`,
        {
          ...newCourse,
          learnings: newCourse.learnings ? newCourse.learnings.split(',') : []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNewCourse({ category: '', title: '', duration: '', learnings: '' });
      fetchCourses();
      // Auto-switch to the category where the new course was added
      setSelectedCategory(newCourse.category);

    } catch (err) {
      console.error(err);
      alert("Failed to add course.");
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(`${API}/api/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchCourses();

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // 🔥 EDIT START
  const handleEdit = (course) => {
    setEditingId(course._id);
    setEditData({
      ...course,
      learnings: Array.isArray(course.learnings) ? course.learnings.join(', ') : ''
    });
  };

  // 🔥 SAVE EDIT
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      await axios.put(
        `${API}/api/courses/${editingId}`,
        {
          ...editData,
          learnings: editData.learnings ? editData.learnings.split(',').map(s => s.trim()) : []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setEditingId(null);
      fetchCourses();

    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen p-4 md:p-8 font-sans text-gray-900">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-cinzel uppercase tracking-[0.1em] text-gray-900">Course Management</h1>
        <p className="font-cormorant italic text-lg text-gray-500 mt-1">Organize and manage your academy's curriculum.</p>
      </div>

      {/* TOP SECTION: ADD COURSE & SEARCH */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-cinzel font-bold tracking-widest uppercase text-gray-900 flex items-center gap-2">
            <PlusCircle className="text-[#FFD700]" size={20}/>
            Add New Course
          </h2>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/30 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all font-cormorant text-lg shadow-sm"
            />
            <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-[#FFD700] transition-colors" size={18} />
          </div>
        </div>

        {/* Add Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={newCourse.category}
            onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
          >
            <option value="">Select Category</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>

          <input
            placeholder="Course Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
          />

          <input
            placeholder="Duration (e.g., 3 Months)"
            value={newCourse.duration}
            onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
          />

          <input
            placeholder="Learnings (comma separated)"
            value={newCourse.learnings}
            onChange={(e) => setNewCourse({ ...newCourse, learnings: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg text-gray-800 transition-colors"
          />
        </div>
        
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-cinzel text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg"
            style={{ background: '#111', color: '#FFF' }}
          >
            <Plus size={16} className="text-[#FFD700]" /> Add Course
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT: SIDEBAR & MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR: CATEGORIES */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden sticky top-6">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="font-cinzel font-bold text-gray-800 uppercase tracking-widest text-sm">Categories</h3>
            </div>
            <div className="flex flex-col">
              {uniqueCategories.map(cat => {
                const count = courses.filter(c => c.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-5 py-4 flex justify-between items-center transition-all duration-300 border-l-4 ${
                      isSelected
                        ? 'border-[#FFD700] bg-[#FFFAF0] text-gray-900 font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="font-cinzel uppercase tracking-[0.1em] text-sm flex items-center gap-2">
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
        </div>

        {/* RIGHT PANEL: COURSE LIST */}
        <div className="lg:col-span-9">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-cinzel font-bold text-gray-900 uppercase tracking-widest">
                {selectedCategory} Courses
              </h3>
              <p className="text-gray-500 font-cormorant text-lg italic mt-1">
                Showing {displayCourses.length} {displayCourses.length === 1 ? 'course' : 'courses'}
              </p>
            </div>
          </div>

          {displayCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center shadow-sm">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h4 className="font-cinzel font-bold text-gray-500 uppercase tracking-widest">No Courses Found</h4>
              <p className="font-cormorant text-gray-400 text-lg mt-2">Add a new course in this category to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {displayCourses.map(course => {
                const isHighlighted = highlightedCourseId === course._id;
                const isEditing = editingId === course._id;
                
                return (
                  <div 
                    key={course._id}
                    ref={(el) => scrollRef.current[course._id] = el}
                    className={`bg-white rounded-xl p-6 transition-all duration-500 border ${
                      isHighlighted 
                        ? 'border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)] scale-[1.01]'
                        : 'border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {isEditing ? (
                      // EDIT MODE
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                          <span className="font-cinzel font-bold text-sm text-gray-400 uppercase tracking-widest">Edit Course</span>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                            <X size={20} />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-cinzel text-gray-500 uppercase tracking-widest mb-1">Title</label>
                          <input
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-cinzel text-gray-500 uppercase tracking-widest mb-1">Duration</label>
                          <input
                            value={editData.duration}
                            onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                            className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-cinzel text-gray-500 uppercase tracking-widest mb-1">Learnings (Comma separated)</label>
                          <textarea
                            value={editData.learnings}
                            onChange={(e) => setEditData({ ...editData, learnings: e.target.value })}
                            className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#FFD700] bg-gray-50 font-cormorant text-lg min-h-[80px]"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-cinzel font-bold tracking-widest text-gray-500 hover:text-gray-800 uppercase transition-colors">
                            Cancel
                          </button>
                          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-cinzel text-xs font-bold tracking-widest uppercase transition-colors">
                            <Save size={16} className="text-[#FFD700]" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      // VIEW MODE
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-playfair font-bold text-xl text-gray-900 leading-tight mb-2">{course.title}</h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-cormorant bg-gray-50 px-3 py-1 rounded-full w-max border border-gray-100">
                              <Clock size={14} className="text-[#FFD700]" />
                              <span>{course.duration || 'Duration not specified'}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <button onClick={() => handleEdit(course)} className="text-gray-400 hover:text-[#FFD700] transition-colors p-1" title="Edit Course">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(course._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete Course">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50">
                          <h4 className="font-cinzel text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-3">Key Learnings</h4>
                          {course.learnings && course.learnings.length > 0 ? (
                            <ul className="space-y-2">
                              {course.learnings.map((l, i) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700 font-cormorant text-lg leading-snug">
                                  <span className="text-[#FFD700] mt-1">•</span>
                                  <span>{l.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 font-cormorant italic text-lg">No learnings listed.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageCourses;