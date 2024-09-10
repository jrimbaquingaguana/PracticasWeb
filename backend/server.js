const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Ruta para manejar la generación del script
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
