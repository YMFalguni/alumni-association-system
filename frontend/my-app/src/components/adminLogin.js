import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/adminlogin", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
      });

      const json = await response.json();

      if (json.success) {
        localStorage.setItem('token', json.authToken);
        localStorage.setItem('role', 'admin');
        navigate('/adminDashboard');
        window.location.reload();
      } else {
        alert(json.error || "Invalid Admin Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-fade-in-up">
        
        {/* Branding Header */}
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-700 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 shadow-xl shadow-amber-600/30">
             <ShieldCheck className="text-white h-10 w-10" />
          </div>
          <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-[0.15em] rounded-full mb-3">
            Admin Portal
          </span>
         
          <p className="text-slate-500 text-sm">
            Please enter your administrative credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Admin Email</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                required
                placeholder="admin@college.com"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={onChange}
                required
                placeholder="••••••••"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-600/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Login to Dashboard
            <ArrowRight className="h-6 w-6" />
          </button>
        </form>

        {/* Footer Security Note */}
        
      </div>
    </div>
  );
};

export default AdminLogin;