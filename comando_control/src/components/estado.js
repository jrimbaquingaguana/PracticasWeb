import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginForm.css';
import './estado.css';
import { Link, useNavigate } from 'react-router-dom';

function Estado() {
  const [networkData, setNetworkData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Inicializar useNavigate

  const fetchNcatStatus = async (port) => {
    try {
      const response = await axios.get('http://localhost:5000/carpetas', {
        params: { port }
      });
      return response.data.ncatOutput;
    } catch (err) {
      console.error('Error fetching ncat status:', err);
      return 'Error';
    }
  };

  const fetchNetworkData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/network-data');
      const data = response.data;
      setNetworkData(data);
      checkNetworkStates(data);
    } catch (err) {
      console.error('Error fetching network data:', err);
    }
  };

  const checkNetworkStates = async (data) => {
    setLoading(true);
    setMessage('Verificando redes...');

    let dots = '';
    const interval = setInterval(() => {
      dots += '.';
      if (dots.length > 3) {
        dots = '';
      }
      setMessage(`Verificando redes${dots}`);
    }, 500);

    const statusPromises = data.map(async (item) => {
      const status = await fetchNcatStatus(item.port);
      return { ...item, ncatStatus: status };
    });

    const updatedData = await Promise.all(statusPromises);
    clearInterval(interval);
    setNetworkData(updatedData);
    setLoading(false);
    setMessage('Proceso terminado.');
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const getButtonColor = (status) => {
    return status === 'On' ? 'green' : 'red';
  };

  const handleTortazoClick = (port) => {
    navigate(`/cmd/${port}`); // Redirigir a Cmd con el puerto
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

        {loading && <p className="message">{message}</p>}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>IP del Atacante</th>
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
                      style={{ backgroundColor: getButtonColor(data.ncatStatus) }}
                      disabled
                    >
                      {data.ncatStatus === 'On' ? 'On' : 'Off'}
                    </button>
                  </td>
                  <td>
                    {data.ncatStatus === 'On' && (
                      <button 
                        className="tortazo-button"
                        onClick={() => handleTortazoClick(data.port)} // Pasar el puerto al hacer clic
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

        {!loading && message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Estado;
