import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginForm.css';
import './estado.css';
import { Link } from 'react-router-dom';

function LoginForm() {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [error, setError] = useState('');
  const [ncatStatus, setNcatStatus] = useState('');

  // Función para obtener el estado de ncat
  const fetchNcatStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/carpetas');
      console.log('Ncat status response:', response.data); // Verifica la respuesta
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
    <div className="estado">
      <nav className="dashboard-nav">
        <ul>
          <li><Link to="/dashboard">Inicio</Link></li>
          <li><Link to="/login-form">Generar Script</Link></li>
          <li><Link to="/estado">Ver Estado</Link></li>
          <li><Link to="/Login">Cerrar Sesión</Link></li>
        </ul>
      </nav>

      <div className="ncat-status">
        <h2>Estado de ncat</h2>
        <p>Estado actual: {ncatStatus}</p>
      </div>
    </div>
  );
}

export default LoginForm;
