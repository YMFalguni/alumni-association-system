import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  Calendar,
  MessageSquare,
  LogOut,
  Briefcase,
  GraduationCap,
  Save,
  XCircle,
  Edit3,
} from "lucide-react";

function AlumniProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    graduationYear: "",
    department: "",
    employmentStatus: "",
    salary: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
       const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token not found in localStorage");
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/getuser", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      
      console.log("Response Status:", response.status);

      if (response.status === 401) {
        setError("Authentication failed. Please login again.");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend Error Message:", errorText);
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      setProfile({
        _id: data._id || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        graduationYear: data.graduationYear || "",
        department: data.department || "",
        employmentStatus: data.employmentStatus || "Employed",
        salary:
          data.salary !== undefined && data.salary !== null ? data.salary : "",
      });
    } catch (error) {
      console.error("Fetch error details:", error);
      setError("Error fetching profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // AlumniProfile.js handleSave function
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/alumni/updatealumni/${profile._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify(profile),
        },
      );

      if (response.ok) {
        alert("Profile Updated Successfully!");
        setIsEditing(false);
        fetchProfile();
      } else if (response.status === 401) {
        alert("Authentication failed. Please login again.");
        localStorage.clear();
        navigate("/");
      } else {
        alert("Update Failed: " + response.statusText);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating. Please try again.");
    }
  };
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg">
              S
            </div>
            <span className="font-bold text-sm tracking-tight">
              SSBT Alumni <br />
              <small className="text-[10px] text-slate-400">Portal</small>
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link
            to="/alumniDashboard"
            className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline"
          >
            <LayoutDashboard size={18} />{" "}
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link
            to="/alumniProfile"
            className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline"
          >
            <UserCircle size={18} />{" "}
            <span className="text-sm font-semibold">My Profile</span>
          </Link>
          <Link
            to="/alumniEvent"
            className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline"
          >
            <Calendar size={18} /> <span className="text-sm">Events</span>
          </Link>
          <Link
            to="/contactus"
            className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline"
          >
            <MessageSquare size={18} />{" "}
            <span className="text-sm">Contact Us</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all bg-transparent border-0 cursor-pointer text-left"
          >
            <LogOut size={18} />{" "}
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-0">
              My Profile
            </h2>
            <p className="text-xs text-slate-500">View and update your info</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all border-0 cursor-pointer shadow-md"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </header>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">
              Loading Profile...
            </div>
          ) : error ? (
            <div className="text-center py-20 text-rose-600">{error}</div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-amber-500 to-amber-700"></div>
              <div className="px-8 pb-8">
                <div className="relative flex justify-between items-end -mt-12 mb-8">
                  <div className="w-24 h-24 bg-white p-1 rounded-2xl shadow-lg">
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-3xl font-bold text-amber-600">
                      {profile.firstName?.charAt(0)}
                      {profile.lastName?.charAt(0)}
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h5 className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b pb-2">
                        <UserCircle size={18} className="text-amber-600" />{" "}
                        Personal
                      </h5>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="text-slate-400 w-32 inline-block">
                            Name:
                          </span>{" "}
                          <b>
                            {profile.firstName} {profile.lastName}
                          </b>
                        </p>
                        <p>
                          <span className="text-slate-400 w-32 inline-block">
                            Email:
                          </span>{" "}
                          <b>{profile.email}</b>
                        </p>
                        <p>
                          <span className="text-slate-400 w-32 inline-block">
                            Phone:
                          </span>{" "}
                          <b>{profile.phoneNumber}</b>
                        </p>
                      </div>
                    </section>
                    <section>
                      <h5 className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b pb-2">
                        <Briefcase size={18} className="text-amber-600" />{" "}
                        Professional
                      </h5>
                      <p className="text-sm">
                        <span className="text-slate-400 w-32 inline-block">
                          Status:
                        </span>{" "}
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">
                          {profile.employmentStatus}
                        </span>
                      </p>
                      <p className="text-sm mt-2">
                        <span className="text-slate-400 w-32 inline-block">
                          Salary:
                        </span>{" "}
                        <b>
                          {profile.salary
                            ? `₹${profile.salary}`
                            : "Not Provided"}
                        </b>
                      </p>
                    </section>
                    <section className="md:col-span-2">
                      <h5 className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b pb-2">
                        <GraduationCap size={18} className="text-amber-600" />{" "}
                        Education
                      </h5>
                      <div className="grid grid-cols-2 text-sm">
                        <p>
                          <span className="text-slate-400 w-32 inline-block">
                            Dept:
                          </span>{" "}
                          <b>{profile.department}</b>
                        </p>
                        <p>
                          <span className="text-slate-400 w-32 inline-block">
                            Year:
                          </span>{" "}
                          <b>{profile.graduationYear}</b>
                        </p>
                      </div>
                    </section>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-500">
                          FIRST NAME
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={profile.firstName}
                          onChange={onChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">
                          LAST NAME
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={profile.lastName}
                          onChange={onChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">
                          PHONE
                        </label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={profile.phoneNumber}
                          onChange={onChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">
                          GRADUATION YEAR
                        </label>
                        <input
                          type="number"
                          name="graduationYear"
                          value={profile.graduationYear}
                          onChange={onChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500">
                          SALARY
                        </label>
                        <input
                          type="number"
                          name="salary"
                          value={profile.salary}
                          onChange={onChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          placeholder="Salary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500">
                          EMPLOYMENT STATUS
                        </label>
                        <select
                          name="employmentStatus"
                          value={profile.employmentStatus}
                          onChange={onChange}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          required
                        >
                          <option value="Employed">Employed</option>
                          <option value="Higher Studies">Higher Studies</option>
                          <option value="Own Business">Own Business</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm border-0 cursor-pointer"
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm border-0 cursor-pointer shadow-md"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AlumniProfile;
