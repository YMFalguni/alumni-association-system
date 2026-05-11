import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, BarChart3, 
  LogOut, PlusCircle, Trash2, MapPin, Clock, Users2 
} from 'lucide-react';

function AdminEvents() {
    // 1. All States
    const [events, setEvents] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [formData, setFormData] = useState({
        eventName: "",
        eventDate: "",
        eventLocation: "",
        eventDescription: "",
        eventCapacity: 100
    });

    const navigate = useNavigate();
    const closeBtnRef = useRef(null); 

    // 2. Load Events from Backend
    const loadEvents = async () => {
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
            console.error('Error loading events:', error);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Save Event Function (The Fixed Logic)
    const saveEvent = async (e) => {
        e.preventDefault();
        setIsPublishing(true);
        
        try {
            const response = await fetch("http://localhost:5000/api/events/addevent", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    title: formData.eventName,
                    date: formData.eventDate,
                    location: formData.eventLocation,
                    description: formData.eventDescription,
                    capacity: formData.eventCapacity
                })
            });

            const json = await response.json();

            if (response.ok) {
                alert('Event Published Successfully!');
                setFormData({ eventName: "", eventDate: "", eventLocation: "", eventDescription: "", eventCapacity: 100 });
                
                if (closeBtnRef.current) {
                    closeBtnRef.current.click();
                }
                
                await loadEvents(); 
            } else {
                alert(json.error || 'Failed to save the event.');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Something went wrong. check weather the backend is running.');
        } finally {
            setIsPublishing(false);
        }
    };

    const deleteEvent = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/events/deleteevent/${id}`, {
                    method: 'DELETE',
                    headers: { 'auth-token': localStorage.getItem('token') }
                });
                if (response.ok) {
                    alert("Event deleted!");
                    loadEvents();
                }
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg text-white">A</div>
                        <span className="font-bold text-sm tracking-tight text-white">ADMIN <br/><small className="text-[10px] text-slate-400 uppercase">Panel Control</small></span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/adminDashboard" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/adminAlumni" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <Users size={18} /> <span className="text-sm">Manage Alumni</span>
                    </Link>
                    <Link to="/adminEvents" className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline">
                        <Calendar size={18} /> <span className="text-sm font-semibold">Manage Events</span>
                    </Link>
                    <Link to="/adminAnalytics" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <BarChart3 size={18} /> <span className="text-sm">Analytics</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all bg-transparent border-0 cursor-pointer text-left font-bold">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-0 text-left">Manage Events</h2>
                        <p className="text-xs text-slate-500 text-left">Organize and publish upcoming alumni activities</p>
                    </div>
                    <button 
                        className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg border-0 cursor-pointer" 
                        data-bs-toggle="modal" data-bs-target="#addEventModal"
                    >
                        <PlusCircle size={18} /> Create New Event
                    </button>
                </header>

                {/* EVENTS TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Event Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Capacity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {events.length > 0 ? events.map((event) => (
                                <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm text-slate-800">{event.title}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{event.location}</td>
                                    <td className="px-6 py-4 text-center text-xs font-bold text-blue-600 uppercase bg-blue-50/50 rounded-full">{event.capacity} Max</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => deleteEvent(event._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border-0 bg-transparent cursor-pointer">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">No events found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* MODAL */}
            <div className="modal fade" id="addEventModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-2xl rounded-[2rem] overflow-hidden">
                        <div className="bg-amber-600 p-6 text-white text-center relative">
                            <h4 className="fw-bold mb-0">Schedule New Event</h4>
                            {/* Hidden button used by Ref */}
                            <button type="button" ref={closeBtnRef} className="d-none" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-8">
                            <form onSubmit={saveEvent} className="space-y-4">
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" name="eventName" value={formData.eventName} onChange={onChange} placeholder="Event Name" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="datetime-local" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" name="eventDate" value={formData.eventDate} onChange={onChange} required />
                                    <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" name="eventCapacity" value={formData.eventCapacity} onChange={onChange} placeholder="Capacity" required />
                                </div>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" name="eventLocation" value={formData.eventLocation} onChange={onChange} placeholder="Location" required />
                                <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" name="eventDescription" value={formData.eventDescription} onChange={onChange} rows="3" placeholder="Description" required></textarea>
                                
                                <div className="flex gap-3 pt-4">
                                    <button type="button" className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold border-0 cursor-pointer" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" disabled={isPublishing} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold border-0 cursor-pointer shadow-lg disabled:opacity-50">
                                        {isPublishing ? "Publishing..." : "Publish Event"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminEvents;