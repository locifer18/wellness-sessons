import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const PrivateRoute = () => {
    const [auth] = useAuth(); // Get the auth object from context
    return auth?.user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
