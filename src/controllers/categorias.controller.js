// ===============================
// src/controllers/categorias.controller.js
// ===============================
const pool = require('../db');

// LISTAR TODAS LAS CATEGORÍAS
exports.index = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.render('categorias/index', { 
      title: 'Categorías', 
      categorias: rows,
      page: 'page-category' // fondo visual “agua”
    });
  } catch (e) { next(e); }
};

// FORMULARIO PARA CREAR UNA NUEVA CATEGORÍA
exports.createForm = (req, res) => {
  res.render('categorias/create', { 
    title: 'Crear categoría',
    page: 'page-category'
  });
};

// GUARDAR UNA NUEVA CATEGORÍA EN LA BASE DE DATOS
exports.store = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).send('Nombre requerido');
    await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
    res.redirect('/categorias');
  } catch (e) { next(e); }
};

// MOSTRAR UNA CATEGORÍA Y SUS PRODUCTOS
exports.show = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [[categoria]] = await pool.query('SELECT * FROM categorias WHERE id=?', [id]);
    if (!categoria) return res.status(404).send('Categoría no encontrada');

    const [productos] = await pool.query(
      `SELECT p.* FROM productos p WHERE p.categoria_id=? ORDER BY p.id DESC`, [id]
    );

    res.render('categorias/show', { 
      title: categoria.nombre, 
      categoria, 
      productos,
      page: 'page-category'
    });
  } catch (e) { next(e); }
};
