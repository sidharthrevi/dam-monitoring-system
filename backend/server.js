const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
require('./models/index');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dams', require('./routes/dams'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/audit-logs', require('./routes/auditLogs'));

// Test route
app.get('/', (req, res) => res.json({ message: 'Dam Monitoring API running' }));

// Start server
const PORT = process.env.PORT || 5000;
sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));