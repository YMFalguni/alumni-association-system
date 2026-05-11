import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  LayoutDashboard, Users, Calendar, BarChart3, 
  LogOut, Briefcase, Trophy, RefreshCw 
} from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  
  // 1. State for dynamic stats from backend
  const [stats, setStats] = useState({
    totalAlumni: 0,
    employedCount: 0,
    activeEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [lastUpdated, setLastUpdated] = useState(null);
  // 2. Fetch Logic (Keeping your logic intact)
  const fetchDashboardStats = async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      setIsRefreshing(true);
      
      const token = localStorage.getItem("token");
      const response = await axios.get('http://localhost:5000/api/auth/adminstats', {
        headers: { 'auth-token': token }
      });

      setStats({
        totalAlumni: response.data.totalAlumni || 0,
        employedCount: response.data.employedCount || 0,
        activeEvents: response.data.activeEvents || 0
      });
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      if (showLoadingState) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    intervalRef.current = setInterval(() => fetchDashboardStats(false), 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/");
      window.location.reload();
    }
  };

  const handleManualRefresh = () => fetchDashboardStats(false); 
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
      {/* SIDEBAR - Theme matched with AlumniDashboard */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg text-white">A</div>
             <span className="font-bold text-sm tracking-tight text-white">ADMIN <br/><small className="text-[10px] text-slate-400 uppercase">Panel Control</small></span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link to="/adminDashboard" className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline">
            <LayoutDashboard size={18} /> <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link to="/adminAlumni" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
            <Users size={18} /> <span className="text-sm">Manage Alumni</span>
          </Link>
          <Link to="/adminEvents" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
            <Calendar size={18} /> <span className="text-sm">Manage Events</span>
          </Link>
          <Link to="/adminAnalytics" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
            <BarChart3 size={18} /> <span className="text-sm">Analytics</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all bg-transparent border-0 cursor-pointer text-left">
            <LogOut size={18} /> <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-0">System Intelligence</h2>
            <p className="text-xs text-slate-500">Live tracking & Admin Control</p>
          </div>
          <div className="flex items-center gap-3">
            
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">AD</div>
          </div>
        </header>

        {/* --- STAT CARDS (Theme Matched) --- */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl"><Users size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0">Total Alumni</p>
              <h4 className="text-2xl font-bold text-slate-800 mb-0">{loading ? '...' : stats.totalAlumni}</h4>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-green-50 text-green-600 p-4 rounded-xl"><Briefcase size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0">Employed</p>
              <h4 className="text-2xl font-bold text-slate-800 mb-0">{loading ? '...' : stats.employedCount}</h4>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-purple-50 text-purple-600 p-4 rounded-xl"><Calendar size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0">Active Events</p>
              <h4 className="text-2xl font-bold text-slate-800 mb-0">{loading ? '...' : stats.activeEvents}</h4>
            </div>
          </div>
        </div>

        {/* --- SUCCESS STORIES SECTION --- */}
        <div className="row">
           <div className="col-12 mb-4">
             <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Trophy className="text-amber-500" size={20} /> Global Alumni Success
             </h4>
           </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
           
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-50">
                    <img src="https://sscoetjalgaon.ac.in/public/images/top-alumni/team9.jpeg?auto=compress&cs=tinysrgb&w=150" alt="Alumni" className="w-full h-full object-cover" />
                </div>
                <h6 className="font-bold text-slate-800 mb-1">Nitin Ingale</h6>
                <p className="text-[11px] text-slate-500 mb-2 font-medium">Assistant Commandant/DYSP(CRPF)</p>
                <div className="bg-slate-50 py-1 px-3 rounded-lg inline-block">
                    <span className="text-[10px] font-bold text-blue-600">India</span>
                </div>
            </div>

            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-50">
                    <img src="https://sscoetjalgaon.ac.in/public/images/top-alumni/team6.jpg?auto=compress&cs=tinysrgb&w=150" alt="Alumni" className="w-full h-full object-cover" />
                </div>
                <h6 className="font-bold text-slate-800 mb-1">Aditya Baraskar</h6>
                <p className="text-[11px] text-slate-500 mb-2 font-medium">Director and CO-Founder of Entropy Reasearch and Developement</p>
                <div className="bg-slate-50 py-1 px-3 rounded-lg inline-block">
                    <span className="text-[10px] font-bold text-orange-600">India</span>
                </div>
            </div>

            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-50">
                    <img src="https://sscoetjalgaon.ac.in/public/images/top-alumni/team9.jpg?auto=compress&cs=tinysrgb&w=150" alt="Alumni" className="w-full h-full object-cover" />
                </div>
                <h6 className="font-bold text-slate-800 mb-1">Amey Shirwadkar</h6>
                <p className="text-[11px] text-slate-500 mb-2 font-medium">Energy Analyst at LCG Consulting</p>
                <div className="bg-slate-50 py-1 px-3 rounded-lg inline-block">
                    <span className="text-[10px] font-bold text-red-600">California (USA)</span>
                </div>
            </div>

            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-50">
                    <img src="https://sscoetjalgaon.ac.in/public/images/top-alumni/team8.JPG?auto=compress&cs=tinysrgb&w=150" alt="Alumni" className="w-full h-full object-cover" />
                </div>
                <h6 className="font-bold text-slate-800 mb-1">Rohan Patil</h6>
                <p className="text-[11px] text-slate-500 mb-2 font-medium">Data Scientist at GE Healthcare</p>
                <div className="bg-slate-50 py-1 px-3 rounded-lg inline-block">
                    <span className="text-[10px] font-bold text-cyan-600">Bengaluru, India</span>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;