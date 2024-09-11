const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

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
app.post('/generate-script', (req, res) => {
  const { ip, port } = req.body;

  if (!ip || !port) {
    return res.status(400).json({ error: 'IP and port are required' });
  }

  const templatePath = path.join(__dirname, 'template.ps1');
  
  // Validar existencia del archivo template
  if (!fs.existsSync(templatePath)) {
    return res.status(500).json({ error: 'Template file not found' });
  }

  fs.readFile(templatePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading template file' });
    }

    // Reemplazar los marcadores de posición en el script
    let modifiedScript = data.replace(/__IP__/g, ip);
    modifiedScript = modifiedScript.replace(/__PORT__/g, port);

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

        // Enviar el archivo como descarga
        res.download(generatedPath, filename, (err) => {
          if (err) {
            console.error('Error sending file:', err);
          }
          // Elimina el archivo después de enviarlo
          fs.unlink(generatedPath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      });
    });
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
