-- Create and select the database
CREATE DATABASE IF NOT EXISTS dam_monitoring;
USE dam_monitoring;

-- ----------------------------
-- Table 1: USERS
-- ----------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table 2: DAMS
-- ----------------------------
CREATE TABLE dams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  frl FLOAT NOT NULL COMMENT 'Full Reservoir Level',
  mddl FLOAT NOT NULL COMMENT 'Minimum Draw Down Level',
  sluice_level FLOAT NOT NULL COMMENT 'Level at which shutters open',
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Table 3: ALERTS
-- ----------------------------
CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dam_id INT NOT NULL UNIQUE,
  green_max_percent FLOAT NOT NULL DEFAULT 75,
  yellow_max_percent FLOAT NOT NULL DEFAULT 90,
  orange_max_percent FLOAT NOT NULL DEFAULT 95,
  red_min_percent FLOAT NOT NULL DEFAULT 95,
  created_by INT NOT NULL,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dam_id) REFERENCES dams(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ----------------------------
-- Table 4: DAM_READINGS
-- ----------------------------
CREATE TABLE dam_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dam_id INT NOT NULL,
  created_by INT NOT NULL,
  date DATE NOT NULL,
  water_level FLOAT NOT NULL,
  inflow FLOAT NOT NULL,
  outflow FLOAT NOT NULL,
  rainfall FLOAT NOT NULL,
  storage_volume FLOAT,
  percent_filled FLOAT,
  net_flow FLOAT,
  trend FLOAT,
  alert_level ENUM('GREEN', 'YELLOW', 'ORANGE', 'RED'),
  remarks TEXT,
  photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_dam_date (dam_id, date),
  FOREIGN KEY (dam_id) REFERENCES dams(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ----------------------------
-- Table 5: AUDIT_LOGS
-- ----------------------------
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  dam_id INT,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (dam_id) REFERENCES dams(id)
);