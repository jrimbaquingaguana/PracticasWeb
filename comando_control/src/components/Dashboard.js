import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import imagenControl from '../img/cociber.jpg'; // Ajusta la ruta a donde hayas guardado la imagen

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>COMANDO DE CONTROL</h1>
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
      <h1>BIENVENIDO COMANDO</h1>
        <h2>¡Si algo se puede medir, se puede mejorar!🔫🗿🪖</h2>
        {/* Agregamos la imagen aquí */}
        <img src={imagenControl} alt="Imagen de control" className="dashboard-image" />
      </main>
    </div>
  );
};

export default Dashboard;
