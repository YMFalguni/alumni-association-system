import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AlumniLogin from './components/alumniLogin';
import AlumniRegister from './components/alumniRegister';
import AdminLogin from './components/adminLogin';
import AlumniDashboard from './components/alumniDashboard';
import AdminDashboard from './components/adminDashboard';
import AlumniEvent from './components/alumniEvent';
import AlumniProfile from './components/alumniProfile';
import ContactUs from './components/contactus';
import AdminAlumni from './components/adminAlumni';
import AdminEvents from './components/adminEvents';
import AdminAnalytics from './components/adminAnalytics';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    name: localStorage.getItem('userName') ? localStorage.getItem('userName') : ''
  });

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('userName', userData.name ? userData.name : '');
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser({ token: null, role: null, name: '' });
  };

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/alumniLogin' element={<AlumniLogin onLogin={handleLogin} />} />
        <Route path='/alumniRegister' element={<AlumniRegister />} />
        <Route path='/adminLogin' element={<AdminLogin onLogin={handleLogin} />} />
        <Route path='/alumniDashboard' element={<ProtectedRoute user={user} requiredRole='alumni'><AlumniDashboard /></ProtectedRoute>} />
        <Route path='/adminDashboard' element={<ProtectedRoute user={user} requiredRole='admin'><AdminDashboard /></ProtectedRoute>} />
        <Route path='/alumniEvent' element={<ProtectedRoute user={user} requiredRole='alumni'><AlumniEvent /></ProtectedRoute>} />
        <Route path='/alumniProfile' element={<ProtectedRoute user={user} requiredRole='alumni'><AlumniProfile /></ProtectedRoute>} />
        <Route path='/contactus' element={<ContactUs />} />
        <Route path='/adminAlumni' element={<ProtectedRoute user={user} requiredRole='admin'><AdminAlumni /></ProtectedRoute>} />
        <Route path='/adminEvents' element={<ProtectedRoute user={user} requiredRole='admin'><AdminEvents /></ProtectedRoute>} />
        <Route path='/adminAnalytics' element={<ProtectedRoute user={user} requiredRole='admin'><AdminAnalytics /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
