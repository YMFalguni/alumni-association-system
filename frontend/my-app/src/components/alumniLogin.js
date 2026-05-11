import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react'; 

const AlumniLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const response = await fetch("http://localhost:5000/api/auth/alumnilogin", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
      });

      const json = await response.json();

      if (response.ok && json.authToken) {
        
        localStorage.setItem('token', json.authToken);
        localStorage.setItem('role', 'alumni');
        localStorage.setItem('userName', json.user.firstName);
        
        navigate('/alumniDashboard');
        
        window.location.reload();
      } else {
        alert(json.error || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-fade-in-up">
        
        {/* SEA Branding Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-600/20">
             <span className="text-white font-bold text-2xl">S</span>
          </div>
          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
            Alumni Portal
          </span>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm">
            Sign in to connect with SSBT's global network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                required
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
            
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={onChange}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg shadow-amber-600/20"
          >
            Login to Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-600">
            Don't have an account?{' '}
            <Link to="/alumniRegister" className="text-amber-600 hover:text-amber-700 font-bold">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlumniLogin;