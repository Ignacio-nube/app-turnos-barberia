import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Heading,
  Text,
  Stack,
  Badge,
  Table,
  Dialog,
  Portal,
  Icon,
} from '@chakra-ui/react';
import { CloseButton } from '@/components/ui/close-button';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toaster } from '@/components/ui/toaster';
import { useAppointments } from '@/hooks';
import { LuCheck, LuX, LuTrash2 } from 'react-icons/lu';
import type { Appointment, AppointmentStatus } from '@/types';

interface AdminDashboardProps {
  selectedDate?: string; // formato YYYY-MM-DD
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; colorPalette: string }> = {
  confirmed: { label: 'Confirmado', colorPalette: 'blue' },
  completed: { label: 'Completado', colorPalette: 'green' },
  cancelled: { label: 'Cancelado', colorPalette: 'red' },
  no_show: { label: 'No asistió', colorPalette: 'orange' },
};

function getDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Hoy';
  if (isTomorrow(date)) return 'Mañana';
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function AdminDashboard({ selectedDate }: AdminDashboardProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Callback para notificación de nuevo turno
  const handleNewAppointment = useCallback((appointment: Appointment) => {
    toaster.create({
      title: 'Nuevo turno reservado',
      description: `${appointment.client_name} - ${appointment.start_time.substring(0, 5)}`,
      type: 'info',
      duration: 5000,
    });
  }, []);

  const {
    appointments,
    isLoading,
    error,
    updateAppointment,
    cancelAppointment,
  } = useAppointments({
    date: selectedDate,
    enableRealtime: true,
    onNewAppointment: handleNewAppointment,
  });

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    const success = await updateAppointment(id, { status });
    if (success) {
      toaster.create({
        title: 'Estado actualizado',
        type: 'success',
      });
      setIsDialogOpen(false);
    } else {
      toaster.create({
        title: 'Error al actualizar',
        type: 'error',
      });
    }
  };

  const handleCancel = async (id: string) => {
    const success = await cancelAppointment(id);
    if (success) {
      toaster.create({
        title: 'Turno cancelado',
        type: 'success',
      });
      setIsDialogOpen(false);
    }
  };

  const openDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card.Root>
        <Card.Body>
          <Text textAlign="center">Cargando turnos...</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (error) {
    return (
      <Card.Root>
        <Card.Body>
          <Text color="fg.error">Error: {error}</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <>
      <Card.Root>
        <Card.Header>
          <Stack direction="row" justify="space-between" align="center">
            <Stack>
              <Heading size="lg">📋 Turnos del Día</Heading>
              {selectedDate && (
                <Text color="fg.muted">{getDateLabel(selectedDate)}</Text>
              )}
            </Stack>
            <Stack direction="row" gap="2">
              <Badge colorPalette="blue" size="lg">
                {confirmedAppointments.length} pendientes
              </Badge>
              <Badge colorPalette="green" size="lg">
                {completedAppointments.length} completados
              </Badge>
            </Stack>
          </Stack>
        </Card.Header>

        <Card.Body>
          {appointments.length === 0 ? (
            <Box textAlign="center" py="8">
              <Text fontSize="4xl" mb="2">📭</Text>
              <Text color="fg.muted">No hay turnos para este día</Text>
            </Box>
          ) : (
            <Table.ScrollArea maxW="100vw" borderWidth="1px" rounded="md">
              <Table.Root size="sm" variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader minW="100px">Hora</Table.ColumnHeader>
                    <Table.ColumnHeader minW="150px">Cliente</Table.ColumnHeader>
                    <Table.ColumnHeader minW="120px">Teléfono</Table.ColumnHeader>
                    <Table.ColumnHeader minW="120px">Estado</Table.ColumnHeader>
                    <Table.ColumnHeader minW="120px">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {appointments.map((appointment) => (
                    <Table.Row key={appointment.id}>
                      <Table.Cell>
                        <Badge colorPalette="gray">
                          {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell fontWeight="medium">
                        {appointment.client_name}
                      </Table.Cell>
                      <Table.Cell color="fg.muted">
                        {appointment.client_phone}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={STATUS_CONFIG[appointment.status].colorPalette}>
                          {STATUS_CONFIG[appointment.status].label}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openDetails(appointment)}
                        >
                          Ver
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          )}
        </Card.Body>
      </Card.Root>

      {/* Dialog de detalles */}
      <Dialog.Root open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Detalles del Turno</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {selectedAppointment && (
                  <Stack gap="4">
                    <Box>
                      <Text fontWeight="semibold" mb="1">Cliente</Text>
                      <Text>{selectedAppointment.client_name}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" mb="1">Teléfono</Text>
                      <Text>{selectedAppointment.client_phone}</Text>
                    </Box>
                    {selectedAppointment.client_email && (
                      <Box>
                        <Text fontWeight="semibold" mb="1">Email</Text>
                        <Text>{selectedAppointment.client_email}</Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontWeight="semibold" mb="1">Horario</Text>
                      <Text>
                        {selectedAppointment.start_time} - {selectedAppointment.end_time}
                      </Text>
                    </Box>
                    {selectedAppointment.notes && (
                      <Box>
                        <Text fontWeight="semibold" mb="1">Notas</Text>
                        <Text color="fg.muted">{selectedAppointment.notes}</Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontWeight="semibold" mb="2">Cambiar estado</Text>
                      <Stack direction="row" gap="2" flexWrap="wrap">
                        {selectedAppointment.status !== 'completed' && (
                          <Button
                            size={{ base: 'md', md: 'lg' }}
                            colorPalette="green"
                            rounded="full"
                            leftIcon={<Icon><LuCheck /></Icon>}
                            fontWeight="bold"
                            px={{ base: 6, md: 10 }}
                            py={{ base: 3, md: 4 }}
                            shadow="md"
                            transition="all 0.2s"
                            onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                          >
                            Confirmar Turno
                          </Button>
                        )}
                        {selectedAppointment.status !== 'no_show' && (
                          <Button
                            size="sm"
                            colorPalette="orange"
                            variant="outline"
                            onClick={() => handleStatusChange(selectedAppointment.id, 'no_show')}
                          >
                            <Icon mr="1"><LuX /></Icon>
                            No asistió
                          </Button>
                        )}
                        {selectedAppointment.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            colorPalette="red"
                            variant="outline"
                            onClick={() => handleCancel(selectedAppointment.id)}
                          >
                            <Icon mr="1"><LuTrash2 /></Icon>
                            Cancelar
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
