const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DamReading = sequelize.define('DamReading', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dam_id: { type: DataTypes.INTEGER, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  reading_time: { type: DataTypes.TIME, allowNull: false },
  water_level: { type: DataTypes.FLOAT, allowNull: false },
  inflow: { type: DataTypes.FLOAT, allowNull: false },
  outflow: { type: DataTypes.FLOAT, allowNull: false },
  rainfall: { type: DataTypes.FLOAT, allowNull: false },
  storage_volume: { type: DataTypes.FLOAT },
  percent_filled: { type: DataTypes.FLOAT },
  net_flow: { type: DataTypes.FLOAT },
  trend: { type: DataTypes.FLOAT },
  alert_level: { type: DataTypes.ENUM('GREEN', 'YELLOW', 'ORANGE', 'RED') },
  remarks: { type: DataTypes.TEXT },
  photo_url: { type: DataTypes.STRING(255) },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'dam_readings', timestamps: false });

module.exports = DamReading;