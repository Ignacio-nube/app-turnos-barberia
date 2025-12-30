-- ============================================
-- SCHEMA SQL PARA APP DE TURNOS - PELUQUERÍA
-- ============================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: shop_settings
-- Configuración dinámica de la peluquería
-- ============================================
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Duración del turno en minutos
    slot_duration_minutes INTEGER NOT NULL DEFAULT 40,
    
    -- Horario de mañana
    morning_start TIME NOT NULL DEFAULT '09:00',
    morning_end TIME NOT NULL DEFAULT '13:00',
    
    -- Horario de tarde
    afternoon_start TIME NOT NULL DEFAULT '16:00',
    afternoon_end TIME NOT NULL DEFAULT '20:00',
    
    -- Días laborales (array de números: 0=Domingo, 1=Lunes, ..., 6=Sábado)
    working_days INTEGER[] NOT NULL DEFAULT ARRAY[1, 2, 3, 4, 5, 6],
    
    -- Nombre del negocio
    shop_name TEXT NOT NULL DEFAULT 'Barbería',
    
    -- Teléfono de contacto
    contact_phone TEXT,
    
    -- Ubicación y Precios
    google_maps_url TEXT,
    prices_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shop_settings_updated_at
    BEFORE UPDATE ON public.shop_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración por defecto
INSERT INTO public.shop_settings (
    slot_duration_minutes,
    morning_start,
    morning_end,
    afternoon_start,
    afternoon_end,
    working_days,
    shop_name
) VALUES (
    40,
    '09:00',
    '13:00',
    '16:00',
    '20:00',
    ARRAY[1, 2, 3, 4, 5, 6],
    'Barbería Style'
) ON CONFLICT DO NOTHING;

-- ============================================
-- TABLA: appointments
-- Turnos/Citas de los clientes
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Fecha y hora del turno
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Datos del cliente
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    
    -- Notas adicionales
    notes TEXT,
    
    -- Estado del turno
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON public.appointments(appointment_date, status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en las tablas
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS: shop_settings
-- ============================================

-- Lectura pública (todos pueden ver la configuración)
CREATE POLICY "shop_settings_read_public" ON public.shop_settings
    FOR SELECT
    TO public
    USING (true);

-- Solo usuarios autenticados pueden actualizar
CREATE POLICY "shop_settings_update_authenticated" ON public.shop_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS RLS: appointments
-- ============================================

-- Lectura pública (para verificar disponibilidad)
CREATE POLICY "appointments_read_public" ON public.appointments
    FOR SELECT
    TO public
    USING (true);

-- Cualquiera puede crear turnos (clientes sin auth)
CREATE POLICY "appointments_insert_public" ON public.appointments
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar turnos
CREATE POLICY "appointments_update_authenticated" ON public.appointments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar turnos
CREATE POLICY "appointments_delete_authenticated" ON public.appointments
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- HABILITAR REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
