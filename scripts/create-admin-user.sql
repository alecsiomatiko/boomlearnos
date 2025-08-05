-- Insert admin user
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    level,
    experience,
    badges
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@kalabasboom.com',
    'Administrador',
    'admin',
    10,
    2500,
    '[
        {
            "id": "first_login",
            "name": "Primer Inicio",
            "description": "Has iniciado sesión por primera vez",
            "icon": "🎉",
            "unlocked": true
        },
        {
            "id": "task_master",
            "name": "Maestro de Tareas",
            "description": "Has completado 10 tareas",
            "icon": "✅",
            "unlocked": true
        },
        {
            "id": "point_collector",
            "name": "Coleccionista",
            "description": "Has alcanzado 1000 puntos",
            "icon": "💎",
            "unlocked": true
        },
        {
            "id": "streak_keeper",
            "name": "Constante",
            "description": "Has mantenido una racha de 7 días",
            "icon": "🔥",
            "unlocked": true
        },
        {
            "id": "team_player",
            "name": "Jugador de Equipo",
            "description": "Has colaborado en 5 proyectos",
            "icon": "🤝",
            "unlocked": true
        },
        {
            "id": "innovator",
            "name": "Innovador",
            "description": "Has propuesto 3 mejoras",
            "icon": "💡",
            "unlocked": true
        }
    ]'::jsonb
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    level = EXCLUDED.level,
    experience = EXCLUDED.experience,
    badges = EXCLUDED.badges,
    updated_at = NOW();

-- Insert test user
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    level,
    experience
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'user@test.com',
    'Usuario Test',
    'user',
    3,
    750
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    level = EXCLUDED.level,
    experience = EXCLUDED.experience,
    updated_at = NOW();
