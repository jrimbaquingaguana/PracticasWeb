import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import LoginForm from './components/LoginForm';
import PrivateRoute from './components/PrivateRoute';
import Estado from './components/estado';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login-form" element={<PrivateRoute><LoginForm /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/estado" element={<PrivateRoute><Estado /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
