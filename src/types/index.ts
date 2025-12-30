// ============================================
// TIPOS TYPESCRIPT PARA APP DE TURNOS
// ============================================

// Configuración de la peluquería
export interface ShopSettings {
  id: string;
  slot_duration_minutes: number;
  morning_start: string; // formato HH:MM
  morning_end: string;
  afternoon_start: string;
  afternoon_end: string;
  working_days: number[]; // 0=Dom, 1=Lun, ..., 6=Sáb
  shop_name: string;
  contact_phone: string | null;
  google_maps_url: string | null;
  prices_url: string | null;
  created_at: string;
  updated_at: string;
}

// Formulario para actualizar configuración
export interface ShopSettingsUpdate {
  slot_duration_minutes?: number;
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  working_days?: number[];
  shop_name?: string;
  contact_phone?: string | null;
  google_maps_url?: string | null;
  prices_url?: string | null;
}

// Estado de un turno
export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';

// Turno/Cita
export interface Appointment {
  id: string;
  appointment_date: string; // formato YYYY-MM-DD
  start_time: string; // formato HH:MM
  end_time: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

// Formulario para crear turno
export interface AppointmentCreate {
  appointment_date: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  notes?: string;
}

// Formulario para actualizar turno
export interface AppointmentUpdate {
  status?: AppointmentStatus;
  notes?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
}

// Slot de tiempo disponible
export interface TimeSlot {
  start: string; // formato HH:MM
  end: string;
  isAvailable: boolean;
  isPast: boolean;
}

// Día del calendario
export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWorkingDay: boolean;
  isPast: boolean;
}

// Usuario autenticado
export interface AuthUser {
  id: string;
  email: string;
}

// Contexto de autenticación
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
