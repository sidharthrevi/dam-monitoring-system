const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dam_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  green_max_percent: { type: DataTypes.FLOAT, defaultValue: 75 },
  yellow_max_percent: { type: DataTypes.FLOAT, defaultValue: 90 },
  orange_max_percent: { type: DataTypes.FLOAT, defaultValue: 95 },
  red_min_percent: { type: DataTypes.FLOAT, defaultValue: 95 },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  updated_by: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
}, { 
  tableName: 'alerts', 
  timestamps: false
});

module.exports = Alert;