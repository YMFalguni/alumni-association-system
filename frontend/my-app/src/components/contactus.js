import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard, UserCircle, Calendar, MessageSquare,
    LogOut, Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2, X
} from 'lucide-react';

function ContactUs() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const response = await fetch("http://localhost:5000/api/alumni/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitMessage(data.message || "Thank you for your message! We will get back to you soon.");
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                setSubmitMessage(data.error || "Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting contact form:", error);
            setSubmitMessage("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg">A</div>
                        <span className="font-bold text-sm tracking-tight">ALUMNI <br/><small className="text-[10px] text-slate-400 uppercase">Dashboard</small></span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/alumniDashboard" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/alumniProfile" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <UserCircle size={18} /> <span className="text-sm">Profile</span>
                    </Link>
                    <Link to="/alumniEvent" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <Calendar size={18} /> <span className="text-sm">Events</span>
                    </Link>
                    <Link to="/contactus" className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline">
                        <MessageCircle size={18} /> <span className="text-sm font-semibold">Contact Us</span>
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
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 text-left">Contact Us</h2>
                    <p className="text-sm text-slate-500 text-left">Get in touch with the alumni association team.</p>
                </header>

                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Information Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-8 border-amber-600 border-t border-r border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-inner">
                                    <MessageSquare size={24} className="text-amber-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-slate-900 mb-0">Get in Touch</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Contact Information</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-900 mb-1">Email</p>
                                        <p className="text-slate-600 text-sm">alumni@sscoetjalgaon.ac.in</p>
                                        <p className="text-slate-400 text-xs">We respond within 24 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-900 mb-1">Phone</p>
                                        <p className="text-slate-600 text-sm">+91-257-2258421</p>
                                        <p className="text-slate-400 text-xs">Mon-Sat, 11AM-5PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-900 mb-1">Address</p>
                                        <p className="text-slate-600 text-sm">
                                            Bambhori, Jalgaon, Maharashtra 425001
                                        </p>
                                        <p className="text-slate-400 text-xs">Visit us anytime</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                                <h4 className="font-bold text-amber-900 mb-2">Office Hours</h4>
                                <div className="text-amber-800 text-sm space-y-1">
                                    <p>🕒 Monday - Friday: 10:00 AM - 5:00 PM</p>
                                    <p>🕒 Saturday: 10:00 AM - 2:00 PM</p>
                                    <p>🕒 Sunday: Closed</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-8 border-amber-600 border-t border-r border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Send size={24} className="text-amber-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-slate-900 mb-0">Send us a Message</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">We'd Love to Hear From You</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50/50"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50/50"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50/50"
                                        placeholder="What's this about?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-vertical bg-slate-50/50"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-600/20 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Sending Message...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Send Message
                                        </>
                                    )}
                                </button>

                                {submitMessage && (
                                    <div className={`mt-4 p-4 rounded-xl border ${
                                        submitMessage.includes('Thank you')
                                            ? 'bg-green-50 text-green-800 border-green-200'
                                            : 'bg-red-50 text-red-800 border-red-200'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {submitMessage.includes('Thank you') ? (
                                                <CheckCircle2 size={16} className="text-green-600" />
                                            ) : (
                                                <X size={16} className="text-red-600" />
                                            )}
                                            <span className="font-medium">{submitMessage}</span>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ContactUs;