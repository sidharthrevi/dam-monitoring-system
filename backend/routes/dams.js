const express = require('express');
const { Dam, Alert, AuditLog } = require('../models');
const { verifyToken, allowRoles } = require('../middleware/auth');
const router = express.Router();

// GET /api/dams — all dams
// GET /api/dams — all dams (public)
router.get('/', async (req, res) => {
  try {
    const dams = await Dam.findAll({ 
      where: { is_active: true, deleted_at: null }, 
      include: [{ model: Alert }] 
    });
    res.json(dams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/dams/:id — single dam
// GET /api/dams/:id — single dam (public)
router.get('/:id', async (req, res) => {
  try {
    const dam = await Dam.findByPk(req.params.id, { 
      include: [{ model: Alert }]       
    });
    if (!dam) return res.status(404).json({ message: 'Dam not found' });
    res.json(dam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  } 
});

// POST /api/dams — add dam (admin only)
router.post('/', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const { name, location, frl, mddl, sluice_level, latitude, longitude } = req.body;

// Check negative or zero values
if (parseFloat(frl) <= 0)
  return res.status(400).json({ message: 'FRL must be greater than 0' });
if (parseFloat(mddl) <= 0)
  return res.status(400).json({ message: 'MDDL must be greater than 0' });
if (parseFloat(sluice_level) <= 0)
  return res.status(400).json({ message: 'Sluice level must be greater than 0' });

// Check logical order
if (parseFloat(mddl) >= parseFloat(frl))
  return res.status(400).json({ message: 'MDDL must be less than FRL' });
if (parseFloat(sluice_level) >= parseFloat(frl))
  return res.status(400).json({ message: 'Sluice level must be less than FRL' });
if (parseFloat(sluice_level) < parseFloat(mddl))
  return res.status(400).json({ message: 'Sluice level must be greater than or equal to MDDL' });
    const dam = await Dam.create(req.body);
    // Create default alert config for this dam
    await Alert.create({ dam_id: dam.id, created_by: req.user.id });
    await AuditLog.create({
      user_id: req.user.id,
      dam_id: dam.id,
      action: 'CREATE_DAM',
      description: `Added new dam: ${dam.name}`
    });
    res.status(201).json(dam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/dams/:id — update dam (admin only)
router.put('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const { frl, mddl, sluice_level } = req.body;

if (frl !== undefined && parseFloat(frl) <= 0)
  return res.status(400).json({ message: 'FRL must be greater than 0' });
if (mddl !== undefined && parseFloat(mddl) <= 0)
  return res.status(400).json({ message: 'MDDL must be greater than 0' });
if (sluice_level !== undefined && parseFloat(sluice_level) <= 0)
  return res.status(400).json({ message: 'Sluice level must be greater than 0' });
if (frl && mddl && parseFloat(mddl) >= parseFloat(frl))
  return res.status(400).json({ message: 'MDDL must be less than FRL' });
if (frl && sluice_level && parseFloat(sluice_level) >= parseFloat(frl))
  return res.status(400).json({ message: 'Sluice level must be less than FRL' });
if (mddl && sluice_level && parseFloat(sluice_level) < parseFloat(mddl))
  return res.status(400).json({ message: 'Sluice level must be greater than or equal to MDDL' });
    await Dam.update(req.body, { where: { id: req.params.id } });
    await AuditLog.create({
      user_id: req.user.id,
      dam_id: req.params.id,
      action: 'UPDATE_DAM',
      description: `Updated dam ID: ${req.params.id}`
    });
    res.json({ message: 'Dam updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/dams/:id — soft delete (admin only)
router.delete('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const dam = await Dam.findByPk(req.params.id);
    if (!dam) return res.status(404).json({ message: 'Dam not found' });

    await Dam.update(
      { is_active: false, deleted_at: new Date() },
      { where: { id: req.params.id } }
    );

    await AuditLog.create({
      user_id: req.user.id,
      dam_id: req.params.id,
      action: 'DELETE_DAM',
      description: `Deleted dam: ${dam.name}`
    });
    res.json({ message: 'Dam deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;