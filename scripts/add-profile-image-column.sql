-- Script para agregar la columna profile_image a la tabla users
-- Este script agrega el campo para almacenar URLs de imágenes de perfil

ALTER TABLE users 
ADD COLUMN profile_image VARCHAR(500) NULL 
COMMENT 'URL de la imagen de perfil del usuario';

-- Verificar que la columna se agregó correctamente
DESCRIBE users;
