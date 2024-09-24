import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import LoginForm from './components/LoginForm';
import PrivateRoute from './components/PrivateRoute';
import Estado from './components/estado';
import Cmd from './components/CmdComponents'; // Asegúrate de que el nombre coincida

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
        <Route path="/cmd/:port" element={<PrivateRoute><Cmd /></PrivateRoute>} /> {/* Ruta para Cmd */}
      </Routes>
    </Router>
  );
}

export default App;
