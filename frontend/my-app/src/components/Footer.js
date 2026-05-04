import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h5 className="footer-title">About Our College</h5>
            <p>
              Since its founding, our institution has been committed to excellence. 
              Our Alumni platform serves as a digital home where data is preserved, 
              careers are launched, and lifelong bonds are honored.
            </p>
            <div className="social-icons mt-3">
              {/* Added rel="noreferrer" for security and real '#' links replaced with valid paths or empty strings */}
              <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 mb-4">
            <h5 className="footer-title">Alumni</h5>
            <ul className="list-unstyled">
              <li><Link to="/alumniDashboard">Member Directory</Link></li>
              <li><Link to="/alumniDashboard">Job Board</Link></li>
              <li><Link to="/alumniDashboard">Verify Records</Link></li>
              <li><Link to="/alumniEvent">Events</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 mb-4">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/alumniLogin">Alumni Login</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-4 mb-4">
            <h5 className="footer-title">Contact Us</h5>
            <p><i className="fas fa-map-marker-alt me-2 text-primary"></i> 123 Education Lane, University Hub</p>
            <p><i className="fas fa-phone-alt me-2 text-primary"></i> +1 800 123 456</p>
            <p><i className="fas fa-envelope me-2 text-primary"></i> alumni.office@college.edu</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;