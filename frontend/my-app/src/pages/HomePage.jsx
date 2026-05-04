import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Award, Briefcase, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await fetch('http://localhost:5000/api/events/fetchall', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token') || ''
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        
        // Transform backend event data to match UI format
        const formattedEvents = data.map(event => {
          const eventDate = new Date(event.date);
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const month = monthNames[eventDate.getMonth()];
          const day = eventDate.getDate();
          const year = eventDate.getFullYear();

          return {
            date: `${month} ${String(day).padStart(2, '0')}`,
            year: year.toString(),
            title: event.title,
            location: event.location,
            description: event.description,
            capacity: event.capacity
          };
        });

        setEvents(formattedEvents);
        setEventsError(null);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsError(error.message);
        // Fallback to empty events if API fails
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true }
  };

  const stats = [
    { number: '15,000+', label: 'Alumni Network', icon: Users },
    { number: '25+', label: 'Years of Legacy', icon: Award },
    { number: '100+', label: 'Top Recruiters', icon: Briefcase },
    { number: '276+', label: 'Annual Placements', icon: Award }
  ];

  const notableAlumni = [
    {
      name: 'Aditya Baraskar',
      role: 'Director & Co-Founder',
      company: 'Entropy R&D Pvt Ltd',
      image: 'https://images.unsplash.com/photo-1762522927402-f390672558d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBjb3Jwb3JhdGUlMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDB8fHx8MTc3NTIxMjcwOHww&ixlib=rb-4.1.0&q=85'
    },
    {
      name: 'Pragya Pratik',
      role: 'Care Program Manager',
      company: 'Nokia Networks',
      image: 'https://images.pexels.com/photos/36645466/pexels-photo-36645466.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
    },
    {
      name: 'Rohan Patil',
      role: 'Data Scientist',
      company: 'GE Healthcare, Bengaluru',
      image: 'https://images.unsplash.com/photo-1610387694365-19fafcc86d86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb3Jwb3JhdGUlMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDB8fHx8MTc3NTIxMjcwOHww&ixlib=rb-4.1.0&q=85'
    },
    {
      name: 'Nitin Ingale',
      role: 'Assistant Commandant/DySP',
      company: 'CRPF, Ministry of Home Affairs',
      image: 'https://images.unsplash.com/photo-1762438136254-377496840891?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBncmFkdWF0aW9uJTIwY2VyZW1vbnl8ZW58MHx8fHwxNzc1MjEyNzA4fDA&ixlib=rb-4.1.0&q=85'
    }
  ];

  const galleryImages = [
    'https://sscoetjalgaon.ac.in/public/images/gallery/applied-science/11.jpg',
    'https://sscoetjalgaon.ac.in/public/images/gallery/chemical/IMG_20190925_125743.jpg',
    'https://sscoetjalgaon.ac.in/public/images/gallery/computer/17.ADVANCE-JAVA-WORKSHOP.jpg',
    'https://sscoetjalgaon.ac.in/public/images/home-page/mca.jpg',
    'https://sscoetjalgaon.ac.in/public/images/home-campus-life//snap%20(15)-min.jpg',
    'https://sscoetjalgaon.ac.in/public/images/gallery/mba/12.png'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'glass-morphism shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-slate-900">SSBT Alumni</h1>
                
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors">About</a>
              <a href="#alumni" className="text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors">Alumni</a>
              <a href="#events" className="text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors">Events</a>
              <a href="#gallery" className="text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors">Gallery</a>
              
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://img.studyclap.com/img/institute/college/original/1086/scet-jalgaon-campus-building-52babf.jpg"
            alt="SSBT Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-2 bg-amber-600/20 backdrop-blur-sm border border-amber-600/30 rounded-full text-amber-300 text-sm font-medium mb-6">
              NAAC 'A' Grade Accredited
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
             SSBT's College of Engineering & Technology,JALGAON.
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-4 leading-relaxed">
             Transforming alumni data into meaningful insights through a scalable and interactive web-based platform.
            </p>
            <p className="text-base md:text-lg text-slate-300 mb-8">
              Shram Sadhana Bombay Trust | Jalgaon, Maharashtra
            </p>
            <div className="flex flex-wrap gap-4">
             <Link to="/alumniLogin" className="inline-block">
  <Button data-testid="alumni-login-btn" size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8">
    Alumni Login
    <ArrowRight className="ml-2 h-5 w-5" />
  </Button>
</Link> 

 <Link to="/adminLogin" className="inline-block">
  <Button data-testid="admin-login-btn" size="lg" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8">
    Admin Login
    <ArrowRight className="ml-2 h-5 w-5" />
  </Button>
</Link> 

            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-24">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-2xl mb-4">
                    <Icon className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</h3>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-amber-600 mb-4 block">About Us</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                Shaping Excellence in Education Since 1998
              </h2>
              <p className="text-base leading-relaxed text-slate-700 mb-4">
             SSBT’s College of Engineering & Technology, Bambhori, Jalgaon, established by Shram Sadhana Bombay Trust, is a leading institute in Maharashtra located on a 25-acre green campus along the Girna River. It offers modern facilities and a wide range of undergraduate engineering programs along with postgraduate courses like MBA, MCA, and Ph.D. programs. The institute is affiliated with Kavayitri Bahinabai Chaudhari North Maharashtra University and is known for its academic excellence, holding NAAC ‘A’ Grade accreditation (CGPA 3.14) and ISO 9001:2015 certification. It has received several prestigious awards, reflecting its commitment to quality education, innovation, and overall development.
              </p>
            </motion.div>
            <motion.div {...fadeInUp} className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://sscoetjalgaon.ac.in/public/images/slider/snap.jpg"
                  alt="SSBT Campus"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    
     

      {/* Notable Alumni */}
      <section id="alumni" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-amber-500 mb-4 block">Our Pride</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Notable Alumni Making an Impact
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our alumni are leaders, innovators, and change-makers across various industries worldwide
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {notableAlumni.map((alumni, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                data-testid={`alumni-card-${index}`}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="w-32 h-32 rounded-2xl overflow-hidden">
                  <img
                    src={alumni.image}
                    alt={alumni.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-white mb-2">{alumni.name}</h3>
                  <p className="text-sm text-amber-500 mb-1">{alumni.role}</p>
                  <p className="text-sm text-slate-400">{alumni.company}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events & News */}
      <section id="events" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-amber-600 mb-4 block">Stay Connected</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Upcoming Events & News
            </h2>
          </motion.div>

          {eventsLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading events...</p>
            </div>
          ) : eventsError ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading events. Please try again later.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No events scheduled yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {events.map((event, index) => (
                <Link key={index} to="/alumniEvent" className="block">
                  <motion.div
                    variants={fadeInUp}
                    data-testid={`event-card-${index}`}
                    className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow group cursor-pointer"
                  >
                    <div className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 text-center">
                          <div className="bg-amber-600 text-white rounded-xl p-4 mb-2">
                            <p className="text-2xl font-bold leading-none">{event.date.split(' ')[1]}</p>
                            <p className="text-xs uppercase mt-1">{event.date.split(' ')[0]}</p>
                          </div>
                          <p className="text-xs text-slate-500">{event.year}</p>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Gallery */}
   
   <section id="gallery" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-amber-600 mb-4 block">Memories</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Campus Life & Alumni Moments
            </h2>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl overflow-hidden shadow-lg cursor-pointer h-72 flex items-center justify-center"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
     
      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold">SSBT Alumni</h3>
                  
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                
              </p>
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="text-slate-400 hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#alumni" className="text-slate-400 hover:text-amber-500 transition-colors">Notable Alumni</a></li>
                <li><a href="#events" className="text-slate-400 hover:text-amber-500 transition-colors">Events</a></li>
                <li><a href="#gallery" className="text-slate-400 hover:text-amber-500 transition-colors">Gallery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Bambhori, Jalgaon, Maharashtra</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+91-257-2258421</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>alumni@sscoetjalgaon.ac.in</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold mb-4 uppercase tracking-wider">Follow Us</h4>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" data-testid="facebook-link" className="w-10 h-10 bg-slate-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" data-testid="twitter-link" className="w-10 h-10 bg-slate-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" data-testid="linkedin-link" className="w-10 h-10 bg-slate-800 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
              <a href="https://sscoetjalgaon.ac.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 text-sm text-amber-500 hover:text-amber-400 transition-colors">
                Visit College Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} SSBT's College of Engineering & Technology Alumni Association. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;