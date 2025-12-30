import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Grid,
  GridItem,
  Icon,
  Button,
  Container,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  BookingCalendar,
  TimeSlotsGrid,
  BookingForm,
} from '@/components';
import { useShopSettings, useAppointments, useTimeSlots } from '@/hooks';
import { LuScissors, LuCalendar, LuDollarSign } from 'react-icons/lu';
import type { TimeSlot, AppointmentCreate } from '@/types';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionStack = motion(Stack);
const MotionButton = motion(Button);

export function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const bookingRef = useRef<HTMLDivElement>(null);

  const { settings, isLoading: settingsLoading } = useShopSettings();

  // Solo cargar turnos si hay fecha seleccionada
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { appointments, isLoading: appointmentsLoading, createAppointment } = useAppointments({
    date: dateStr,
  });

  // Generar slots disponibles
  const { morningSlots, afternoonSlots } = useTimeSlots({
    settings,
    appointments,
    selectedDate: selectedDate || new Date(),
  });

  // Si hoy no es día laboral, no seleccionar por defecto
  useEffect(() => {
    if (settings && selectedDate) {
      const dayOfWeek = selectedDate.getDay();
      if (!settings.working_days.includes(dayOfWeek)) {
        setSelectedDate(null);
      }
    }
  }, [settings]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setBookingComplete(false);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
    }
  };

  const handleBook = useCallback(async (data: AppointmentCreate): Promise<boolean> => {
    const result = await createAppointment(data);
    if (result) {
      setBookingComplete(true);
      setSelectedSlot(null);
      return true;
    }
    return false;
  }, [createAppointment]);

  const handleCancelForm = () => {
    setSelectedSlot(null);
  };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (settingsLoading) {
    return (
      <Layout loading={true}>
        <Container maxW="6xl" py="16">
          <Box textAlign="center">
            <Text>Cargando...</Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout loading={appointmentsLoading}>
      {/* Hero Section */}
      <Box position="relative" minH={{ base: "70vh", md: "90vh" }} w="100%" overflow="hidden" bg="black">
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        >
          <source src="/hero.webm" type="video/webm" />
        </video>
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="blackAlpha.600"
          zIndex="1"
        />
        <Container maxW="6xl" h="100%" position="relative" zIndex="2">
          <Stack
            minH={{ base: "70vh", md: "90vh" }}
            justify="center"
            align="center"
            textAlign="center"
            gap="8"
            py="10"
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              bg="whiteAlpha.200"
              backdropFilter="blur(8px)"
              p={{ base: "6", md: "10" }}
              borderRadius="3xl"
              borderWidth="1px"
              borderColor="whiteAlpha.300"
              boxShadow="2xl"
              w="full"
              maxW="3xl"
            >
              <Stack gap="6">
                <MotionHeading
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  size={{ base: "3xl", md: "5xl" }}
                  color="white"
                  fontWeight="black"
                  lineHeight="tight"
                >
                  {settings?.shop_name || 'Tu Estilo, Tu Momento'}
                </MotionHeading>
                <MotionText
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  fontSize={{ base: "lg", md: "2xl" }}
                  color="whiteAlpha.900"
                  maxW="2xl"
                  mx="auto"
                >
                  Reserva tu turno online de forma rápida y sencilla.
                </MotionText>
                <MotionStack
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  direction={{ base: 'column', sm: 'row' }}
                  gap="4"
                  justify="center"
                  mt="4"
                >
                  <MotionButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    size="xl"
                    colorPalette="blue"
                    px={{ base: "8", md: "12" }}
                    onClick={scrollToBooking}
                    gap="2"
                    borderRadius="full"
                  >
                    <Icon><LuCalendar /></Icon>
                    Pedir Turno
                  </MotionButton>
                  {settings?.prices_url && (
                    <MotionButton
                      asChild
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      size="xl"
                      variant="outline"
                      color="white"
                      borderColor="whiteAlpha.600"
                      _hover={{ bg: 'whiteAlpha.300' }}
                      px={{ base: "8", md: "12" }}
                      gap="2"
                      borderRadius="full"
                    >
                      <a href={settings.prices_url} target="_blank" rel="noopener noreferrer">
                        <Icon><LuDollarSign /></Icon>
                        Ver Precios
                      </a>
                    </MotionButton>
                  )}
                </MotionStack>
              </Stack>
            </MotionBox>
          </Stack>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: "10", md: "20" }} ref={bookingRef}>
        <Stack gap={{ base: "8", md: "12" }}>
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            textAlign="center"
            p={{ base: "6", md: "8" }}
            borderRadius="3xl"
            bgGradient="to-b"
            gradientFrom="whiteAlpha.50"
            gradientTo="transparent"
          >
            <Heading size={{ base: "2xl", md: "3xl" }} mb="4">Reserva tu Cita</Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
              Selecciona una fecha y horario para tu visita
            </Text>
          </MotionBox>

          {/* Mensaje de confirmación */}
          {bookingComplete && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              p="6"
              bg="green.subtle"
              borderRadius="xl"
              textAlign="center"
              borderWidth="1px"
              borderColor="green.border"
            >
              <Text fontSize="3xl" mb="2">🎉</Text>
              <Heading size="md" color="green.fg">¡Turno Reservado con Éxito!</Heading>
              <Text color="fg.muted" mt="2">
                Recibirás una confirmación. ¡Te esperamos!
              </Text>
              <Button mt="4" size="sm" variant="ghost" onClick={() => setBookingComplete(false)}>
                Cerrar
              </Button>
            </MotionBox>
          )}

          {/* Contenido principal */}
          <Grid
            templateColumns={{ base: '1fr', lg: selectedSlot ? '1fr 1fr' : '1fr 2fr' }}
            gap="8"
          >
            {/* Calendario */}
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                bg="bg.panel/40"
                backdropFilter="blur(12px)"
                p="6"
                borderRadius="3xl"
                borderWidth="1px"
                borderColor="whiteAlpha.300"
                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              >
                <Heading size="md" mb="4" display="flex" alignItems="center" gap="2">
                  <Icon color="blue.500"><LuCalendar /></Icon>
                  1. Selecciona el día
                </Heading>
                <BookingCalendar
                  settings={settings}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />
              </MotionBox>
            </GridItem>

            {/* Slots o Formulario */}
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                bg="bg.panel/40"
                backdropFilter="blur(12px)"
                p="6"
                borderRadius="3xl"
                borderWidth="1px"
                borderColor="whiteAlpha.300"
                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                minH="400px"
                position="relative"
                overflow="hidden"
              >
                <AnimatePresence mode="wait">
                  {selectedSlot && selectedDate && settings ? (
                    <motion.div
                      key="booking-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BookingForm
                        selectedDate={selectedDate}
                        selectedSlot={selectedSlot}
                        settings={settings}
                        onBook={handleBook}
                        onCancel={handleCancelForm}
                      />
                    </motion.div>
                  ) : selectedDate ? (
                    <motion.div
                      key="slots-grid"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heading size="md" mb="4" display="flex" alignItems="center" gap="2">
                        <Icon color="blue.500"><LuScissors /></Icon>
                        2. Elige un horario
                      </Heading>
                      <TimeSlotsGrid
                        morningSlots={morningSlots}
                        afternoonSlots={afternoonSlots}
                        selectedSlot={selectedSlot}
                        onSelectSlot={handleSelectSlot}
                        isLoading={appointmentsLoading}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-date"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Box
                        p="8"
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor="border.subtle"
                        borderRadius="xl"
                        textAlign="center"
                        py="20"
                      >
                        <Text fontSize="4xl" mb="4">📅</Text>
                        <Heading size="md" color="fg.muted">
                          Selecciona una fecha
                        </Heading>
                        <Text color="fg.muted" mt="2">
                          Elige un día en el calendario para ver los horarios disponibles
                        </Text>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MotionBox>
            </GridItem>
          </Grid>

          {/* Info del negocio */}
          {settings?.contact_phone && (
            <Box textAlign="center" py="4">
              <Text color="fg.muted" textStyle="sm">
                ¿Necesitas ayuda? Contáctanos al{' '}
                <Text as="span" fontWeight="semibold">
                  {settings.contact_phone}
                </Text>
              </Text>
            </Box>
          )}
        </Stack>
      </Container>
    </Layout>
  );
}
