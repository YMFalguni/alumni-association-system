import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user = { token: null, role: null, name: "" }, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // remove only auth-related items instead of clearing all app storage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    if (setUser) setUser({ token: null, role: null, name: "" });
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ background: "#808080" }}>
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-graduation-cap me-2"></i>ALUMNI CONNECT
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <>
                <li className="nav-item"><Link className="nav-link" to="/alumniLogin">Events</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/contactus">Contact</Link></li>
              </>
            
              <>
                {/* <li className="nav-item">
                  <Link className="nav-link" to={user.role === 'admin' ? '/adminDashboard' : '/alumniDashboard'}>
                    My Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <button type="button" onClick={handleLogout} className="btn nav-link" style={{ border: 'none', background: 'none' }}>Logout</button>
                </li> */}
              </>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;