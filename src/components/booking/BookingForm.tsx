import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  Badge,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toaster } from '@/components/ui/toaster';
import type { TimeSlot, AppointmentCreate, ShopSettings } from '@/types';

interface BookingFormProps {
  selectedDate: Date;
  selectedSlot: TimeSlot;
  settings: ShopSettings;
  onBook: (data: AppointmentCreate) => Promise<boolean>;
  onCancel: () => void;
}

interface FormData {
  client_name: string;
  client_phone: string;
  client_email: string;
  notes: string;
}

export function BookingForm({
  selectedDate,
  selectedSlot,
  settings,
  onBook,
  onCancel,
}: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    client_phone: '',
    client_email: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'El nombre es requerido';
    }

    if (!formData.client_phone.trim()) {
      newErrors.client_phone = 'El teléfono es requerido';
    } else if (formData.client_phone.replace(/\D/g, '').length < 8) {
      newErrors.client_phone = 'El teléfono debe tener al menos 8 dígitos';
    }

    if (formData.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const appointmentData: AppointmentCreate = {
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone.trim(),
        client_email: formData.client_email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      const success = await onBook(appointmentData);

      if (success) {
        toaster.create({
          title: '¡Turno reservado!',
          description: `Tu turno para el ${format(selectedDate, "d 'de' MMMM", { locale: es })} a las ${selectedSlot.start} ha sido confirmado.`,
          type: 'success',
        });
      }
    } catch {
      toaster.create({
        title: 'Error al reservar',
        description: 'No se pudo completar la reserva. Intenta nuevamente.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">📝 Confirmar Reserva</Heading>
      </Card.Header>

      <Card.Body>
        {/* Resumen del turno */}
        <Box
          p="4"
          bg="blue.subtle"
          borderRadius="lg"
          mb="6"
        >
          <Stack gap="2">
            <Stack direction="row" justify="space-between">
              <Text fontWeight="semibold">📅 Fecha:</Text>
              <Text>{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</Text>
            </Stack>
            <Stack direction="row" justify="space-between">
              <Text fontWeight="semibold">🕐 Horario:</Text>
              <Badge colorPalette="blue" size="lg">
                {selectedSlot.start} - {selectedSlot.end}
              </Badge>
            </Stack>
            <Stack direction="row" justify="space-between">
              <Text fontWeight="semibold">⏱️ Duración:</Text>
              <Text>{settings.slot_duration_minutes} minutos</Text>
            </Stack>
            <Stack direction="row" justify="space-between">
              <Text fontWeight="semibold">💈 Lugar:</Text>
              <Text>{settings.shop_name}</Text>
            </Stack>
          </Stack>
        </Box>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Stack gap="4">
            <Field.Root required invalid={!!errors.client_name}>
              <Field.Label>Nombre completo</Field.Label>
              <Input
                placeholder="Tu nombre y apellido"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
              />
              {errors.client_name && (
                <Field.ErrorText>{errors.client_name}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root required invalid={!!errors.client_phone}>
              <Field.Label>Teléfono</Field.Label>
              <Input
                type="tel"
                placeholder="+54 11 1234-5678"
                value={formData.client_phone}
                onChange={(e) => handleInputChange('client_phone', e.target.value)}
              />
              {errors.client_phone && (
                <Field.ErrorText>{errors.client_phone}</Field.ErrorText>
              )}
              <Field.HelperText>
                Te contactaremos por cualquier novedad
              </Field.HelperText>
            </Field.Root>

            <Field.Root invalid={!!errors.client_email}>
              <Field.Label>
                Email
                <Badge size="sm" ml="2" colorPalette="gray">Opcional</Badge>
              </Field.Label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={formData.client_email}
                onChange={(e) => handleInputChange('client_email', e.target.value)}
              />
              {errors.client_email && (
                <Field.ErrorText>{errors.client_email}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root>
              <Field.Label>
                Notas
                <Badge size="sm" ml="2" colorPalette="gray">Opcional</Badge>
              </Field.Label>
              <Textarea
                placeholder="¿Algún pedido especial? (corte específico, etc.)"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </Field.Root>

            <Stack direction={{ base: 'column', sm: 'row' }} gap="3" pt="2">
              <Button
                variant="outline"
                flex="1"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorPalette="green"
                flex="1"
                loading={isSubmitting}
                loadingText="Reservando..."
              >
                ✅ Confirmar Turno
              </Button>
            </Stack>
          </Stack>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
