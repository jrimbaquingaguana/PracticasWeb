// src/components/LoginForm.js

import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';
import { Link } from 'react-router-dom';



function LoginForm() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/generate-script', 
        { ip, port }, 
        { responseType: 'blob' } // Asegura que la respuesta se maneje como un archivo
      );

      // Crear un enlace de descarga y hacer clic en él para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'script.ps1'); // Nombre del archivo para la descarga
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error generating script. Please try again.');
      console.error(err);
    }
  };

  return (
    
    <div className="login-form">
      
      <nav className="dashboard-nav">
          <ul>
            <li><Link to="/dashboard">Inicio</Link></li>
            <li><Link to="/login-form">Generar Script</Link></li>
            <li><Link to="/estado">Ver Estado</Link></li>
            <li><Link to="/Login">Cerrar Sesión</Link></li>
          </ul>
        </nav>
      <h1>Generar Script PowerShell</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="ip">Dirección IP:</label>
          <input 
            id="ip"
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="port">Puerto:</label>
          <input 
            id="port"
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            required
            min="1"
            max="65535"
          />
        </div>
        <button type="submit">Generar Script</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default LoginForm;
