-- Crear tabla de profesores
CREATE TABLE IF NOT EXISTS professors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_professors_email ON professors(email);
CREATE INDEX IF NOT EXISTS idx_professors_is_active ON professors(is_active);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
CREATE TRIGGER update_professors_updated_at 
    BEFORE UPDATE ON professors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos profesores de ejemplo (contraseñas hasheadas con bcrypt)
-- La contraseña para todos es "profesor123"
INSERT INTO professors (name, email, password_hash, department) VALUES
('Dr. Juan Pérez', 'juan.perez@universidad.edu', '$2b$12$hNm6UkLr687HodVeT3NqYukDAbB0FKJwCYWowYq6UzGpa.8AhDx6q', 'Medicina Interna'),
('Dra. María García', 'maria.garcia@universidad.edu', '$2b$12$hNm6UkLr687HodVeT3NqYukDAbB0FKJwCYWowYq6UzGpa.8AhDx6q', 'Pediatría'),
('Dr. Carlos López', 'carlos.lopez@universidad.edu', '$2b$12$hNm6UkLr687HodVeT3NqYukDAbB0FKJwCYWowYq6UzGpa.8AhDx6q', 'Cardiología')
ON CONFLICT (email) DO NOTHING;

-- Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS professor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas de tokens
CREATE INDEX IF NOT EXISTS idx_professor_sessions_token ON professor_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_professor_sessions_expires ON professor_sessions(expires_at);

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM professor_sessions WHERE expires_at < NOW();
END;
$$ language 'plpgsql';
