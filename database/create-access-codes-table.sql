-- Tabla para códigos de acceso al registro
-- Un código único permite el registro de una sola empresa/usuario

CREATE TABLE IF NOT EXISTS access_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,
    used_by_user_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_is_used (is_used)
);

-- Insertar algunos códigos de ejemplo para testing
INSERT INTO access_codes (code) VALUES 
('ALPHA1234'),
('BRAVO5678'),
('DELTA9012');