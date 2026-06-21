const User = require('./user');
const Dam = require('./Dam');
const DamReading = require('./DamReading');
const Alert = require('./Alert');
const AuditLog = require('./AuditLog');

// User associations
User.hasMany(DamReading, { foreignKey: 'created_by' });
User.hasMany(AuditLog, { foreignKey: 'user_id' });

// Dam associations
Dam.hasMany(DamReading, { foreignKey: 'dam_id' });
Dam.hasOne(Alert, { foreignKey: 'dam_id' });
Dam.hasMany(AuditLog, { foreignKey: 'dam_id' });

// DamReading associations
DamReading.belongsTo(Dam, { foreignKey: 'dam_id' });
DamReading.belongsTo(User, { foreignKey: 'created_by' });

// Alert associations
Alert.belongsTo(Dam, { foreignKey: 'dam_id' });
Alert.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Alert.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
AuditLog.belongsTo(Dam, { foreignKey: 'dam_id' });

module.exports = { User, Dam, DamReading, Alert, AuditLog };