-- Agregar campo password a la tabla users si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Verificar la estructura de la tabla
DESCRIBE users;