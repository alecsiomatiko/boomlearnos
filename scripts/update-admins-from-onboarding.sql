-- Script para actualizar usuarios existentes: Si tienen onboarding_completed = true, poner role = 'admin'
UPDATE users SET role = 'admin' WHERE onboarding_completed = true;