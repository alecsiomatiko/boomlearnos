CREATE TABLE IF NOT EXISTS daily_checkins (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  checkin_date DATE NOT NULL,
  energy_level INT NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  priority_focus TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, checkin_date)
);