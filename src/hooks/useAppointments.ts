import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentCreate, AppointmentUpdate } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseAppointmentsOptions {
  date?: string; // formato YYYY-MM-DD
  enableRealtime?: boolean;
  onNewAppointment?: (appointment: Appointment) => void;
}

interface UseAppointmentsReturn {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  createAppointment: (data: AppointmentCreate) => Promise<Appointment | null>;
  updateAppointment: (id: string, updates: AppointmentUpdate) => Promise<boolean>;
  cancelAppointment: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useAppointments(options: UseAppointmentsOptions = {}): UseAppointmentsReturn {
  const { date, enableRealtime = false, onNewAppointment } = options;
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('appointments')
        .select('*')
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true });

      if (date) {
        query = query.eq('appointment_date', date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setAppointments(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar turnos';
      setError(message);
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const createAppointment = async (data: AppointmentCreate): Promise<Appointment | null> => {
    try {
      setError(null);

      // Verificar si el slot ya está ocupado
      const { data: existing } = await supabase
        .from('appointments')
        .select('id')
        .eq('appointment_date', data.appointment_date)
        .eq('start_time', data.start_time)
        .neq('status', 'cancelled')
        .limit(1);

      if (existing && existing.length > 0) {
        setError('Este horario ya está reservado');
        return null;
      }

      const { data: newAppointment, error: createError } = await supabase
        .from('appointments')
        .insert(data)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Actualizar lista local
      setAppointments(prev => [...prev, newAppointment].sort((a, b) => 
        a.start_time.localeCompare(b.start_time)
      ));

      return newAppointment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear turno';
      setError(message);
      console.error('Error creating appointment:', err);
      return null;
    }
  };

  const updateAppointment = async (id: string, updates: AppointmentUpdate): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? data : apt))
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar turno';
      setError(message);
      console.error('Error updating appointment:', err);
      return false;
    }
  };

  const cancelAppointment = async (id: string): Promise<boolean> => {
    return updateAppointment(id, { status: 'cancelled' });
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Suscripción Realtime
  useEffect(() => {
    if (!enableRealtime) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel('appointments-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments',
          },
          (payload) => {
            const newAppointment = payload.new as Appointment;
            
            // Si hay filtro de fecha, verificar que coincida
            if (date && newAppointment.appointment_date !== date) {
              return;
            }

            setAppointments(prev => {
              // Evitar duplicados
              if (prev.some(apt => apt.id === newAppointment.id)) {
                return prev;
              }
              return [...prev, newAppointment].sort((a, b) =>
                a.start_time.localeCompare(b.start_time)
              );
            });

            // Callback para notificaciones
            onNewAppointment?.(newAppointment);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appointments',
          },
          (payload) => {
            const updatedAppointment = payload.new as Appointment;
            
            setAppointments(prev =>
              prev.map(apt =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
              ).filter(apt => apt.status !== 'cancelled')
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'appointments',
          },
          (payload) => {
            const deletedId = payload.old.id as string;
            setAppointments(prev => prev.filter(apt => apt.id !== deletedId));
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enableRealtime, date, onNewAppointment]);

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refetch: fetchAppointments,
  };
}
