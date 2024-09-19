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

  // Función para obtener el estado de ncat para un puerto específico
  const fetchNcatStatus = async (port) => {
    try {
      const response = await axios.get('http://localhost:5000/carpetas', {
        params: { port } // Pasar el puerto como parámetro de consulta
      });
      return response.data.ncatOutput; // Devolver el estado de ncat
    } catch (err) {
      console.error('Error fetching ncat status:', err);
      return 'Error'; // Retornar un mensaje de error si falla la solicitud
    }
  };

  // Función para obtener los datos de red
  const fetchNetworkData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/network-data');
      const data = response.data;
      setNetworkData(data);
      setFilteredData(data);  // Inicialmente, muestra todos los datos

      // Consultar el estado de ncat para cada puerto
      const statusPromises = data.map(async (item) => {
        const status = await fetchNcatStatus(item.port);
        return { ...item, ncatStatus: status };
      });

      // Esperar a que todas las promesas se resuelvan y actualizar el estado
      const updatedData = await Promise.all(statusPromises);
      setFilteredData(updatedData);
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

  // Llamar a fetchNetworkData cuando el componente se monte
  useEffect(() => {
    fetchNetworkData();
  }, []);

  // Obtener los nombres únicos de networks para el filtro
  const networkNames = [...new Set(networkData.map(data => data.networkName))];

  // Función para determinar el color del botón basado en el estado de ncat
  const getButtonColor = (status) => {
    return status === 'On' ? 'green' : 'red'; // Verde si está encendido, rojo si está apagado
  };

  // Función para manejar el clic en el botón "Tortazo"
  const handleTortazoClick = () => {
    alert('Haz salido hackiado');
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

      <div className="network-data">
        <h2>Datos de Red</h2>

        <table>
          <thead>
            <tr>
              <th>IP</th>
              <th>Port</th>
              <th>Network Name</th>
              <th>Status</th>
              <th>Action</th> {/* Añadido para el nuevo botón */}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((data, index) => (
              <tr key={index}>
                <td>{data.ip}</td>
                <td>{data.port}</td>
                <td>{data.networkName}</td>
                <td>
                  <button 
                    style={{ 
                      backgroundColor: getButtonColor(data.ncatStatus) 
                    }}
                    disabled // Desactivar el botón si no necesitas interacción
                  >
                    {data.ncatStatus === 'On' ? 'On' : 'Off'}
                  </button>
                </td>
                <td>
                  {data.ncatStatus === 'On' && ( // Mostrar el botón "Tortazo" solo si el estado es "On"
                    <button 
                      className="tortazo-button"
                      onClick={handleTortazoClick}
                    >
                      Tortazo
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Estado;
