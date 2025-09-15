const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkOwnership = (model) => async (req, res, next) => {
  try {
    const doc = await model.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (!doc.user.equals(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.doc = doc;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = checkOwnership;