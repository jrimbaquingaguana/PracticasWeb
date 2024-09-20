import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CmdWindow({ port }) {
  const [inputCommand, setInputCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState('C:\\'); 
  const [ncatRunning, setNcatRunning] = useState(false);
  const [message, setMessage] = useState(''); // Estado para mensajes

  useEffect(() => {
    const startNcat = async () => {
      try {
        const response = await axios.post('http://localhost:5000/execute-command', {
          command: `ncat -nlvp ${port}`,
        });
        setNcatRunning(true);
        setCommandHistory((prev) => [...prev, response.data.output]);
        setMessage(response.data.output); // Establecer mensaje de éxito
      } catch (error) {
        setCommandHistory((prev) => [...prev, `Error al iniciar ncat: ${error.message}`]);
      }
    };

    startNcat();
  }, [port]);

  const handleInputChange = (event) => {
    setInputCommand(event.target.value);
  };

  const handleExecuteCommand = async (event) => {
    if (event.key === 'Enter') {
      const command = inputCommand.trim();
      setCommandHistory((prev) => [...prev, `${currentDirectory}> ${command}`]);
      setInputCommand('');

      try {
        const response = await axios.post('http://localhost:5000/execute-command', {
          command: command,
        });
        setCommandHistory((prev) => [...prev, response.data.output]);
      } catch (error) {
        const errorMessage = error.response ? error.response.data.error : error.message;
        setCommandHistory((prev) => [...prev, `Error: ${errorMessage}`]);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', padding: '20px', backgroundColor: '#f0f0f0' }}></div>
      <div style={{ flex: 1, backgroundColor: '#000', color: '#fff', padding: '20px', overflowY: 'auto' }}>
        <pre>
          {`${currentDirectory}\n`}
          {commandHistory.map((cmd, index) => (
            <div key={index}>{cmd}</div>
          ))}
          <div>
            <span>{`${currentDirectory}> `}</span>
            <input
              type="text"
              value={inputCommand}
              onChange={handleInputChange}
              onKeyPress={handleExecuteCommand}
              style={{ width: '80%', backgroundColor: 'black', color: 'white', border: 'none', outline: 'none' }}
            />
          </div>
          {message && <div style={{ color: 'green' }}>{message}</div>} {/* Mostrar el mensaje */}
        </pre>
      </div>
    </div>
  );
}

export default CmdWindow;
