import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, UserCircle, Calendar, MessageSquare, 
  LogOut, Search, MapPin, CalendarDays, Info, X
} from 'lucide-react';

function AlumniEvent() {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/events/fetchall", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            navigate("/");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
            <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg">S</div>
                        <span className="font-bold text-sm tracking-tight">SSBT Alumni <br/><small className="text-[10px] text-slate-400">Portal</small></span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/alumniDashboard" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/alumniProfile" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <UserCircle size={18} /> <span className="text-sm">My Profile</span>
                    </Link>
                    <Link to="/alumniEvent" className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline">
                        <Calendar size={18} /> <span className="text-sm font-semibold">Events</span>
                    </Link>
                    <Link to="#" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <MessageSquare size={18} /> <span className="text-sm">Contact Us</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all bg-transparent border-0 cursor-pointer text-left">
                        <LogOut size={18} /> <span className="text-sm font-bold">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-0">Upcoming Events</h2>
                        <p className="text-xs text-slate-500">Connect and engage with the alumni network</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">A</div>
                </header>

                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-8 flex items-center gap-3 px-4">
                    <Search size={20} className="text-slate-400" />
                    <input 
                        type="text" 
                        className="w-full bg-transparent border-0 focus:ring-0 text-sm text-slate-700 outline-none"
                        placeholder="Search events by title or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white h-64 rounded-3xl animate-pulse border border-slate-100"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                            <div key={event._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-amber-200 transition-all group">
                                <div className="bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider w-fit px-3 py-1 rounded-full mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    Event
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">{event.title}</h3>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                                        <CalendarDays size={16} className="text-amber-500" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                                        <MapPin size={16} className="text-amber-500" />
                                        <span className="line-clamp-1">{event.location}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedEvent(event)}
                                    className="w-full py-3 bg-slate-50 hover:bg-amber-600 hover:text-white text-slate-600 font-bold rounded-xl transition-all border-0 cursor-pointer text-sm flex items-center justify-center gap-2"
                                >
                                    <Info size={16} /> View Details
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                                <p className="text-slate-400">No events found matching your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-900 mb-0">Event Information</h3>
                            <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-transparent border-0 cursor-pointer">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-amber-600 mb-4">{selectedEvent.title}</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Date</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Capacity</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedEvent.capacity} Seats</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Location</p>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <MapPin size={16} className="text-amber-600" />
                                    <span className="text-sm font-semibold">{selectedEvent.location}</span>
                                </div>
                            </div>

                            <div className="mb-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">About Event</p>
                                <div className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-100 italic">
                                    "{selectedEvent.description}"
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AlumniEvent;