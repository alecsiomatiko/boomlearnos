-- Create gems_history and daily_checkins tables for MySQL

-- Tabla de historial de gemas
CREATE TABLE IF NOT EXISTS gems_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id CHAR(36),
    gems_amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    calculation_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_gems_history_user_id (user_id)
);

-- Tabla de check-ins diarios
CREATE TABLE IF NOT EXISTS daily_checkins (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    checkin_date DATE NOT NULL,
    energy_level INTEGER NOT NULL,
    priority_focus TEXT,
    notes TEXT,
    energy_gained INTEGER DEFAULT 0,
    streak_bonus INTEGER DEFAULT 0,
    gems_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_checkin (user_id, checkin_date),
    INDEX idx_daily_checkins_user_id (user_id),
    INDEX idx_daily_checkins_date (checkin_date)
);
