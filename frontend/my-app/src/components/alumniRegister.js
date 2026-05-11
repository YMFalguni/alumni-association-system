import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, GraduationCap, Building2, Briefcase, ArrowRight, DollarSign } from "lucide-react"; // आधुनिक आयकॉन्ससाठी

function AlumniRegister() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    cpassword: "",
    phoneNumber: "",
    graduationYear: "2026",
    department: "",
    employmentStatus: "",
    salary: "",
  });

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (credentials.password !== credentials.cpassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    
    const alumniData = {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      password: credentials.password,
      phoneNumber: credentials.phoneNumber,
      graduationYear: parseInt(credentials.graduationYear), 
      department: credentials.department,
      employmentStatus: credentials.employmentStatus,
      salary: credentials.salary ? parseInt(credentials.salary) : undefined
    };

    console.log("Sending Data to Backend:", alumniData); 

    const response = await fetch("http://localhost:5000/api/auth/createalumni", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(alumniData), 
    });

    const json = await response.json();

    if (response.ok && json.authToken) {
      localStorage.setItem("token", json.authToken);
      localStorage.setItem("role", "alumni");
      alert("Registration Successful!");
      navigate("/alumniDashboard");
    } else {
  
      alert(json.error || (json.errors ? json.errors[0].msg : "Invalid Details"));
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Server error. Please try again later.");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
    
      

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100 animate-fade-in-up">
        
        {/* Branding Header */}
        <div className="mb-10">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
             <GraduationCap className="text-amber-600 w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Create Your Account</h3>
          <p className="text-sm text-slate-500 mt-2">Join SSBT’s global network of distinguished professionals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input type="text" name="firstName" value={credentials.firstName} onChange={onChange} required placeholder="John" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input type="text" name="lastName" value={credentials.lastName} onChange={onChange} required placeholder="Doe" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input type="email" name="email" value={credentials.email} onChange={onChange} required placeholder="john.doe@example.com" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input type="password" name="password" value={credentials.password} onChange={onChange} required placeholder="••••••••" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input type="password" name="cpassword" value={credentials.cpassword} onChange={onChange} required placeholder="••••••••" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Department</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <select name="department" value={credentials.department} onChange={onChange} required className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none transition-all">
                  <option value="">Select Department</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="E&TC">E&TC</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Graduation Year</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input type="number" name="graduationYear" value={credentials.graduationYear} onChange={onChange} min="1970" max="2026" required className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Phone Number</label>
               <div className="relative">
                <Phone className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input type="text" name="phoneNumber" value={credentials.phoneNumber} onChange={onChange} minLength={10} required placeholder="+91 00000 00000" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Employment Status</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <select name="employmentStatus" value={credentials.employmentStatus} onChange={onChange} required className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none transition-all">
                  <option value="">Select Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Higher Studies">Higher Studies</option>
                  <option value="Own Business">Own Business</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Salary (Optional) - Annual Salary in Rupees</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input type="number" name="salary" value={credentials.salary} onChange={onChange} placeholder="e.g., 500000" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition-all" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20 active:scale-95 mt-4">
            Register Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-600">
          Already registered? <Link to="/alumniLogin" className="text-amber-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default AlumniRegister;