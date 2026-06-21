const express = require('express');
const { DamReading, Dam, Alert, User, AuditLog } = require('../models');
const { verifyToken, allowRoles } = require('../middleware/auth');
const { calcPercentFilled, calcNetFlow, calcTrend, calcAlertLevel } = require('../helpers/calculators');
const router = express.Router();

// GET /api/readings?dam_id=1 — get readings for a dam
// GET /api/readings?dam_id=1 — get readings for a dam (public)
// GET /api/readings?dam_id=1 — get readings for a dam (public)
router.get('/', async (req, res) => {
  try {
    const where = req.query.dam_id ? { dam_id: req.query.dam_id } : {};
    where.deleted_at = null;
    const readings = await DamReading.findAll({
      where,
      include: [{ model: User, attributes: ['full_name'] }],
      order: [['date', 'DESC'],['reading_time', 'DESC']],
    });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/readings/latest?dam_id=1 — get latest reading for a dam
// GET /api/readings/latest?dam_id=1 — get latest reading (public)

router.get('/latest', async (req, res) => {
  try {
    const where = req.query.dam_id ? { dam_id: req.query.dam_id } : {};
    where.deleted_at = null;
    const reading = await DamReading.findOne({
      where,
      order: [['date', 'DESC'],['reading_time', 'DESC']],
    });
    res.json(reading);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/readings — add reading (admin, operator)
router.post('/', verifyToken, allowRoles('admin', 'operator'), async (req, res) => {
  try {
    const { dam_id, date, reading_time, water_level, inflow, outflow, rainfall } = req.body;
    console.log('Received data:', { dam_id, date, reading_time, water_level });
const storage_volume = req.body.storage_volume !== '' ? req.body.storage_volume : null;
const remarks = req.body.remarks !== '' ? req.body.remarks : null;

    const dam = await Dam.findByPk(dam_id);
    if (!dam) return res.status(404).json({ message: 'Dam not found' });
   // Check negative values
if (parseFloat(inflow) < 0)
  return res.status(400).json({ message: 'Inflow cannot be negative' });
if (parseFloat(outflow) < 0)
  return res.status(400).json({ message: 'Outflow cannot be negative' });
if (parseFloat(rainfall) < 0)
  return res.status(400).json({ message: 'Rainfall cannot be negative' });
if (storage_volume && parseFloat(storage_volume) < 0)
  return res.status(400).json({ message: 'Storage volume cannot be negative' });

// Check water level range

if (parseFloat(water_level) > dam.frl) {
  return res.status(400).json({ 
    message: `Water level cannot exceed FRL (${dam.frl})` 
  });
}

    const alertConfig = await Alert.findOne({ where: { dam_id } });
    if (!alertConfig) return res.status(404).json({ message: 'Alert config not found' });

    const percent_filled = calcPercentFilled(water_level, dam.frl);
    const net_flow = calcNetFlow(inflow, outflow);

    // Get previous reading for trend
    // Get all previous readings for this dam ordered by date and time
const previous = await DamReading.findOne({
  where: {
    dam_id,
    deleted_at: null,
    id: { [require('sequelize').Op.ne]: 0 }
  },
  order: [['date', 'DESC'], ['reading_time', 'DESC']],
  limit: 1
});

// Only use previous if it's actually before current reading
let trend = 0;
if (previous) {
  const prevDateTime = new Date(`${previous.date}T${previous.reading_time}`);
  const currDateTime = new Date(`${date}T${reading_time}`);
  if (prevDateTime < currDateTime) {
    trend = calcTrend(water_level, previous.water_level);
  }
}
console.log('Previous:', previous ? `${previous.date} ${previous.reading_time} WL:${previous.water_level}` : null);
console.log('Trend:', trend);

    const alert_level = calcAlertLevel(percent_filled, alertConfig, rainfall, inflow);

    const reading = await DamReading.create({
      dam_id,
      created_by: req.user.id, 
      date,
      reading_time,
      water_level, 
      inflow, 
      outflow, 
      rainfall,
      storage_volume, 
      percent_filled, 
      net_flow,
      trend, 
      alert_level, 
      remarks,
    });

    // Log the action
    // Log the action
    // Log the action
    try {
      await AuditLog.create({
        user_id: req.user.id,
        dam_id: parseInt(dam_id),
        action: 'CREATE_READING',
        description: `Added reading for ${date} — Water Level: ${water_level}, Alert: ${alert_level}`
      });
      console.log('Audit log created successfully');
    } catch (auditErr) {
      console.error('Audit log failed:', auditErr.message);
    }

    res.status(201).json(reading);
  } catch (err) {
    console.error('Reading error full:', JSON.stringify(err, null, 2));
    console.error('Reading error message:', err.message);
    console.error('Reading error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message, details: err.stack });
  }
});

// PUT /api/readings/:id — edit reading (admin only)
// PUT /api/readings/:id — edit reading (admin only)
router.put('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    console.log('Edit reading request:', req.params.id, req.body);
    const { date, reading_time, water_level, inflow, outflow, rainfall } = req.body;
    const storage_volume = req.body.storage_volume !== '' ? req.body.storage_volume : null;
    const remarks = req.body.remarks !== '' ? req.body.remarks : null;
    const reading = await DamReading.findByPk(req.params.id);
    if (!reading) return res.status(404).json({ message: 'Reading not found' });
    const dam = await Dam.findByPk(reading.dam_id);
    const alertConfig = await Alert.findOne({ where: { dam_id: reading.dam_id } });
    // Check negative values
if (parseFloat(inflow) < 0)
  return res.status(400).json({ message: 'Inflow cannot be negative' });
if (parseFloat(outflow) < 0)
  return res.status(400).json({ message: 'Outflow cannot be negative' });
if (parseFloat(rainfall) < 0)
  return res.status(400).json({ message: 'Rainfall cannot be negative' });
if (storage_volume && parseFloat(storage_volume) < 0)
  return res.status(400).json({ message: 'Storage volume cannot be negative' });
if (parseFloat(water_level) > dam.frl)
  return res.status(400).json({ message: `Water level cannot exceed FRL (${dam.frl})` });

    const percent_filled = calcPercentFilled(water_level, dam.frl);
    const net_flow = calcNetFlow(inflow, outflow);
    const alert_level = calcAlertLevel(percent_filled, alertConfig, rainfall, inflow);
    const previous = await DamReading.findOne({
      where: {
        dam_id: reading.dam_id,
        deleted_at: null,
        [require('sequelize').Op.or]: [
          { date: { [require('sequelize').Op.lt]: date } },
          {
            date: date,
            reading_time: { [require('sequelize').Op.lt]: reading_time }
          }
        ]
      },
      order: [['date', 'DESC'], ['reading_time', 'DESC']]
    });
    const trend = previous ? calcTrend(water_level, previous.water_level) : 0;

    await DamReading.update({
      date, reading_time, water_level, inflow, outflow,
      rainfall, storage_volume, remarks,
      percent_filled, net_flow, trend, alert_level
    }, { where: { id: req.params.id } });

    await AuditLog.create({
      user_id: req.user.id,
      dam_id: reading.dam_id,
      action: 'UPDATE_READING',
      description: `Updated reading ID: ${req.params.id} — Water Level: ${water_level}, Alert: ${alert_level}`
    });

    res.json({ message: 'Reading updated' });
  } catch (err) {
    console.error('Edit reading error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/readings/:id — delete reading (admin only)
// DELETE /api/readings/:id — soft delete (admin only)
// DELETE /api/readings/:id — soft delete (admin only)
router.delete('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    // First find the reading to get dam_id and date
    const reading = await DamReading.findByPk(req.params.id);
    if (!reading) return res.status(404).json({ message: 'Reading not found' });

    // Soft delete
    await DamReading.update(
      { deleted_at: new Date() },
      { where: { id: req.params.id } }
    );

    // Log with correct dam_id and date
    await AuditLog.create({
      user_id: req.user.id,
      dam_id: reading.dam_id,
      action: 'DELETE_READING',
      description: `Deleted reading for ${reading.date} — Water Level: ${reading.water_level}`
    });

    res.json({ message: 'Reading deleted' });
  } catch (err) {
    console.error('Delete reading error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;