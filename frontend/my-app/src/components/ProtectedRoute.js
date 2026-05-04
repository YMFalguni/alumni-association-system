import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // If no token, redirect to appropriate login
    if (!token) {
        return <Navigate to={requiredRole === 'admin' ? '/adminLogin' : '/alumniLogin'} />;
    }

    // If role doesn't match, send to home or error page
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;