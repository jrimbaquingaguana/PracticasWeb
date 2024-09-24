import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginForm.css';
import './estado.css';
import { Link } from 'react-router-dom';

function Estado() {
  const [networkData, setNetworkData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Función para obtener el estado de ncat para un puerto específico
  const fetchNcatStatus = async (port) => {
    try {
      const response = await axios.get('http://localhost:5000/carpetas', {
        params: { port }
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
      setNetworkData(data); // Almacenar datos de red
      checkNetworkStates(data); // Comenzar a verificar estados
    } catch (err) {
      console.error('Error fetching network data:', err);
    }
  };

  // Función para manejar la verificación de estados
  const checkNetworkStates = async (data) => {
    setLoading(true);
    setMessage('Verificando redes...');

    // Consultar el estado de ncat para cada puerto
    const statusPromises = data.map(async (item) => {
      const status = await fetchNcatStatus(item.port);
      return { ...item, ncatStatus: status };
    });

    const updatedData = await Promise.all(statusPromises);
    setNetworkData(updatedData); // Actualizar con los nuevos estados
    setLoading(false);
    setMessage('Proceso terminado.'); // Mensaje al finalizar
  };

  // Llamar a fetchNetworkData cuando el componente se monte
  useEffect(() => {
    fetchNetworkData();
  }, []);

  // Función para determinar el color del botón basado en el estado de ncat
  const getButtonColor = (status) => {
    return status === 'On' ? 'green' : 'red'; // Verde si está encendido, rojo si está apagado
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

        {loading && <p className="message">{message}</p>} {/* Mostrar mensaje de progreso */}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>IP</th>
                <th>Port</th>
                <th>Network Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {networkData.map((data, index) => (
                <tr key={index}>
                  <td>{data.ip}</td>
                  <td>{data.port}</td>
                  <td>{data.networkName}</td>
                  <td>
                    <button 
                      style={{ 
                        backgroundColor: getButtonColor(data.ncatStatus) 
                      }}
                      disabled
                    >
                      {data.ncatStatus === 'On' ? 'On' : 'Off'}
                    </button>
                  </td>
                  <td>
                    {data.ncatStatus === 'On' && (
                      <button 
                        className="tortazo-button"
                        onClick={() => alert('Haz sido atacado por dos ingenieros del cociber')}
                      >
                        ATAQUE!
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && message && <p className="message">{message}</p>} {/* Mostrar mensaje final */}
      </div>
    </div>
  );
}

export default Estado;
