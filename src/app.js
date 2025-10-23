// src/app.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const layouts = require('express-ejs-layouts');

const app = express();

// ESTÁTICOS + PARSERS

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// VISTAS (EJS + LAYOUTS)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(layouts);
app.set('layout', 'layouts/main'); // usa views/layouts/main.ejs


// SESIONES

app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secreto_largo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 días
}));

// VARIABLES GLOBALES PARA LAS VISTAS

// Con esto 'user' y 'page' SIEMPRE existen en EJS (evita errores del layout)

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.page = ''; // <-- valor por defecto para el <body class="<%= page %>">
  next();
});

// RUTAS

app.use('/', require('./routes/main.routes'));
app.use('/productos', require('./routes/productos.routes'));
app.use('/categorias', require('./routes/categorias.routes'));
app.use('/usuarios', require('./routes/usuarios.routes'));
app.use('/inventario', require('./routes/inventario.routes'));
app.use('/procesos', require('./routes/procesos.routes'));


// ERRORES 404 Y 500

app.use((req, res) => {
  
  // Si quieres, puedes renderizar una vista 404.ejs en lugar de texto
  res.status(404).send('Página no encontrada 😢');
});

app.use((err, req, res, next) => {
  console.error('Error en servidor:', err);
  res.status(500).send('Error interno del servidor');
});

// ARRANQUE DEL SERVIDOR

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
