// src/controllers/procesos.controller.js
const pool = require('../db');

// ==============================
// MOSTRAR CARRITO
// ==============================
exports.index = async (req, res, next) => {
  try {
    const [car] = await pool.query(
      'SELECT id FROM carritos WHERE usuario_id = ?',
      [req.session.user.id]
    );

    if (!car.length) {
      return res.render('procesos/index', {
        title: 'Carrito',
        items: [],
        total: 0,
        page: 'page-cart',
      });
    }

    const carId = car[0].id;

    const [items] = await pool.query(`
      SELECT ci.id, ci.quantity, p.titulo, p.precio, p.imagen_url, p.id AS producto_id
      FROM carrito_items ci
      JOIN productos p ON p.id = ci.producto_id
      WHERE ci.carrito_id = ?
    `, [carId]);

    const total = items.reduce((s, i) => s + Number(i.precio) * Number(i.quantity), 0);

    res.render('procesos/index', {
      title: 'Carrito',
      items,
      total,
      page: 'page-cart',
    });
  } catch (e) {
    next(e);
  }
};

// ==============================
// FINALIZAR COMPRA
// ==============================
exports.checkout = async (req, res, next) => {
  try {
    const uid = req.session.user.id;
    let { subtotal, iva, envio, total } = req.body;

    subtotal = Number(subtotal || 0);
    iva      = Number(iva || 0);
    envio    = Number(envio || 0);
    total    = Number(total || 0);

    // 1) Insertar pedido
    const [p] = await pool.query(
      `INSERT INTO pedidos (usuario_id, subtotal, iva, envio, total)
       VALUES (?,?,?,?,?)`,
      [uid, subtotal, iva, envio, total]
    );
    const pedidoId = p.insertId;

    // 2) Copiar items del carrito a pedido_items
    const [[car]] = await pool.query(
      'SELECT id FROM carritos WHERE usuario_id = ?',
      [uid]
    );

    if (car) {
      const carId = car.id;

      const [items] = await pool.query(`
        SELECT ci.quantity, p.id AS producto_id, p.titulo, p.precio
        FROM carrito_items ci
        JOIN productos p ON p.id = ci.producto_id
        WHERE ci.carrito_id = ?
      `, [carId]);

      // Crear tabla pedido_items si no existe
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pedido_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pedido_id INT NOT NULL,
          producto_id INT NOT NULL,
          titulo VARCHAR(150) NOT NULL,
          precio DECIMAL(10,2) NOT NULL,
          cantidad INT NOT NULL,
          FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        )
      `);

      for (const it of items) {
        await pool.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, titulo, precio, cantidad)
           VALUES (?,?,?,?,?)`,
          [pedidoId, it.producto_id, it.titulo, it.precio, it.quantity]
        );
      }

      // Vaciar carrito
      await pool.query('DELETE FROM carrito_items WHERE carrito_id = ?', [carId]);
    }

    // 3) Buscar pedido para mostrar el recibo
    const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    const pedido = rows[0] || {};
    // Normalizar la fecha (por si la columna es creado_en en vez de created_at)
    pedido.fecha = pedido.created_at || pedido.creado_en || new Date();

    return res.render('procesos/recibo', {
      title: 'Recibo',
      pedido,
      page: 'page-cart',
    });

  } catch (e) {
    console.error('Error en checkout:', e);
    next(e);
  }
};

// ==============================
// REPORTE DE PEDIDOS
// ==============================
exports.reporte = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    let sql = `SELECT * FROM pedidos WHERE 1=1`;
    const args = [];

    if (desde) { sql += ` AND DATE(created_at) >= ?`; args.push(desde); }
    if (hasta) { sql += ` AND DATE(created_at) <= ?`; args.push(hasta); }

    sql += ` ORDER BY created_at DESC`;

    const [pedidos] = await pool.query(sql, args);

    res.render('procesos/reporte', {
      title: 'Reporte',
      pedidos,
      desde: desde || '',
      hasta: hasta || '',
      page: 'page-cart',
    });
  } catch (e) {
    next(e);
  }
};
