import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CmdWindow.css';

function CmdWindow({ port }) {
  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [isNcatConnected, setIsNcatConnected] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const commandHistoryRef = useRef(null); // Referencia para el contenedor de historial

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:5000');

    socketRef.current.onmessage = (event) => {
      const data = event.data;
      setCommandHistory((prev) => [...prev, data]);
    };

    const startNcat = async () => {
      try {
        await axios.post('http://localhost:5000/start-ncat', { port });
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
    if (event.key === 'Enter' && isNcatConnected) {
      const command = inputCommand.trim();
      setCommandHistory((prev) => [...prev, `> ${command}`]);
      setInputCommand('');

      try {
        await axios.post('http://localhost:5000/send-command', { command });
      } catch (error) {
        console.error('Error sending command:', error);
      }
    }
  };

  const handleBackClick = () => {
    navigate('/estado');
  };

  // Efecto para hacer scroll hacia abajo al actualizar el historial
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
