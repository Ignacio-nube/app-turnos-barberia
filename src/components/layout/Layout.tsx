import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Icon,
  Button,
  Dialog,
  Portal,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ColorModeButton } from '@/components/ui/color-mode';
import { LuScissors, LuHeart, LuMapPin } from 'react-icons/lu';
import { useShopSettings } from '@/hooks';

interface LayoutProps {
  children: React.ReactNode;
}

const MotionBox = motion(Box);

export function Layout({ children }: LayoutProps) {
  const { settings } = useShopSettings();

  return (
    <Box minH="100vh" bg="bg">
      {/* Header */}
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel/40"
        bgGradient="to-b"
        gradientFrom="whiteAlpha.200"
        gradientTo="transparent"
        backdropFilter="blur(16px)"
        borderBottomWidth="1px"
        borderColor="whiteAlpha.200"
        boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      >
        <Container maxW="6xl">
          <Stack
            direction="row"
            justify="space-between"
            align="center"
            py="3"
          >
            <Link href="/" textDecoration="none" _hover={{ textDecoration: 'none' }}>
              <Stack direction="row" align="center" gap="2">
                <Icon fontSize="2xl" color="blue.500">
                  <LuScissors />
                </Icon>
                <Text fontWeight="bold" fontSize="xl">
                  {settings?.shop_name || 'Turnos'}
                </Text>
              </Stack>
            </Link>

            <Stack direction="row" align="center" gap="4">
              {settings?.google_maps_url && (
                <Dialog.Root size="lg">
                  <Dialog.Trigger asChild>
                    <Button variant="ghost" size="sm" gap="2">
                      <Icon><LuMapPin /></Icon>
                      Ubicación
                    </Button>
                  </Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content bg="bg.panel" backdropFilter="blur(10px)">
                        <Dialog.Header>
                          <Dialog.Title>Nuestra Ubicación</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb="6">
                          {(settings.google_maps_url.includes('google.com/maps/embed') || settings.google_maps_url.includes('output=embed')) ? (
                            <iframe
                              src={settings.google_maps_url}
                              width="100%"
                              height="400px"
                              style={{ border: 0, borderRadius: '8px' }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          ) : (
                            <Box 
                              textAlign="center" 
                              py="10" 
                              px="6" 
                              borderWidth="1px" 
                              borderRadius="lg" 
                              borderStyle="dashed"
                              bg="whiteAlpha.50"
                            >
                              <Icon fontSize="4xl" color="blue.400" mb="4"><LuMapPin /></Icon>
                              <Text mb="6">
                                Para ver el mapa interactivo aquí, debes usar el "Link de inserción" de Google Maps.
                              </Text>
                              <Button 
                                asChild 
                                colorPalette="blue" 
                                size="lg"
                                width="full"
                              >
                                <a 
                                  href={settings.google_maps_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  Abrir en Google Maps
                                </a>
                              </Button>
                            </Box>
                          )}
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                          <Button variant="ghost" size="sm" position="absolute" top="2" right="2">
                            ✕
                          </Button>
                        </Dialog.CloseTrigger>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              )}
              <Link href="/" textStyle="sm" color="fg.muted" _hover={{ color: 'fg' }}>
                Reservar
              </Link>
              <Link href="/admin" textStyle="sm" color="fg.muted" _hover={{ color: 'fg' }}>
                Admin
              </Link>
              <ColorModeButton />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <MotionBox
        as="main"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </MotionBox>

      {/* Footer */}
      <Box
        as="footer"
        borderTopWidth="1px"
        borderColor="border.subtle"
        py="8"
        bg="bg.panel/40"
        backdropFilter="blur(5px)"
      >
        <Container maxW="6xl">
          <Stack gap="4" align="center">
            <Text fontWeight="bold">{settings?.shop_name}</Text>
            <Text textAlign="center" textStyle="sm" color="fg.muted" display="flex" alignItems="center" justifyContent="center" gap="1">
              © {new Date().getFullYear()} Sistema de Turnos - Hecho con <Icon color="red.500"><LuHeart /></Icon>
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
