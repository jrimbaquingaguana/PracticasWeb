import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginForm.css';
import { Link } from 'react-router-dom';

function LoginForm() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [error, setError] = useState('');
  const [ncatStatus, setNcatStatus] = useState('');

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

  // Función para verificar si la IP, puerto y nombre de red ya existen
  const checkForDuplicates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/check-duplicates', {
        params: { ip, port, networkName }
      });
      return response.data.exists;
    } catch (err) {
      console.error('Error checking for duplicates:', err);
      setError('Error checking for duplicates. Please try again.');
      return false;
    }
  };

  // Función para validar el puerto
  const isValidPort = (port) => {
    const portNumber = parseInt(port, 10);
    return /^[0-9]{4}$/.test(port) && portNumber >= 1000 && portNumber <= 9999;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar puerto
    if (!isValidPort(port)) {
      setError('El puerto debe ser un número de 4 dígitos entre 1000 y 9999.');
      return;
    }

    // Verificar duplicados antes de generar el script
    const isDuplicate = await checkForDuplicates();
    if (isDuplicate) {
      setError('Ese puerto ya existe en la red');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/generate-script',
        { ip, port, networkName },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition ? contentDisposition.split('filename=')[1] : 'script.ps1';
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
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
            type="text" // Cambiado a "text" para permitir validación personalizada
            value={port}
            onChange={(e) => setPort(e.target.value)}
            required
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
