// src/components/LoginForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginForm.css';
import './estado.css';
import { Link } from 'react-router-dom';

function LoginForm() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [networkName, setNetworkName] = useState(''); // Añadido para capturar el nombre de la red
  const [error, setError] = useState('');
  const [ncatStatus, setNcatStatus] = useState(''); // Estado para mostrar el estado de ncat

  // Función para obtener el estado de ncat
  const fetchNcatStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/carpetas');
      setNcatStatus(response.data.ncatOutput);
    } catch (err) {
      console.error('Error fetching ncat status:', err);
      setNcatStatus('Error fetching status');
    }
  };

  // Llamar a fetchNcatStatus cuando el componente se monte
  useEffect(() => {
    fetchNcatStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/generate-script',
        { ip, port, networkName }, // Enviar todos los datos necesarios
        { responseType: 'blob' } // Asegura que la respuesta se maneje como un archivo
      );

      // Crear un enlace de descarga y hacer clic en él para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition ? contentDisposition.split('filename=')[1] : 'script.ps1';
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Nombre del archivo para la descarga
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
        <div>
          <label htmlFor="networkName">Nombre de la Red:</label>
          <input 
            id="networkName"
            type="text"
            value={networkName}
            onChange={(e) => setNetworkName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Generar Script</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default LoginForm;
