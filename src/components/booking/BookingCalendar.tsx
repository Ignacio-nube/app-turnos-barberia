import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Text,
  Stack,
  Badge,
  Card,
  Icon,
} from '@chakra-ui/react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import type { ShopSettings, CalendarDay } from '@/types';

interface BookingCalendarProps {
  settings: ShopSettings | null;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const WEEKDAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function generateCalendarDays(
  currentMonth: Date,
  workingDays: number[]
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const today = startOfDay(new Date());

  let day = calendarStart;
  while (day <= calendarEnd) {
    const dayOfWeek = day.getDay();
    days.push({
      date: day,
      dayNumber: day.getDate(),
      isCurrentMonth: isSameMonth(day, currentMonth),
      isToday: isToday(day),
      isWorkingDay: workingDays.includes(dayOfWeek),
      isPast: isBefore(day, today),
    });
    day = addDays(day, 1);
  }

  return days;
}

export function BookingCalendar({
  settings,
  selectedDate,
  onSelectDate,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const workingDays = settings?.working_days || [];
    return generateCalendarDays(currentMonth, workingDays);
  }, [currentMonth, settings?.working_days]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleSelectDay = (day: CalendarDay) => {
    if (!day.isWorkingDay || day.isPast || !day.isCurrentMonth) return;
    onSelectDate(day.date);
  };

  const isSelected = (day: CalendarDay) => {
    return selectedDate ? isSameDay(day.date, selectedDate) : false;
  };

  return (
    <Card.Root>
      <Card.Header>
        <Stack direction="row" justify="space-between" align="center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
          >
            <Icon><LuChevronLeft /></Icon>
          </Button>
          <Heading size="md" textTransform="capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
          >
            <Icon><LuChevronRight /></Icon>
          </Button>
        </Stack>
      </Card.Header>

      <Card.Body>
        {/* Encabezados de días */}
        <Grid templateColumns="repeat(7, 1fr)" gap="1" mb="2">
          {WEEKDAY_NAMES.map(name => (
            <GridItem key={name}>
              <Text
                textAlign="center"
                fontWeight="bold"
                textStyle="sm"
                color="fg.muted"
              >
                {name}
              </Text>
            </GridItem>
          ))}
        </Grid>

        {/* Días del calendario */}
        <Grid templateColumns="repeat(7, 1fr)" gap="1">
          {calendarDays.map((day, index) => {
            const canSelect = day.isWorkingDay && !day.isPast && day.isCurrentMonth;
            const selected = isSelected(day);

            return (
              <GridItem key={index}>
                <Box
                  p="2"
                  textAlign="center"
                  borderRadius="md"
                  cursor={canSelect ? 'pointer' : 'default'}
                  opacity={!day.isCurrentMonth ? 0.3 : day.isPast ? 0.5 : 1}
                  bg={
                    selected
                      ? 'blue.solid'
                      : day.isToday
                      ? 'blue.subtle'
                      : !day.isWorkingDay && day.isCurrentMonth
                      ? 'red.subtle'
                      : 'transparent'
                  }
                  color={selected ? 'white' : 'fg'}
                  _hover={
                    canSelect
                      ? {
                          bg: selected ? 'blue.solid' : 'blue.muted',
                          transform: 'scale(1.1)',
                        }
                      : {}
                  }
                  transition="all 0.2s"
                  onClick={() => handleSelectDay(day)}
                  position="relative"
                >
                  <Text fontWeight={day.isToday ? 'bold' : 'normal'}>
                    {day.dayNumber}
                  </Text>
                  {day.isToday && !selected && (
                    <Box
                      position="absolute"
                      bottom="1"
                      left="50%"
                      transform="translateX(-50%)"
                      w="1"
                      h="1"
                      borderRadius="full"
                      bg="blue.solid"
                    />
                  )}
                </Box>
              </GridItem>
            );
          })}
        </Grid>

        {/* Leyenda */}
        <Stack direction="row" gap="4" mt="4" justify="center" flexWrap="wrap">
          <Stack direction="row" align="center" gap="1">
            <Box w="3" h="3" borderRadius="sm" bg="blue.solid" />
            <Text textStyle="xs" color="fg.muted">Seleccionado</Text>
          </Stack>
          <Stack direction="row" align="center" gap="1">
            <Box w="3" h="3" borderRadius="sm" bg="blue.subtle" />
            <Text textStyle="xs" color="fg.muted">Hoy</Text>
          </Stack>
          <Stack direction="row" align="center" gap="1">
            <Box w="3" h="3" borderRadius="sm" bg="red.subtle" />
            <Text textStyle="xs" color="fg.muted">No laboral</Text>
          </Stack>
        </Stack>

        {/* Fecha seleccionada */}
        {selectedDate && (
          <Box mt="4" textAlign="center">
            <Badge colorPalette="blue" size="lg">
              <Icon mr="1"><LuCalendar /></Icon>
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </Badge>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
}
