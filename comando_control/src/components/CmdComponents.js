import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function CmdWindow({ port }) {
  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [isNcatConnected, setIsNcatConnected] = useState(false);
  const socketRef = useRef(null); // Usar useRef para mantener la referencia del socket

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

      // Enviar el comando a la nueva ruta
      try {
        await axios.post('http://localhost:5000/send-command', { command });
      } catch (error) {
        console.error('Error sending command:', error);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', padding: '20px', backgroundColor: '#f0f0f0' }}></div>
      <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', padding: '20px', overflowY: 'auto' }}>
        <pre>
          {commandHistory.map((cmd, index) => (
            <div key={index}>{cmd}</div>
          ))}
          <div>
            {isNcatConnected && (
              <input
                type="text"
                value={inputCommand}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{ width: '80%', backgroundColor: 'black', color: 'white', border: 'none', outline: 'none' }}
              />
            )}
          </div>
        </pre>
      </div>
    </div>
  );
}

export default CmdWindow;
