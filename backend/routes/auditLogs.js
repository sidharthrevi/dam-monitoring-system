const express = require('express');
const { AuditLog, User, Dam } = require('../models');
const { verifyToken, allowRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: User, attributes: ['full_name'] },
        { model: Dam, attributes: ['name'] }
      ],
      order: [['id', 'DESC']],
      limit: 200
    });
    res.json(logs);
  } catch (err) {
    console.error('Audit log error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;