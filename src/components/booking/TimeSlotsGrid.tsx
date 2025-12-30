import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Text,
  Stack,
  Card,
  Badge,
  Icon,
} from '@chakra-ui/react';
import type { TimeSlot } from '@/types';
import { LuSun, LuMoon } from 'react-icons/lu';

interface TimeSlotsGridProps {
  morningSlots: TimeSlot[];
  afternoonSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

function SlotButton({
  slot,
  isSelected,
  onSelect,
}: {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getSlotStyles = () => {
    if (isSelected) {
      return {
        bg: 'blue.solid',
        color: 'white',
        borderColor: 'blue.solid',
        _hover: { bg: 'blue.600' },
      };
    }
    if (slot.isPast) {
      return {
        bg: 'gray.subtle',
        color: 'fg.muted',
        borderColor: 'border.subtle',
        cursor: 'not-allowed',
        opacity: 0.4,
        textDecoration: 'line-through',
      };
    }
    if (!slot.isAvailable) {
      return {
        bg: 'gray.subtle',
        color: 'fg.muted',
        borderColor: 'border.subtle',
        cursor: 'not-allowed',
        opacity: 0.6,
      };
    }
    return {
      bg: { base: 'white', _dark: 'bg.panel' },
      color: 'fg',
      borderColor: 'border.subtle',
      _hover: { bg: 'blue.subtle', borderColor: 'blue.border', transform: 'translateY(-2px)' },
      shadow: 'sm',
    };
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onSelect}
      disabled={!slot.isAvailable}
      {...getSlotStyles()}
      transition="all 0.2s"
      w="full"
      height="auto"
      py="4"
      flexDirection="column"
      gap="1"
    >
      <Text fontWeight="bold" fontSize="lg">{slot.start}</Text>
      <Text fontSize="xs" opacity={0.8}>
        {slot.isAvailable ? 'Disponible' : slot.isPast ? 'Pasado' : 'Ocupado'}
      </Text>
    </Button>
  );
}

export function TimeSlotsGrid({
  morningSlots,
  afternoonSlots,
  selectedSlot,
  onSelectSlot,
  isLoading,
}: TimeSlotsGridProps) {
  if (isLoading) {
    return (
      <Card.Root>
        <Card.Body>
          <Stack gap="4" py="10" align="center">
            <Text color="fg.muted">Buscando horarios disponibles...</Text>
          </Stack>
        </Card.Body>
      </Card.Root>
    );
  }

  const totalSlots = morningSlots.length + afternoonSlots.length;
  const availableSlots = [...morningSlots, ...afternoonSlots].filter(s => s.isAvailable).length;

  return (
    <Card.Root variant="subtle" border="none" bg="transparent">
      <Card.Header px="0">
        <Stack direction="row" justify="space-between" align="center">
          <Heading size="md">📅 Horarios para hoy</Heading>
          <Badge colorPalette={availableSlots > 0 ? 'green' : 'red'} variant="solid" borderRadius="full">
            {availableSlots} disponibles
          </Badge>
        </Stack>
      </Card.Header>

      <Card.Body px="0">
        <Stack gap="8">
          {/* Turno Mañana */}
          {morningSlots.length > 0 && (
            <Box>
              <Stack direction="row" align="center" gap="2" mb="4">
                <Box p="2" bg="orange.subtle" borderRadius="lg">
                  <Icon color="orange.600"><LuSun /></Icon>
                </Box>
                <Box>
                  <Text fontWeight="bold">Turno Mañana</Text>
                  <Text fontSize="xs" color="fg.muted">Horarios de inicio</Text>
                </Box>
              </Stack>
              <Grid
                templateColumns={{
                  base: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                }}
                gap="3"
              >
                {morningSlots.map((slot) => (
                  <GridItem key={slot.start}>
                    <SlotButton
                      slot={slot}
                      isSelected={selectedSlot?.start === slot.start}
                      onSelect={() => onSelectSlot(slot)}
                    />
                  </GridItem>
                ))}
              </Grid>
            </Box>
          )}

          {/* Turno Noche */}
          {afternoonSlots.length > 0 && (
            <Box>
              <Stack direction="row" align="center" gap="2" mb="4">
                <Box p="2" bg="blue.subtle" borderRadius="lg">
                  <Icon color="blue.600"><LuMoon /></Icon>
                </Box>
                <Box>
                  <Text fontWeight="bold">Turno Noche</Text>
                  <Text fontSize="xs" color="fg.muted">Horarios de inicio</Text>
                </Box>
              </Stack>
              <Grid
                templateColumns={{
                  base: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                }}
                gap="3"
              >
                {afternoonSlots.map((slot) => (
                  <GridItem key={slot.start}>
                    <SlotButton
                      slot={slot}
                      isSelected={selectedSlot?.start === slot.start}
                      onSelect={() => onSelectSlot(slot)}
                    />
                  </GridItem>
                ))}
              </Grid>
            </Box>
          )}

          {/* Sin horarios */}
          {totalSlots === 0 && (
            <Box textAlign="center" py="8">
              <Text color="fg.muted">
                No hay horarios configurados para este día
              </Text>
            </Box>
          )}

          {/* Leyenda */}
          <Stack direction="row" gap="4" justify="center" flexWrap="wrap" pt="2">
            <Stack direction="row" align="center" gap="1">
              <Box w="3" h="3" borderRadius="sm" bg="green.subtle" />
              <Text textStyle="xs" color="fg.muted">Disponible</Text>
            </Stack>
            <Stack direction="row" align="center" gap="1">
              <Box w="3" h="3" borderRadius="sm" bg="blue.solid" />
              <Text textStyle="xs" color="fg.muted">Seleccionado</Text>
            </Stack>
            <Stack direction="row" align="center" gap="1">
              <Box w="3" h="3" borderRadius="sm" bg="gray.subtle" />
              <Text textStyle="xs" color="fg.muted">Ocupado</Text>
            </Stack>
          </Stack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
