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
  Container,
  Icon,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks';
import { LuScissors } from 'react-icons/lu';

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      toaster.create({
        title: 'Bienvenido',
        description: 'Has iniciado sesión correctamente',
        type: 'success',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      toaster.create({
        title: 'Error de autenticación',
        description: message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="sm" py="16">
      <Card.Root>
        <Card.Header textAlign="center">
          <Icon fontSize="4xl" mb="2" color="blue.500">
            <LuScissors />
          </Icon>
          <Heading size="xl">Admin Panel</Heading>
          <Text color="fg.muted" mt="2">
            Inicia sesión para gestionar los turnos
          </Text>
        </Card.Header>

        <Card.Body>
          <form onSubmit={handleSubmit}>
            <Stack gap="4">
              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Contraseña</Field.Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field.Root>

              {error && (
                <Box p="3" bg="red.subtle" borderRadius="md">
                  <Text color="fg.error" textStyle="sm">{error}</Text>
                </Box>
              )}

              <Button
                type="submit"
                colorPalette="blue"
                size="lg"
                loading={isLoading}
                loadingText="Ingresando..."
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </form>
        </Card.Body>
      </Card.Root>
    </Container>
  );
}
