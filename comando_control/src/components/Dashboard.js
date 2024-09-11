import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Comando de Control</h1>
        <nav className="dashboard-nav">
          <ul>
            <li><Link to="/dashboard">Inicio</Link></li>
            <li><Link to="/login-form">Generar Script</Link></li>
            <li><Link to="/estado">Ver Estado</Link></li>
            <li><Link to="/Login">Cerrar Sesión</Link></li>
          </ul>
        </nav>
      </header>
      <main className="dashboard-main">
        <h2>¡BIENVENIDO!</h2>
      </main>
    </div>
  );
};

export default Dashboard;
