# 💈 App de Turnos - Peluquería

Una aplicación web moderna para gestionar turnos de una peluquería/barbería.

## 🚀 Tecnologías

- **Frontend:** React 19 + TypeScript + Vite
- **UI:** Chakra UI v3
- **Backend:** Supabase (Auth, Database, Realtime)
- **Routing:** React Router DOM

## 📋 Características

### Para Clientes
- 📅 Calendario interactivo para seleccionar fecha
- 🕐 Visualización de horarios disponibles en tiempo real
- 📝 Formulario de reserva simple
- ✅ Confirmación instantánea

### Para Administradores
- 🔐 Autenticación segura
- 📋 Dashboard de turnos del día
- 🔔 Notificaciones en tiempo real (Supabase Realtime)
- ⚙️ Configuración dinámica:
  - Duración de turnos
  - Horarios de mañana y tarde
  - Días laborales

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script SQL en `supabase/schema.sql`
3. Crear un archivo `.env` basado en `.env.example`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Crear usuario admin

En Supabase Dashboard → Authentication → Users → Add user

### 4. Ejecutar la aplicación

```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── admin/          # Componentes del panel admin
│   ├── auth/           # Login y autenticación
│   ├── booking/        # Calendario, slots y formulario
│   ├── layout/         # Layout principal
│   └── ui/             # Componentes de Chakra UI
├── hooks/              # Hooks personalizados
│   ├── useShopSettings.ts
│   ├── useAppointments.ts
│   ├── useAuth.tsx
│   └── useTimeSlots.ts
├── lib/
│   └── supabase.ts     # Cliente de Supabase
├── pages/
│   ├── BookingPage.tsx
│   └── AdminPage.tsx
├── types/
│   └── index.ts        # Tipos TypeScript
└── App.tsx             # Router principal
```

## 🗄️ Base de Datos

### Tablas

- **shop_settings:** Configuración del negocio
- **appointments:** Turnos/citas

### Políticas RLS

- Lectura pública para ver disponibilidad
- Escritura pública para crear turnos (clientes)
- Actualización/eliminación solo para usuarios autenticados

## 🔄 Realtime

El dashboard del admin se actualiza automáticamente cuando:
- Un cliente reserva un nuevo turno
- Se modifica el estado de un turno

## 🔗 Rutas

- `/` - Página de reservas (clientes)
- `/admin` - Panel de administración (requiere login)

## 📄 Licencia

MIT
