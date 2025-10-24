// src/controllers/procesos.controller.js
const pool = require('../db');

// ===== Carrito (ver) =====
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

    const [items] = await pool.query(
      `
      SELECT ci.id, ci.quantity, p.titulo, p.precio, p.imagen_url, p.id AS producto_id
      FROM carrito_items ci
      JOIN productos p ON p.id = ci.producto_id
      WHERE ci.carrito_id = ?
      `,
      [carId]
    );

    const total = items.reduce(
      (s, i) => s + Number(i.precio) * Number(i.quantity),
      0
    );

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

// ===== Finalizar compra =====
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

    // 2) Copiar items del carrito a pedido_items (si la tabla no existe, crearla)
    const [[car]] = await pool.query(
      'SELECT id FROM carritos WHERE usuario_id = ?',
      [uid]
    );

    if (car) {
      const carId = car.id;

      const [itemsCarrito] = await pool.query(
        `
        SELECT ci.quantity, p.id AS producto_id, p.titulo, p.precio
        FROM carrito_items ci
        JOIN productos p ON p.id = ci.producto_id
        WHERE ci.carrito_id = ?
        `,
        [carId]
      );

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

      for (const it of itemsCarrito) {
        await pool.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, titulo, precio, cantidad)
           VALUES (?,?,?,?,?)`,
          [pedidoId, it.producto_id, it.titulo, it.precio, it.quantity]
        );
      }

      // 3) Vaciar carrito
      await pool.query('DELETE FROM carrito_items WHERE carrito_id = ?', [carId]);
    }

    // 4) Leer pedido e items para el recibo
    const [[pedidoRow]] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);

    // Normaliza el nombre de la columna de fecha para la vista: siempre 'created_at'
    const pedido = {
      ...pedidoRow,
      created_at: pedidoRow.created_at || pedidoRow.creado_en || new Date()
    };

    const [detalleItems] = await pool.query(
      `SELECT titulo, precio, cantidad FROM pedido_items WHERE pedido_id = ?`,
      [pedidoId]
    );

    return res.render('procesos/recibo', {
      title: 'Recibo',
      page: 'page-cart',
      pedido,
      items: detalleItems
    });

    // Si prefieres ir directo al reporte:
    // return res.redirect('/procesos/reporte');
  } catch (e) {
    console.error('Error en checkout:', e);
    next(e);
  }
};

// ===== Reporte por fecha =====
// Tolera que la BD tenga 'created_at' o 'creado_en'
exports.reporte = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;

    // Detecta qué columna de fecha existe
    const [cols] = await pool.query(`SHOW COLUMNS FROM pedidos LIKE 'created_at'`);
    const fechaCol = cols.length ? 'created_at' : 'creado_en';

    let sql = `SELECT * FROM pedidos WHERE 1=1`;
    const args = [];

    if (desde) { sql += ` AND DATE(${fechaCol}) >= ?`; args.push(desde); }
    if (hasta) { sql += ` AND DATE(${fechaCol}) <= ?`; args.push(hasta); }

    sql += ` ORDER BY ${fechaCol} DESC`;

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
