# Creación de PilloVan Mobile (MVP)

Este plan describe la arquitectura y los pasos para construir la versión móvil de PilloVan. El objetivo es crear un "espejo" funcional de la aplicación web actual (React) hacia React Native, manteniendo una experiencia idéntica para los 4 tipos de roles existentes.

## User Review Required

Por favor revisa el plan a continuación. Si estás de acuerdo con la estrategia y las tecnologías, **dime que "es hora de codear"** y empezaré con la inicialización del proyecto.

> [!IMPORTANT]
> **Consideración para desarrollo local:** Dado que el backend corre en `localhost:5000` en tu computadora, la app móvil (si la pruebas en un teléfono físico o simulador de Android) necesitará apuntar a la dirección IP de tu red local en lugar de `localhost`. Configuraremos una variable de entorno dinámica para que esto no sea un dolor de cabeza.

## Stack Tecnológico Acordado
- **Ubicación:** Carpeta `/mobile` dentro del repositorio actual.
- **Framework:** React Native + Expo.
- **Navegación:** Expo Router (Rutas basadas en archivos).
- **Estilos:** NativeWind v4 (TailwindCSS para React Native).
- **Autenticación:** `@supabase/supabase-js` utilizando Google OAuth.
- **Estado de Servidor:** `@tanstack/react-query`.

---

## Fases de Implementación

### Fase 1: Inicialización y Configuración Base
- [ ] Ejecutar `npx create-expo-app@latest mobile` con la plantilla de Expo Router.
- [ ] Instalar dependencias core: `nativewind`, `tailwindcss`, `@supabase/supabase-js`, `@tanstack/react-query`, y `axios`.
- [ ] Configurar `tailwind.config.js`, `babel.config.js` y `metro.config.js` para habilitar NativeWind.
- [ ] Crear estructura de carpetas: `src/components`, `src/hooks`, `src/lib` y la carpeta de enrutamiento `app/`.

### Fase 2: Configuración de Autenticación (Auth)
- [ ] Configurar las variables de entorno para Supabase.
- [ ] Crear el cliente de Supabase adaptado para React Native (usando `AsyncStorage` para persistir la sesión).
- [ ] Implementar el `AuthContext.tsx` y el hook `useAuth()`.
- [ ] Configurar el sistema de **Deep Linking** (`scheme` en `app.json`) necesario para que el login de Google redireccione correctamente de vuelta a la app.
- [ ] Crear la pantalla de Login y el Layout de protección (`_layout.tsx`) para redirigir si no hay sesión activa.

### Fase 3: Traducción de Interfaz y Consumo de Datos (API)
- [ ] Configurar un archivo central para las peticiones API (usando `axios` apuntando a tu API de Express).
- [ ] Configurar `QueryClientProvider` para habilitar TanStack Query.
- [ ] Traducir las pantallas de Dashboard / Vistas principales (Tours, Trips, Conductores) replicando el diseño de la web usando clases de Tailwind vía NativeWind.

## Verification Plan

### Manual Verification
- Levantar el servidor de desarrollo de Expo (`npm start` o `npx expo start` dentro de `/mobile`).
- Comprobar que los estilos de NativeWind se aplican correctamente.
- Probar el flujo completo de inicio de sesión con Google en el simulador/teléfono.
- Verificar que las peticiones al backend en `localhost` se resuelven correctamente desde la aplicación móvil y muestran los mismos datos que la web.
