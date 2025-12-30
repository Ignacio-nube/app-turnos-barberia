import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  Tabs,
  Text,
  Input,
  Field,
  Icon,
  Container,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import {
  Layout,
  AdminDashboard,
  AdminSettingsForm,
  LoginForm,
} from '@/components';
import { useAuth } from '@/hooks';
import { LuLayoutDashboard, LuClipboardList, LuSettings } from 'react-icons/lu';

const MotionBox = motion(Box);

export function AdminPage() {
  const { user, isLoading, signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <Layout loading={true}>
        <Container maxW="6xl" py="16">
          <Box textAlign="center">
            <Text>Verificando autenticación...</Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return (
      <Layout>
        <Container maxW="md" py={{ base: "10", md: "20" }}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LoginForm />
          </MotionBox>
        </Container>
      </Layout>
    );
  }

  // Usuario autenticado - mostrar panel admin
  return (
    <Layout>
      <Container maxW="6xl" py={{ base: "4", md: "8" }}>
        <Stack gap="6">
          {/* Header */}
          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap="4">
            <Box>
              <Heading size={{ base: "xl", md: "2xl" }}>
                <Icon mr="2" color="blue.500"><LuLayoutDashboard /></Icon>
                Panel de Administración
              </Heading>
              <Text color="fg.muted" mt="1">
                Gestiona los turnos y configuración de tu negocio
              </Text>
            </Box>
            <Stack direction="row" gap="2" justify="space-between" align="center">
              <Text color="fg.muted" textStyle="sm" truncate maxW="200px">
                {user.email}
              </Text>
              <Button variant="outline" size="sm" onClick={signOut}>
                Cerrar Sesión
              </Button>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Tabs.Root defaultValue="dashboard" variant="enclosed">
            <Tabs.List overflowX="auto" whiteSpace="nowrap" display="flex">
              <Tabs.Trigger value="dashboard" flex="1">
                <Icon mr="2"><LuClipboardList /></Icon>
                Turnos
              </Tabs.Trigger>
              <Tabs.Trigger value="settings" flex="1">
                <Icon mr="2"><LuSettings /></Icon>
                Configuración
              </Tabs.Trigger>
            </Tabs.List>

            {/* Dashboard Tab */}
            <Tabs.Content value="dashboard">
              <Stack gap="4" pt="4">
                {/* Selector de fecha */}
                <Stack direction={{ base: 'column', sm: 'row' }} gap="2" align={{ base: 'stretch', sm: 'center' }}>
                  <Field.Root>
                    <Field.Label>Fecha</Field.Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      maxW="200px"
                    />
                  </Field.Root>
                  <Stack direction="row" gap="2" pt={{ base: '0', sm: '6' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                    >
                      Hoy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
                    >
                      Mañana
                    </Button>
                  </Stack>
                </Stack>

                {/* Dashboard con Realtime */}
                <AdminDashboard selectedDate={selectedDate} />
              </Stack>
            </Tabs.Content>

            {/* Settings Tab */}
            <Tabs.Content value="settings">
              <Box pt="4">
                <AdminSettingsForm />
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Stack>
      </Container>
    </Layout>
  );
}
