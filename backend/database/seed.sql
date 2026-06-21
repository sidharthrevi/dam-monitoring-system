USE dam_monitoring;

-- Sample admin user (password: admin123)
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin01', '$2b$10$examplehashedpassword1', 'Admin User', 'admin'),
('operator01', '$2b$10$examplehashedpassword2', 'Field Operator', 'operator'),
('viewer01', '$2b$10$examplehashedpassword3', 'Authority Viewer', 'viewer');

-- Sample dams
INSERT INTO dams (name, location, frl, mddl, sluice_level, latitude, longitude) VALUES
('Idukki Dam', 'Idukki, Kerala', 2403.0, 2051.0, 2100.0, 9.8498, 76.9699),
('Banasura Sagar', 'Wayanad, Kerala', 775.0, 740.0, 745.0, 11.6854, 76.0366),
('Malampuzha', 'Palakkad, Kerala', 136.0, 97.5, 100.0, 10.8505, 76.6480),
('Peechi Dam', 'Thrissur, Kerala', 52.4, 28.0, 30.0, 10.5276, 76.3579);

-- Alert config for each dam
INSERT INTO alerts (dam_id, green_max_percent, yellow_max_percent, orange_max_percent, red_min_percent, created_by) VALUES
(1, 75, 90, 95, 95, 1),
(2, 75, 90, 95, 95, 1),
(3, 75, 90, 95, 95, 1),
(4, 75, 90, 95, 95, 1);

-- Sample readings for Idukki Dam
INSERT INTO dam_readings 
(dam_id, created_by, date, water_level, inflow, outflow, rainfall, storage_volume, percent_filled, net_flow, trend, alert_level)
VALUES
(1, 2, '2026-05-01', 2350.0, 38.0, 15.0, 45.0, 1800.0, 84.6, 23.0, 0, 'YELLOW'),
(1, 2, '2026-05-02', 2365.0, 40.0, 16.0, 50.0, 1850.0, 87.3, 24.0, 15.0, 'YELLOW'),
(1, 2, '2026-05-03', 2380.0, 42.0, 17.0, 55.0, 1900.0, 90.8, 25.0, 15.0, 'ORANGE'),
(1, 2, '2026-05-04', 2392.0, 44.0, 18.0, 60.0, 1950.0, 94.1, 26.0, 12.0, 'ORANGE'),
(1, 2, '2026-05-05', 2399.8, 42.5, 18.2, 62.0, 1996.0, 97.2, 24.3, 7.8, 'RED');
USE dam_monitoring;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM dams;
USE dam_monitoring;
SHOW TABLES;
USE dam_monitoring;
UPDATE users SET password_hash = '$2b$10$xK9Lm2N3pQ4rS5tU6vW7XeYzA1bC2dE3fG4hI5jK6lM7nO8pQ9rS0' WHERE username = 'admin01';
UPDATE users SET password_hash = '$2b$10$aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ' WHERE username = 'operator01';
UPDATE users SET password_hash = '$2b$10$mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV' WHERE username = 'viewer01';
SELECT username, password_hash FROM users;