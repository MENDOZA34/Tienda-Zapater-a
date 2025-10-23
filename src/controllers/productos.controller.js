// src/controllers/productos.controller.js
const pool = require('../db');

// LISTAR PRODUCTOS (con fondo "page-products")
exports.index = async (req, res, next) => {
  try {
    const { q, cat } = req.query;

    let sql = `SELECT p.*, c.nombre AS categoria
               FROM productos p
               LEFT JOIN categorias c ON c.id = p.categoria_id`;
    const args = [];
    const cond = [];

    if (q)  { cond.push('p.titulo LIKE ?'); args.push('%' + q + '%'); }
    if (cat){ cond.push('c.id = ?');        args.push(cat); }

    if (cond.length) sql += ' WHERE ' + cond.join(' AND ');
    sql += ' ORDER BY p.id DESC';

    const [rows] = await pool.query(sql, args);
    const [cats] = await pool.query('SELECT * FROM categorias ORDER BY nombre');

    res.render('productos/index', {
      title: 'Productos',
      productos: rows,
      categorias: cats,
      q, cat,
      page: 'page-products' // <- para el fondo "agua" en CSS
    });
  } catch (e) { next(e); }
};

// DETALLE
exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).send('No existe');
    res.render('productos/show', { title: rows[0].titulo, p: rows[0] });
  } catch (e) { next(e); }
};

// AÑADIR AL CARRITO (usa :id de la URL y corrige "const" -> "let")
exports.addToCart = async (req, res, next) => {
  try {
    let pid = req.params.id;                       // usar id de la URL
    const quantity = Number(req.body.quantity || 1);

    // fallback si también envías hidden
    if (!pid && req.body.producto_id) pid = req.body.producto_id;

    if (!req.session.user) {
      return res.redirect('/usuarios/login?next=' + encodeURIComponent(req.originalUrl));
    }

    // obtener/crear carrito
    let [c] = await pool.query('SELECT id FROM carritos WHERE usuario_id=?', [req.session.user.id]);
    let carId = c[0]?.id;                          // OJO: let (no const) porque podemos crearlo
    if (!carId) {
      const [nc] = await pool.query('INSERT INTO carritos (usuario_id) VALUES (?)', [req.session.user.id]);
      carId = nc.insertId;
    }

    // insertar/actualizar item
    const [ex] = await pool.query(
      'SELECT id, quantity FROM carrito_items WHERE carrito_id=? AND producto_id=?',
      [carId, pid]
    );
    if (ex.length) {
      await pool.query('UPDATE carrito_items SET quantity=? WHERE id=?', [ex[0].quantity + quantity, ex[0].id]);
    } else {
      await pool.query('INSERT INTO carrito_items (carrito_id, producto_id, quantity) VALUES (?,?,?)', [carId, pid, quantity]);
    }

    res.redirect('/procesos');
  } catch (e) { next(e); }
};

// FAVORITOS (sin usar "back" inseguro)
exports.toggleFavorito = async (req, res, next) => {
  try {
    const uid = req.session.user.id;
    const pid = req.params.id;
    const [ex] = await pool.query('SELECT id FROM favoritos WHERE usuario_id=? AND producto_id=?', [uid, pid]);
    if (ex.length) {
      await pool.query('DELETE FROM favoritos WHERE id=?', [ex[0].id]);
    } else {
      await pool.query('INSERT INTO favoritos (usuario_id, producto_id) VALUES (?,?)', [uid, pid]);
    }
    const back = req.get('Referrer') || '/productos';
    res.redirect(back);
  } catch (e) { next(e); }
};
