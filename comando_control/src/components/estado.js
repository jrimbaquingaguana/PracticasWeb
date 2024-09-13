import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginForm.css';
import './estado.css';
import { Link } from 'react-router-dom';

function Estado() {
  const [ncatStatus, setNcatStatus] = useState('');
  const [networkData, setNetworkData] = useState([]);
  const [selectedNetworkName, setSelectedNetworkName] = useState('');
  const [filteredData, setFilteredData] = useState([]);

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

  // Función para obtener los datos de red
  const fetchNetworkData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/network-data');
      setNetworkData(response.data);
      setFilteredData(response.data);  // Inicialmente, muestra todos los datos
    } catch (err) {
      console.error('Error fetching network data:', err);
    }
  };

  // Filtrar los datos de red basados en el nombre seleccionado
  const handleNetworkNameChange = (event) => {
    const name = event.target.value;
    setSelectedNetworkName(name);

    if (name === '') {
      setFilteredData(networkData);
    } else {
      const filtered = networkData.filter(data => data.networkName === name);
      setFilteredData(filtered);
    }
  };

  // Llamar a fetchNcatStatus y fetchNetworkData cuando el componente se monte
  useEffect(() => {
    fetchNcatStatus();
    fetchNetworkData();
  }, []);

  // Obtener los nombres únicos de networks para el filtro
  const networkNames = [...new Set(networkData.map(data => data.networkName))];

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

      <div className="network-data">
        <h2>Datos de Red</h2>
        <select id="network-select" value={selectedNetworkName} onChange={handleNetworkNameChange}>
          <option value="">Todos las Redes</option>
          {networkNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>

        <table>
          <thead>
            <tr>
              <th>IP</th>
              <th>Port</th>
              <th>Network Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((data, index) => (
              <tr key={index}>
                <td>{data.ip}</td>
                <td>{data.port}</td>
                <td>{data.networkName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Estado;
