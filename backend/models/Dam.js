const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Dam = sequelize.define('Dam', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  location: { type: DataTypes.STRING(150), allowNull: false },
  frl: { type: DataTypes.FLOAT, allowNull: false },
  mddl: { type: DataTypes.FLOAT, allowNull: false },
  sluice_level: { type: DataTypes.FLOAT, allowNull: false },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'dams', timestamps: false });

module.exports = Dam;