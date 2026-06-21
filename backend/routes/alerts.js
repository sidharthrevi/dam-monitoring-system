const express = require('express');
const { Alert,AuditLog } = require('../models');
const { verifyToken, allowRoles } = require('../middleware/auth');
const router = express.Router();

// GET /api/alerts — get all alert configs
router.get('/', verifyToken, async (req, res) => {
  try {
    const alerts = await Alert.findAll();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/alerts/:dam_id — get alert config for a dam
router.get('/:dam_id', verifyToken, async (req, res) => {
  try {
    const alert = await Alert.findOne({ 
      where: { dam_id: req.params.dam_id } 
    });
    if (!alert) return res.status(404).json({ message: 'Alert config not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/alerts/:dam_id — update alert thresholds (admin only)
router.put('/:dam_id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const { green_max_percent, yellow_max_percent, orange_max_percent, red_min_percent } = req.body;
    
    await Alert.update(
      { 
        green_max_percent, 
        yellow_max_percent, 
        orange_max_percent, 
        red_min_percent,
        updated_by: req.user.id 
      },
      { where: { dam_id: req.params.dam_id } }
    );

    await AuditLog.create({
      user_id: req.user.id,
      dam_id: parseInt(req.params.dam_id),
      action: 'UPDATE_ALERT',
      description: `Updated alert config — Green: ${green_max_percent}%, Yellow: ${yellow_max_percent}%, Orange: ${orange_max_percent}%, Red: ${red_min_percent}%`
    });

    res.json({ message: 'Alert config updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;