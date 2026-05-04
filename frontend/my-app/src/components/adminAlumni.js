import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, BarChart3, 
  LogOut, FileDown, Search, Trash2 
} from 'lucide-react';

function AdminAlumni() {
  const [alumniData, setAlumniData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Dynamically generate years from alumni data
  const years = alumniData.length > 0 
    ? Array.from(new Set(
        alumniData
          .map(a => a.graduationYear)
          .filter(year => year && !isNaN(year)) // Remove null, undefined, and non-numeric values
      ))
        .map(Number) // Convert to number for proper sorting
        .sort((a, b) => a - b)
    : [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  // 1. Fetch all Alumni from Backend
  const fetchAlumni = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/alumni/fetchall", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAlumniData(data);
      }
    } catch (error) {
      console.error("Error loading alumni:", error);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  // 2. Get departments for selected year
  const getDeptsForYear = (year) => {
    const depts = new Set(
      alumniData
        .filter(a => a.graduationYear === year)
        .map(a => a.department)
    );
    return Array.from(depts).sort();
  };

  // 3. Get alumni for selected year and department
  useEffect(() => {
    if (selectedYear && selectedDept) {
      let result = alumniData.filter(
        a => a.graduationYear === selectedYear && a.department === selectedDept
      );
      
      if (searchTerm) {
        result = result.filter(person =>
          (person.firstName + ' ' + person.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredAlumni(result);
    }
  }, [selectedYear, selectedDept, searchTerm, alumniData]);

  // 4. Delete Alumni Record
  const deleteAlumni = async (id) => {
    if (window.confirm("Are you sure you want to delete this alumni record?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/alumni/deletealumni/${id}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token') 
          }
        });
        
        if (response.ok) {
          alert("Alumni record deleted successfully.");
          fetchAlumni();
          // Reset the view if needed
          if (filteredAlumni.length === 1) {
            setFilteredAlumni([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Error: ${errorData.error || response.statusText || "Failed to delete alumni record"}`);
          console.error("Delete failed:", errorData);
        }
      } catch (error) {
        alert("Error deleting alumni record: " + error.message);
        console.error("Delete error:", error);
      }
    }
  };

  // 5. Export Data logic
  const exportData = () => {
    if (filteredAlumni.length === 0) {
      alert("No alumni to export");
      return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Email,Department,Year,Status,Designation"].join(",") + "\n"
      + filteredAlumni.map(a => `${a.firstName} ${a.lastName},${a.email},${a.department},${a.graduationYear},${a.employmentStatus},${a.designation || 'N/A'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alumni_${selectedYear}_${selectedDept.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
     
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg">A</div>
             <span className="font-bold text-sm tracking-tight text-white">ADMIN <br/><small className="text-[10px] text-slate-400 uppercase">Panel Control</small></span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link to="/adminDashboard" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
            <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/adminAlumni" className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline">
            <Users size={18} /> <span className="text-sm font-semibold">Manage Alumni</span>
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

    
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-0">Manage Alumni</h2>
            <p className="text-xs text-slate-500">
              {selectedYear && selectedDept 
                ? `${selectedDept} - Batch ${selectedYear} (${filteredAlumni.length} alumni)`
                : "Select year and department to view alumni"
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedYear && selectedDept && (
              <button 
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-semibold text-sm transition-colors border-0 cursor-pointer"
              >
                <FileDown size={18} /> Export CSV
              </button>
            )}
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">AD</div>
          </div>
        </header>

        {/* LEVEL 1: YEAR SELECTION */}
        {!selectedYear ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Select a Graduation Year</h3>
              <div className="grid grid-cols-4 gap-4">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all cursor-pointer font-bold text-lg text-blue-900 hover:shadow-lg hover:scale-105 transform"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : !selectedDept ? (
          /* LEVEL 2: DEPARTMENT SELECTION */
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedYear(null);
                setSelectedDept(null);
              }}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 rounded-xl transition-colors border-0 bg-transparent cursor-pointer mb-4 text-sm font-semibold"
            >
              ← Back to Years
            </button>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Batch {selectedYear}</h3>
              <p className="text-sm text-slate-500 mb-6">Select a Department</p>
              <div className="grid grid-cols-3 gap-4">
                {getDeptsForYear(selectedYear).length > 0 ? (
                  getDeptsForYear(selectedYear).map(dept => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-all cursor-pointer font-bold text-amber-900 hover:shadow-lg hover:scale-105 transform text-sm"
                    >
                      {dept}
                      <div className="text-xs font-normal text-amber-700 mt-2">
                        {alumniData.filter(a => a.graduationYear === selectedYear && a.department === dept).length} alumni
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 p-8 text-center text-slate-400">
                    No departments available for batch {selectedYear}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* LEVEL 3: ALUMNI LIST */
          <div className="space-y-6">
            <button
              onClick={() => setSelectedDept(null)}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 rounded-xl transition-colors border-0 bg-transparent cursor-pointer mb-4 text-sm font-semibold"
            >
              ← Back to Departments ({selectedYear})
            </button>

            {/* SEARCH BAR */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" 
                  placeholder="Search by name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* ALUMNI TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Alumni Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email Address</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Employment Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAlumni.length > 0 ? (
                    filteredAlumni.map((person) => (
                      <tr key={person._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-800">{person.firstName} {person.lastName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{person.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{person.phoneNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            person.employmentStatus === 'Employed' ? 'bg-green-100 text-green-700' : 
                            person.employmentStatus === 'Higher Studies' ? 'bg-blue-100 text-blue-700' : 
                            person.employmentStatus === 'Own Business' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {person.employmentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => deleteAlumni(person._id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-sm italic">
                        No alumni records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminAlumni;