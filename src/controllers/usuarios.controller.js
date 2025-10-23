const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.index = async (req,res) => {
  const [rows] = await pool.query('SELECT id,nombre,email,role FROM usuarios ORDER BY id DESC');
  res.render('usuarios/index', { title:'Usuarios', usuarios: rows });
};

exports.loginForm = (req,res)=> res.render('usuarios/login', { title:'Iniciar sesión' });
exports.registerForm = (req,res)=> res.render('usuarios/register', { title:'Crear cuenta' });

exports.register = async (req,res,next)=>{
  try{
    const { nombre, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query('INSERT INTO usuarios (nombre,email,password_hash) VALUES (?,?,?)',[nombre,email,hash]);
    // crea carrito por usuario
    await pool.query('INSERT INTO carritos (usuario_id) VALUES (?)',[r.insertId]);
    req.session.user = { id: r.insertId, nombre, email, role: 'cliente' };
    res.redirect('/');
  }catch(e){ next(e); }
};

exports.login = async (req,res,next)=>{
  try{
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email=?',[email]);
    if (!rows.length) return res.render('usuarios/login', { title:'Iniciar sesión', error:'Credenciales inválidas' });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.render('usuarios/login', { title:'Iniciar sesión', error:'Credenciales inválidas' });
    req.session.user = { id: rows[0].id, nombre: rows[0].nombre, email: rows[0].email, role: rows[0].role };
    res.redirect(req.query.next || '/');
  }catch(e){ next(e); }
};

exports.logout = (req,res)=> { req.session.destroy(()=> res.redirect('/')); };

exports.perfil = async (req,res,next)=>{
  try{
    const [fav] = await pool.query(
      `SELECT p.* FROM favoritos f JOIN productos p ON p.id=f.producto_id WHERE f.usuario_id=?`,
      [req.session.user.id]
    );
    res.render('usuarios/perfil', { title:'Mi perfil', favoritos: fav });
  }catch(e){ next(e); }
};
