import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  Input,
  Stack,
  Switch,
  Text,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { useShopSettings } from '@/hooks';
import { LuSettings, LuSun, LuMoon, LuSave } from 'react-icons/lu';
import type { ShopSettings, ShopSettingsUpdate } from '@/types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

interface FormData {
  shop_name: string;
  slot_duration_minutes: number;
  morning_start: string;
  morning_end: string;
  afternoon_start: string;
  afternoon_end: string;
  working_days: number[];
  contact_phone: string;
  google_maps_url: string;
  prices_url: string;
}

function settingsToFormData(settings: ShopSettings): FormData {
  return {
    shop_name: settings.shop_name,
    slot_duration_minutes: settings.slot_duration_minutes,
    morning_start: settings.morning_start.slice(0, 5),
    morning_end: settings.morning_end.slice(0, 5),
    afternoon_start: settings.afternoon_start.slice(0, 5),
    afternoon_end: settings.afternoon_end.slice(0, 5),
    working_days: settings.working_days,
    contact_phone: settings.contact_phone || '',
    google_maps_url: settings.google_maps_url || '',
    prices_url: settings.prices_url || '',
  };
}

export function AdminSettingsForm() {
  const { settings, isLoading, error, updateSettings } = useShopSettings();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settingsToFormData(settings));
    }
  }, [settings]);

  if (isLoading) {
    return (
      <Card.Root>
        <Card.Body>
          <Text>Cargando configuración...</Text>
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

  if (!formData) return null;

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const newDays = prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day].sort((a, b) => a - b);
      return { ...prev, working_days: newDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSaving(true);
    try {
      const updates: ShopSettingsUpdate = {
        shop_name: formData.shop_name,
        slot_duration_minutes: Number(formData.slot_duration_minutes),
        morning_start: formData.morning_start,
        morning_end: formData.morning_end,
        afternoon_start: formData.afternoon_start,
        afternoon_end: formData.afternoon_end,
        working_days: formData.working_days,
        contact_phone: formData.contact_phone || null,
        google_maps_url: formData.google_maps_url || null,
        prices_url: formData.prices_url || null,
      };

      const success = await updateSettings(updates);
      
      if (success) {
        toaster.create({
          title: 'Configuración guardada',
          description: 'Los cambios se han aplicado correctamente',
          type: 'success',
        });
      } else {
        throw new Error('No se pudo guardar la configuración');
      }
    } catch (err) {
      toaster.create({
        title: 'Error al guardar',
        description: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="lg">
          <Icon mr="2" color="blue.500"><LuSettings /></Icon>
          Configuración del Negocio
        </Heading>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Stack gap="6">
            {/* Información del negocio */}
            <Box>
              <Heading size="md" mb="4">Información General</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                <GridItem>
                  <Field.Root required>
                    <Field.Label>Nombre del Negocio</Field.Label>
                    <Input
                      value={formData.shop_name}
                      onChange={(e) => handleInputChange('shop_name', e.target.value)}
                      placeholder="Nombre de tu peluquería"
                    />
                  </Field.Root>
                </GridItem>
                <GridItem>
                  <Field.Root>
                    <Field.Label>Teléfono de Contacto</Field.Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+54 11 1234-5678"
                    />
                  </Field.Root>
                </GridItem>
                <GridItem>
                  <Field.Root>
                    <Field.Label>URL Google Maps</Field.Label>
                    <Input
                      value={formData.google_maps_url}
                      onChange={(e) => handleInputChange('google_maps_url', e.target.value)}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    <Field.HelperText>
                      Para mostrar el mapa, usa el link de <b>"Insertar un mapa"</b> en Google Maps o un link que termine en <code>&output=embed</code>.
                    </Field.HelperText>
                  </Field.Root>
                </GridItem>
                <GridItem>
                  <Field.Root>
                    <Field.Label>URL Precios (PDF o Imagen)</Field.Label>
                    <Input
                      value={formData.prices_url}
                      onChange={(e) => handleInputChange('prices_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </Field.Root>
                </GridItem>
              </Grid>
            </Box>

            {/* Duración del turno */}
            <Box>
              <Heading size="md" mb="4">Duración del Turno</Heading>
              <Field.Root required>
                <Field.Label>Minutos por turno</Field.Label>
                <Input
                  type="number"
                  min={15}
                  max={120}
                  step={5}
                  value={formData.slot_duration_minutes}
                  onChange={(e) => handleInputChange('slot_duration_minutes', parseInt(e.target.value))}
                />
                <Field.HelperText>
                  Duración de cada turno en minutos (ej: 30, 40, 60)
                </Field.HelperText>
              </Field.Root>
            </Box>

            {/* Horarios */}
            <Box>
              <Heading size="md" mb="4">Horarios de Atención</Heading>
              
              <Stack gap="4">
                {/* Horario Mañana */}
                <Box p="4" borderWidth="1px" borderRadius="lg" borderColor="border.subtle">
                  <Text fontWeight="semibold" mb="3" display="flex" alignItems="center" gap="2">
                    <Icon color="orange.400"><LuSun /></Icon>
                    Turno Mañana
                  </Text>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                    <Field.Root required>
                      <Field.Label>Apertura</Field.Label>
                      <Input
                        type="time"
                        value={formData.morning_start}
                        onChange={(e) => handleInputChange('morning_start', e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>Cierre</Field.Label>
                      <Input
                        type="time"
                        value={formData.morning_end}
                        onChange={(e) => handleInputChange('morning_end', e.target.value)}
                      />
                    </Field.Root>
                  </Grid>
                </Box>

                {/* Horario Tarde */}
                <Box p="4" borderWidth="1px" borderRadius="lg" borderColor="border.subtle">
                  <Text fontWeight="semibold" mb="3" display="flex" alignItems="center" gap="2">
                    <Icon color="blue.400"><LuMoon /></Icon>
                    Turno Noche
                  </Text>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                    <Field.Root required>
                      <Field.Label>Apertura</Field.Label>
                      <Input
                        type="time"
                        value={formData.afternoon_start}
                        onChange={(e) => handleInputChange('afternoon_start', e.target.value)}
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>Cierre</Field.Label>
                      <Input
                        type="time"
                        value={formData.afternoon_end}
                        onChange={(e) => handleInputChange('afternoon_end', e.target.value)}
                      />
                    </Field.Root>
                  </Grid>
                </Box>
              </Stack>
            </Box>

            {/* Días laborales */}
            <Box>
              <Heading size="md" mb="4">Días Laborales</Heading>
              <Text textStyle="sm" color="fg.muted" mb="4">
                Selecciona los días que el negocio está abierto
              </Text>
              <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3">
                {DAYS_OF_WEEK.map(day => (
                  <Box
                    key={day.value}
                    p="3"
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={formData.working_days.includes(day.value) ? 'green.solid' : 'border.subtle'}
                    bg={formData.working_days.includes(day.value) ? 'green.subtle' : 'bg'}
                    cursor="pointer"
                    onClick={() => handleDayToggle(day.value)}
                    _hover={{ bg: formData.working_days.includes(day.value) ? 'green.muted' : 'bg.subtle' }}
                    transition="all 0.2s"
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Text fontWeight="medium">{day.label}</Text>
                      <Switch.Root
                        checked={formData.working_days.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                        colorPalette="green"
                        size="sm"
                      >
                        <Switch.HiddenInput />
                        <Switch.Control />
                      </Switch.Root>
                    </Stack>
                  </Box>
                ))}
              </Grid>
            </Box>

            {/* Botón guardar */}
            <Button
              type="submit"
              colorPalette="blue"
              size="lg"
              loading={isSaving}
              loadingText="Guardando..."
            >
              <Icon mr="1"><LuSave /></Icon>
              Guardar Configuración
            </Button>
          </Stack>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
