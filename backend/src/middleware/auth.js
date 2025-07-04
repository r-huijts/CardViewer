const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

module.exports = { requireAuth };