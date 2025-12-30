import { useMemo } from 'react';
import {
  format,
  addMinutes,
  parse,
  isBefore,
  isAfter,
  startOfDay,
  isToday,
} from 'date-fns';
import type { TimeSlot, ShopSettings, Appointment } from '@/types';

interface UseTimeSlotsOptions {
  settings: ShopSettings | null;
  appointments: Appointment[];
  selectedDate: Date;
}

interface UseTimeSlotsReturn {
  morningSlots: TimeSlot[];
  afternoonSlots: TimeSlot[];
  allSlots: TimeSlot[];
}

function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  appointments: Appointment[],
  selectedDate: Date
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const now = new Date();
  const todayStart = startOfDay(selectedDate);

  // Normalizar formato de hora (quitar segundos si existen)
  const cleanStartTime = startTime.substring(0, 5);
  const cleanEndTime = endTime.substring(0, 5);

  // Parsear horas de inicio y fin
  let currentTime = parse(cleanStartTime, 'HH:mm', todayStart);
  const endDateTime = parse(cleanEndTime, 'HH:mm', todayStart);

  // Generar slots hasta la hora de cierre
  while (isBefore(currentTime, endDateTime)) {
    const slotEnd = addMinutes(currentTime, durationMinutes);
    
    // No crear slot si excede la hora de cierre
    if (isAfter(slotEnd, endDateTime)) {
      break;
    }

    const slotStartStr = format(currentTime, 'HH:mm');
    const slotEndStr = format(slotEnd, 'HH:mm');

    // Verificar si está ocupado (normalizando la hora de la cita)
    const isOccupied = appointments.some(
      apt =>
        apt.appointment_date === dateStr &&
        apt.start_time.substring(0, 5) === slotStartStr &&
        apt.status !== 'cancelled'
    );

    // Verificar si ya pasó (solo para hoy)
    const slotDateTime = parse(slotStartStr, 'HH:mm', startOfDay(selectedDate));
    const isPast = isToday(selectedDate) && isBefore(slotDateTime, now);

    slots.push({
      start: slotStartStr,
      end: slotEndStr,
      isAvailable: !isOccupied && !isPast,
      isPast,
    });

    currentTime = slotEnd;
  }

  return slots;
}

export function useTimeSlots(options: UseTimeSlotsOptions): UseTimeSlotsReturn {
  const { settings, appointments, selectedDate } = options;

  const { morningSlots, afternoonSlots } = useMemo(() => {
    if (!settings) {
      return { morningSlots: [], afternoonSlots: [] };
    }

    const morning = generateSlots(
      settings.morning_start,
      settings.morning_end,
      settings.slot_duration_minutes,
      appointments,
      selectedDate
    );

    const afternoon = generateSlots(
      settings.afternoon_start,
      settings.afternoon_end,
      settings.slot_duration_minutes,
      appointments,
      selectedDate
    );

    return { morningSlots: morning, afternoonSlots: afternoon };
  }, [settings, appointments, selectedDate]);

  const allSlots = useMemo(
    () => [...morningSlots, ...afternoonSlots],
    [morningSlots, afternoonSlots]
  );

  return {
    morningSlots,
    afternoonSlots,
    allSlots,
  };
}
