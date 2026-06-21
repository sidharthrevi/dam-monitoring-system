const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  dam_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE }
}, { 
  tableName: 'audit_logs', 
  timestamps: false
});

module.exports = AuditLog;