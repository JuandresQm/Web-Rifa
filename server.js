const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const path = require('path');
const app = express();
const fs = require('fs');
const ExcelJS = require('exceljs');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/'));


app.get('/', function (req, res) {
  const configuracionPath = 'configuracion.txt';
  const configuracion = fs.readFileSync(configuracionPath, 'utf8');
  const size = parseInt(configuracion.trim().split('=')[1]);

  const sql = "SELECT * FROM datos";
  db.all(sql, [], (errDatos, rowsDatos) => {
    if (errDatos) {
      return console.error(errDatos.message);
    } else {
      const count = req.query.count;
      res.render("inicio", { datos: rowsDatos, count: count, size: size });
    }
  });
});
app.get('/guardar/:count', function (req, res) {
  const sql = "SELECT * FROM datos";
  db.all(sql, [], (errDatos, rowsDatos) => {
    if (errDatos) {
      return console.error(errDatos.message);
    } else {
      const count = req.params.count;

      const countExists = rowsDatos.some(row => {
        return row.numero === parseInt(count);
      });
      if (countExists) {
        res.render("vista", { datos: rowsDatos, count: count });
      } else {
        res.render("guardar", { datos: rowsDatos, count: count });
      }
    }
  });
});
app.post('/guardar', (req, res) => {
  const sql = "INSERT INTO datos (nombre, cedula, telefono, residencia, numero) VALUES (?,?,?,?,?)";
  const count = req.body.numero;
  const numeros = count.split("-");
  
  numeros.forEach(numero => {
    const nuevo = [req.body.nombre, req.body.cedula, req.body.telefono, req.body.residencia, numero];
    db.run(sql, nuevo, err => {
      if (err) {
        return console.error(err.message);
      }
    });
  });

  res.redirect('/');
});
app.get('/editar/:count', (req, res) => {
  const count = req.params.count;
  const sql = "SELECT * FROM datos";
  db.all(sql, [], (err, rowsDatos) => {
    if (err) {
      return console.error(err.message);
    } else {
      const filteredDatos = rowsDatos.filter(row => row.numero === parseInt(count));
      if (filteredDatos.length > 0) {
        res.render("editar", { datos: filteredDatos, count: count });
      } else {
        res.redirect('/');
      }
    }
  });
});

app.post('/editar/:count', (req, res) => {
  const count = req.params.count;
  const nuevo = [req.body.nombre, req.body.cedula, req.body.telefono, req.body.residencia, count];
  const sql = "UPDATE datos SET nombre=?, cedula=?, telefono=?, residencia=? WHERE numero=?";
  db.run(sql, nuevo, err => {
    if (err) {
      return console.error(err.message);
    } else {
      res.redirect('/');
    }
  });
});
app.get('/eliminar/:count', (req, res) => {
  const count = req.params.count;
    const sql="DELETE FROM datos where numero=?";
    db.run(sql, count, err => {
      if (err) {
        return console.error(err.message);
      } else {
        res.redirect("/");
      }
    })
   });
   app.get('/exportar-excel', (req, res) => {
    const query = 'SELECT * FROM datos';
    db.all(query, (error, rows) => {
      if (error) {
        console.error('Error al consultar los datos:', error);
        res.status(500).send('Ocurrió un error al consultar los datos');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Datos');
  
      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Cédula', key: 'cedula', width: 10 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Residencia', key: 'residencia', width: 20 },
        { header: 'Número', key: 'numero', width: 6 },
      ];

      rows.forEach((row) => {
        worksheet.addRow(row);
      });
      const tempFilePath = `${__dirname}/temp.xlsx`;

      workbook.xlsx.writeFile(tempFilePath)
        .then(() => {
          res.sendFile(tempFilePath, () => {
            fs.unlinkSync(tempFilePath);
          });
        })
        .catch((error) => {
          console.error('Error al exportar a Excel:', error);
          res.status(500).send('Ocurrió un error al exportar a Excel');
        });
        
    });
  });
  app.get('/configuracion', (req, res) => {
    const configuracionPath = 'configuracion.txt';
    const configuracion = fs.readFileSync(configuracionPath, 'utf8');
    const size = parseInt(configuracion.trim().split('=')[1]);
  
    const primerNumero = Math.floor(Math.random() * (size * 25)) + 1;
  
    db.all('SELECT numero from datos', function(err, rows) {
      if (err) {
        return console.error(err.message);
      } else {
        let segundoNumero;
        if (rows.length === 0) {
          segundoNumero = 0;
        } else {
          const indiceAleatorio = Math.floor(Math.random() * rows.length);
          segundoNumero = rows[indiceAleatorio].numero;
        }
  
        res.render('configuracion', { size, datos: rows, primerNumero, segundoNumero });
      }
    });
  });
     app.post('/restablecer', (req, res) => {
      const sql="DROP TABLE datos";
      db.run(sql, err => {
        if (err) {
          return console.error(err.message);
        } else {
          db.run(` CREATE TABLE datos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            cedula Text,
            telefono INTEGER,
            residencia text,
            numero integer UNIQUE
        )`);
          res.redirect("/");
        }
      })
     
       });
     app.get('/participantes', function(req, res) {
      db.all('SELECT nombre, cedula, GROUP_CONCAT(numero) as numeros_comprados, COUNT(*) as cantidad_numeros FROM datos GROUP BY nombre, cedula', function(err, rows) {
        if (err) {
          console.error(err);
          res.status(500).send('Error en el servidor');
        } else {
          res.render('participantes', { datos: rows });
        }
      });
    });
    app.post('/cambiartamano', function (req, res) {
      const nuevoSize = req.body.size;
      const configuracionPath = 'configuracion.txt';
      const configuracionContenido = fs.readFileSync(configuracionPath, 'utf8');
      const configuracionActualizada = configuracionContenido.replace(/size=\d+/, `size=${nuevoSize}`);
      fs.writeFileSync(configuracionPath, configuracionActualizada);
    
      res.redirect('/');
    });
   app.get('/*', (req, res) => {
    res.redirect('/');
     });
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
const basededatos = path.join(__dirname, "db", "base.db");
const db = new sqlite3.Database(basededatos, err =>{
    if (err) {
        return console.error(err.message);
    } else {
        console.log("Online Database")
    }
})
db.run(` CREATE TABLE IF NOT EXISTS datos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    cedula Text,
    telefono INTEGER,
    residencia text,
    numero integer UNIQUE
)`);
