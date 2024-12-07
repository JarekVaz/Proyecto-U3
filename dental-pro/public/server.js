const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware para permitir solicitudes desde el cliente
app.use(cors());
app.use(bodyParser.json());
// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: "localhost",       // Cambia si tu base de datos está en un servidor diferente
  user: "root",            // Tu usuario de MySQL
  password: "",            // La contraseña de tu usuario de MySQL
  database: 'plataformamedica' // Nombre de la base de datos
});

// Conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conexión exitosa a la base de datos MySQL");
});




// Ruta para autenticar administradores------------------------------------------------------------
app.post("/api/login", express.json(), (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  // Consulta a la base de datos
  const query = "SELECT * FROM administradores WHERE nombre_usuario = ?";
  db.query(query, [nombre_usuario], (err, results) => {
    if (err) {
      console.error("Error al consultar la base de datos:", err);
      return res.status(500).json({ error: "Error del servidor" });
    }

    if (results.length === 0) {
      // Usuario no encontrado
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const admin = results[0];
    if (admin.contrasena !== contrasena) {
      // Contraseña incorrecta
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Autenticación exitosa
    res.status(200).json({ message: "Autenticación exitosa" });
  });
});







// Ruta para obtener los datos de la tabla "medicamentos"
app.get("/api/medicamentos", (req, res) => {
  const query = "SELECT * FROM medicamentos";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      res.status(500).send("Error al obtener datos de la base de datos");
    } else {
      res.json(results); // Devuelve los resultados en formato JSON
    }
  });
});

// Ruta para obtener los datos de la tabla "tiposcancer"
app.get("/api/tiposcancer", (req, res) => {
  const query = "SELECT * FROM tiposcancer";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      res.status(500).send("Error al obtener datos de la base de datos");
    } else {
      res.json(results); // Devuelve los resultados en formato JSON
    }
  });
});

// Ruta para obtener detalles de un tipo de cáncer
app.get("/api/tiposcancer/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM tiposcancer WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener detalles del tipo de cáncer:", err);
      return res.status(500).send("Error al obtener datos de la base de datos");
    }
    if (results.length > 0) {
      const tipo = {
        ...results[0],
        imagen: results[0].imagen
          ? `/images/t-cancer/${results[0].imagen}`
          : `/images/t-cancer/default.jpg`,
      };
      res.json(tipo);
    } else {
      res.status(404).send("Tipo de cáncer no encontrado");
    }
  });
});

// Ruta para obtener medicamentos relacionados con un tipo de cáncer
app.get("/api/tiposcancer/:id/medicamentos", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM medicamentos WHERE tipo_cancer_id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener medicamentos:", err);
      return res.status(500).send("Error al obtener datos de la base de datos");
    }
    res.json(results);
  });
});

// Ruta para servir imágenes directamente (opcional si ya usas 'express.static')
app.get("/images/t-cancer/:imagen", (req, res) => {
  const { imagen } = req.params;
  const rutaImagen = path.join(__dirname, "public", "images", "t-cancer", imagen);
  res.sendFile(rutaImagen, (err) => {
    if (err) {
      console.error("Error al enviar la imagen:", err);
      res.status(404).send("Imagen no encontrada");
    }
  });
});


// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});