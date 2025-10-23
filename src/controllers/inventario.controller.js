const pool = require('../db');

// Lista de productos como inventario
exports.index = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, titulo AS descripcion, precio, stock, imagen_url FROM productos ORDER BY id DESC'
    );
    res.render('inventario/index', { title: 'Inventario', inventario: rows });
  } catch (e) { next(e); }
};

// Formulario para crear "producto" rápido
exports.createForm = (req, res) => {
  res.render('inventario/create', { title: 'Crear producto (inventario)' });
};

// Guardar nuevo producto (mínimo: descripcion->titulo)
exports.store = async (req, res, next) => {
  try {
    const { descripcion } = req.body;
    if (!descripcion) return res.status(400).send('La descripción es requerida');

    // Defaults para no fallar con NOT NULLs
    const titulo = descripcion;
    const precio = 0.00;
    const stock = 0;
    const categoria_id = null;
    const imagen_url = null;
    const descripcionLarga = ''; // puedes usar la misma si gustas

    await pool.query(
      `INSERT INTO productos (categoria_id, titulo, descripcion, precio, stock, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [categoria_id, titulo, descripcionLarga, precio, stock, imagen_url]
    );

    res.redirect('/inventario');
  } catch (e) { next(e); }
};

// Detalle de un producto
exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, titulo AS descripcion, precio, stock, imagen_url FROM productos WHERE id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send('Producto no encontrado');
    const item = rows[0];
    res.render('inventario/show', { title: 'Detalle de producto', item });
  } catch (e) { next(e); }
};
