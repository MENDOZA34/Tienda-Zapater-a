module.exports = function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/usuarios/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
};
