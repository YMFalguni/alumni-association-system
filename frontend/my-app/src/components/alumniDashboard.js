import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, UserCircle, Calendar, MessageSquare, 
  LogOut, Users, CheckCircle2, RefreshCw 
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function AlumniDashboard() {
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  
  const [stats, setStats] = useState({
    totalAlumni: 0,
    careerDistribution: [],
    yearlyPlacements: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0); 

  // १. Pie Chart Data Logic
  const pieChartData = {
    labels: ['Employed', 'Higher Studies', 'Own Business', 'Others'],
    datasets: [
      {
        data: (() => {
          const counts = { 'Employed': 0, 'Higher Studies': 0, 'Own Business': 0, 'Others': 0 };
          if (stats.careerDistribution?.length > 0) {
            stats.careerDistribution.forEach(item => {
              if (item._id === "Employed") counts['Employed'] = item.count;
              else if (item._id === "Higher Studies") counts['Higher Studies'] = item.count;
              else if (item._id === "Own Business") counts['Own Business'] = item.count;
              else counts['Others'] += item.count;
            });
          }
          return [counts['Employed'], counts['Higher Studies'], counts['Own Business'], counts['Others']];
        })(),
        backgroundColor: ['#d97706', '#f59e0b', '#fbbf24', '#cbd5e1'],
        borderWidth: 1,
      },
    ],
  };

 
  const barChartData = {
    labels: stats.yearlyPlacements?.length > 0 
      ? stats.yearlyPlacements.map(item => `Year ${item._id}`) 
      : ['2022', '2023', '2024', '2025', '2026'], 

    datasets: [
      {
        label: 'Placement Percentage (%)',
        data: stats.yearlyPlacements?.length > 0 
          ? stats.yearlyPlacements.map(item => {
              // Use server-calculated percentage if available, otherwise calculate on client
              if (item.placementPercentage !== undefined) {
                return parseFloat(item.placementPercentage);
              }
              // Fallback client-side calculation
              const percentage = item.totalInYear > 0 
                ? ((item.placedCount / item.totalInYear) * 100).toFixed(1) 
                : 0;
              return parseFloat(percentage);
            })
          : [0, 0, 0, 0, 0], 
        backgroundColor: ['#d97706', '#f59e0b', '#fbbf24', '#cbd5e1', '#6b7280'],
        borderRadius: 8,
        fill: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100, 
        ticks: {
          callback: (value) => value + "%", // 
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: { 
        display: true,
        labels: {
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => `Placement Rate: ${context.raw}%`,
          afterLabel: (context) => {
            const item = stats.yearlyPlacements[context.dataIndex];
            return item ? `Total Alumni: ${item.totalInYear}, Employed: ${item.placedCount}` : '';
          }
        }
      }
    },
    animation: {
      duration: 300 // Smooth animation on update
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  // Function to fetch and calculate profile completion
  const fetchProfileCompletion = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/auth/getuser", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          "auth-token": token 
        },
      });

      if (response.ok) {
        const profile = await response.json();
        
        // Calculate completion based on filled fields
        const requiredFields = [
          'firstName', 'lastName', 'email', 'phoneNumber', 
          'graduationYear', 'department', 'employmentStatus'
        ];
        
        let filledFields = 0;
        requiredFields.forEach(field => {
          if (profile[field] && profile[field].toString().trim() !== '') {
            filledFields++;
          }
        });
        
        const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
        setProfileCompletion(completionPercentage);
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    }
  };

  // Function to fetch dashboard stats with real-time updates
  const fetchDashboardStats = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setIsRefreshing(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/adminstats", {
        method: "GET",
        headers: { "Content-Type": "application/json", "auth-token": token || "" },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      
      setStats({
        totalAlumni: data.totalAlumni || 0,
        careerDistribution: data.careerDistribution || [],
        yearlyPlacements: data.yearlyPlacements || [] 
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchDashboardStats(false);
    fetchProfileCompletion();
  };

  useEffect(() => {
    // Initial fetch
    fetchDashboardStats();
    fetchProfileCompletion();

    // Setup auto-refresh every 15 seconds for real-time updates
    intervalRef.current = setInterval(() => {
      fetchDashboardStats(false);
      fetchProfileCompletion(); // Also refresh profile completion
    }, 15000); // Refresh every 15 seconds

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Old useEffect code to remove
  // (This will be replaced by the new fetchDashboardStats function above)


  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg">S</div>
             <span className="font-bold text-sm tracking-tight">SSBT Alumni <br/><small className="text-[10px] text-slate-400">Portal</small></span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link to="/alumniDashboard" className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline">
            <LayoutDashboard size={18} /> <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link to="/alumniProfile" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
            <UserCircle size={18} /> <span className="text-sm">My Profile</span>
          </Link>
          <Link to="/alumniEvent" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
            <Calendar size={18} /> <span className="text-sm">Events</span>
          </Link>
          <Link to="/contactus" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
            <MessageSquare size={18} /> <span className="text-sm">Contact Us</span>
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
            <h2 className="text-xl font-bold text-slate-900 mb-0">Welcome Back!</h2>
            <p className="text-xs text-slate-500">Alumni Dashboard & Analytics </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-semibold text-sm transition-colors border-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button> */}
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">A</div>
          </div>
        </header>

        {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-4 border border-red-100 text-sm">Error: {error}</div>}

        {/* Top Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-4 rounded-xl"><Users size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-0">Total Registered</p>
              <h4 className="text-2xl font-bold text-slate-800 mb-0">{loading ? '...' : stats.totalAlumni}</h4>
            </div>
          </div>

          <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-bold text-slate-700">Your Profile is {profileCompletion}% complete</span>
              </div>
              <button 
                onClick={() => navigate("/alumniProfile")}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold transition-colors border-0 cursor-pointer"
              >
                Update Profile
              </button>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-amber-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Graphs Section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h6 className="font-bold text-slate-800 mb-4">Career Distribution</h6>
            <div className="h-[300px] flex items-center justify-center">
               {loading ? <p className="text-sm text-slate-400 animate-pulse">Loading...</p> : <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h6 className="font-bold text-slate-800 mb-0">Yearly Placement Trends (%)</h6>
              {isRefreshing && <span className="text-xs text-amber-600 font-semibold animate-pulse">Updating...</span>}
            </div>
            <p className="text-xs text-slate-500 mb-3">Real-time data updated every 15 seconds</p>
            <div className="h-[300px] flex items-center justify-center">
               {loading ? <p className="text-sm text-slate-400 animate-pulse">Loading...</p> : <Bar data={barChartData} options={barChartOptions} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AlumniDashboard;