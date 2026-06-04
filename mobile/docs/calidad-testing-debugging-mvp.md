# Documentación de calidad, debugging y testing del MVP

Fecha de revisión: 2026-06-02

Proyecto: PilloVan Mobile, aplicación Expo Router con React Native, Clerk y Convex.

## Propósito

Este documento registra qué decisiones se tomaron después de identificar problemas o riesgos durante el desarrollo y las pruebas del MVP. El enfoque no es listar únicamente errores de depuración, sino explicar qué se hizo después de detectarlos, por qué se tomó cada decisión y cómo se puede repetir el criterio en futuras iteraciones.

La revisión se hizo tomando como referencia el material de Semana 16 sobre calidad, testing, debugging, performance y entornos comerciales. En particular, se consideraron los temas de debugging en React Native/Expo, uso de herramientas de análisis, testing automatizado, performance, feedback y control interno antes de QA.

## Contexto técnico del MVP

El MVP está construido con:

- Expo Router para navegación.
- Gluestack UI y NativeWind para interfaz.
- Clerk para autenticación.
- Convex para backend, funciones auth-aware y datos realtime.
- Vitest y `convex-test` para pruebas automatizadas del backend.
- ESLint y Prettier para análisis estático y formato.

Actualmente el proyecto tiene pruebas automatizadas backend, pero no tiene una suite formal de pruebas frontend. Por eso, los controles de UI se documentan como revisión manual, análisis estático y decisiones de diseño pendientes de robustecer con tests de componentes o flujos.

## Evidencia ejecutada

Durante esta revisión se ejecutaron los siguientes comandos:

```bash
npm run lint
npm run lint:report
npm run test:backend
npm run test:backend:coverage
```

Resultados observados:

- `npm run lint`: 0 errores, 6 warnings.
- `npm run lint:report`: generó/actualizó `reports/eslint-report.html` y `reports/eslint-report.json`.
- `npm run test:backend`: 4 archivos de prueba pasaron, 49 pruebas pasaron.
- `npm run test:backend:coverage`: 4 archivos de prueba pasaron, 49 pruebas pasaron.
- Cobertura backend:
  - Statements: 94.95%.
  - Branches: 85.03%.
  - Functions: 97.05%.
  - Lines: 96.55%.

La configuración de cobertura exige umbrales mínimos de 85% para lines, functions, branches y statements en `vitest.backend.config.ts`. La revisión actual cumple esos umbrales.

## Casos documentados

### 1. Riesgo de rutas incorrectas por estado de autenticación

Durante el desarrollo del MVP, una zona crítica fue la navegación según el estado del usuario: visitante, usuario autenticado sin onboarding y usuario onboarded. El riesgo identificado era que el usuario pudiera quedar en una pantalla no permitida, ver contenido de una sección incorrecta o experimentar redirecciones duplicadas.

La remediación aplicada fue centralizar el gate de rutas en `app/_layout.tsx`, usando el estado derivado por `useCurrentUser`. Se definió una tabla explícita de estados de ruta (`signedOut`, `needsOnboarding`, `onboarded`) y sus grupos permitidos. Esto evita duplicar redirects en layouts internos y mantiene la decisión de navegación en un solo punto.

Justificación:

- Reduce inconsistencias entre pantallas.
- Evita lógica repetida de auth en componentes secundarios.
- Hace más simple depurar problemas de navegación porque el flujo principal está concentrado en el layout raíz.

Control posterior:

- Se revisó que el hook `useCurrentUser` use Clerk y Convex para derivar estado.
- Se verificó con ESLint que no existan errores estáticos en la ruta raíz.
- Se mantiene como pendiente agregar pruebas frontend o de integración para validar redirecciones reales por estado.

### 2. Riesgo de crear usuarios duplicados o usar identificadores no confiables

En la integración Clerk + Convex, el riesgo principal era asociar usuarios por un identificador inestable o permitir que el cliente enviara IDs para autorización. Esto podía causar duplicados, acceso incorrecto o errores difíciles de reproducir al depurar sesiones.

La remediación fue hacer que las funciones Convex deriven identidad del servidor con `ctx.auth.getUserIdentity()` y usen `identity.tokenIdentifier` como llave estable. La función `ensureUser` busca por `tokenIdentifier` antes de crear un registro y actualiza datos auth-owned como email cuando cambian.

Justificación:

- El cliente no decide quién es el usuario.
- La autorización queda del lado backend.
- La sincronización entre Clerk y Convex se vuelve idempotente.

Control posterior:

- Las pruebas de `convex/users.test.ts` cubren creación de usuario, rechazo de llamadas no autenticadas, reutilización de usuario existente, actualización de email y onboarding.
- La cobertura backend confirma que esta zona está protegida por pruebas automatizadas.

### 3. Riesgo de aceptar datos inválidos en onboarding, tours, trips y chats

Durante el desarrollo se identificó que los validadores de Convex aseguran la forma de los argumentos, pero no reemplazan validaciones de negocio como campos vacíos, límites de longitud, rangos numéricos o normalización de strings.

La remediación fue agregar validaciones explícitas en funciones como:

- `convex/users.ts`: edad, nombres, teléfono y trimming.
- `convex/tours.ts`: nombre, lugar, ocupación, descripción y duplicados por compañía.
- `convex/trips.ts`: ubicaciones, hora, tamaño del grupo, participantes y ocupación del tour.
- `convex/chats.ts`: mensajes vacíos o demasiado largos.

Justificación:

- Evita que errores de UI terminen persistiendo datos corruptos.
- Hace que el backend sea la fuente final de reglas de negocio.
- Convierte errores de negocio en `ConvexError`, que puede mostrarse al usuario en UI.

Control posterior:

- Las pruebas backend cubren casos felices y rechazos relevantes.
- Se documentó explícitamente que los errores client-facing deben salir como `ConvexError`.
- Queda pendiente asegurar que todas las pantallas frontend muestren estos errores con una experiencia consistente.

### 4. Riesgo de acceso indebido por rol o membresía

Al depurar flujos de trips y chats, el riesgo importante no era solamente que una pantalla fallara, sino que un usuario pudiera leer o modificar información de un viaje al que no pertenece. Esto aplica especialmente a chats generales, chats de trabajadores y cambios de estado de trips.

La remediación fue mover las decisiones de autorización al backend:

- `getCurrentCompanyUserOrThrow` valida roles `COMPANY` o `ADMIN`.
- `tripMembershipOrThrow` valida membresía de un usuario en un trip.
- `assertChatAccess` bloquea acceso de turistas al chat `WORKERS`.
- `createTrip`, `updateTripStatus`, `listMessages` y `sendMessage` aplican estas reglas antes de devolver o modificar datos.

Justificación:

- La UI puede ocultar botones, pero no debe ser la barrera real de seguridad.
- Las reglas compartidas en helpers reducen duplicación.
- Las pruebas backend pueden simular identidades y roles con precisión.

Control posterior:

- `convex/trips.test.ts` valida rechazo de turistas, participantes desconocidos, tours de otra compañía y visibilidad por membresía.
- `convex/chats.test.ts` valida acceso a chats por rol, bloqueo de no miembros, orden de mensajes y paginación.

### 5. Riesgo de performance por consultas no indexadas o resultados no controlados

El material de Semana 16 menciona performance como parte de la calidad. En este MVP, el riesgo observado en backend era hacer búsquedas con filtros no indexados o cargar colecciones de manera innecesaria.

La remediación aplicada fue definir índices en `convex/schema.ts` para los accesos frecuentes:

- `users.by_tokenIdentifier`
- `users.by_email`
- `tours.by_companyId`
- `trips.by_tourId`
- `tripMembers.by_userId`
- `tripMembers.by_tripId`
- `tripMembers.by_tripId_and_userId`
- `chats.by_tripId`
- `chats.by_tripId_and_kind`
- `messages.by_chatId`

También se usa paginación en `listMessages` mediante `paginationOptsValidator`.

Justificación:

- Las consultas por índice son más predecibles conforme crece el MVP.
- La paginación evita cargar todos los mensajes de un chat.
- Se reduce el riesgo de problemas de performance que solo aparecen con más datos.

Control posterior:

- Se revisó que las funciones usen `.withIndex()` en las búsquedas principales.
- Queda como mejora futura limitar o paginar más listados si el volumen de trips o tours crece.

### 6. Warnings de ESLint relacionados con render y efectos

El análisis estático no encontró errores, pero sí 6 warnings:

- `components/ThemeModeFab.tsx`: uso de componente dinámico (`ThemeIcon`) creado durante render.
- `components/lib/useCurrentUser.ts`: llamadas a `setState` dentro de efectos.
- `components/useClientOnlyValue.web.ts`: patrón heredado del starter para cambiar valor client/server con efecto.

Decisión posterior:

No se bloquearon commits ni pruebas por estos warnings porque la configuración del proyecto los mantiene como `warn`, no como `error`. Esta decisión ya está documentada en `eslint.config.js`: son reglas nuevas y estrictas de `react-hooks` que hacen visible un riesgo sin romper el flujo de desarrollo.

Justificación:

- Los warnings son útiles para performance y estabilidad, pero no todos representan bugs inmediatos.
- En un MVP, convertirlos directamente en errores puede bloquear trabajo sin impacto proporcional.
- Mantenerlos visibles permite priorizarlos en una iteración de hardening.

Acciones recomendadas:

- En `ThemeModeFab.tsx`, reemplazar la asignación de componente dinámico por render condicional directo o por componentes declarados fuera del render.
- En `useCurrentUser`, revisar si el estado `hasEnsuredUser` puede derivarse de `userId`/auth o manejarse con una transición menos propensa a renders encadenados.
- En `useClientOnlyValue.web.ts`, evaluar si el patrón sigue siendo necesario o si puede reemplazarse por una alternativa compatible con Expo Router.

### 7. Falta de pruebas frontend automatizadas

El proyecto tiene configurado `test:frontend`, pero no se encontraron archivos frontend `*.test.tsx` o una suite React Native Testing Library activa. Esto no impide validar el backend, pero sí deja algunos riesgos de UI sin cobertura automatizada.

Decisión posterior:

Se documenta como limitación aceptada del MVP. La prioridad actual fue cubrir reglas de negocio, autorización y persistencia en Convex, porque son áreas de mayor impacto si fallan. La UI se apoya por ahora en lint, revisión manual y flujo de Expo.

Justificación:

- La pirámide de testing vista en clase recomienda muchas pruebas unitarias y de integración antes de depender de E2E.
- Para este MVP, las reglas críticas están en backend y son más fáciles de probar de forma determinista.
- Las pruebas frontend deben agregarse cuando se estabilicen los flujos visuales principales.

Próximas pruebas sugeridas:

- `useCurrentUser`: estados `loading`, `signedOut`, `needsOnboarding`, `onboarded`.
- `app/_layout.tsx`: redirecciones por grupo de ruta.
- Formularios de onboarding, creación de tour y creación de trip: validación visual de errores y llamadas a mutations.
- Pantalla de trip/chat: visibilidad de chats según rol.

## Resumen para stakeholders

El MVP ya cuenta con controles importantes de calidad en backend. Las funciones críticas no confían en IDs enviados por el frontend, derivan identidad desde Clerk/Convex, validan reglas de negocio, usan índices para búsquedas frecuentes y tienen pruebas automatizadas con buena cobertura.

La principal brecha actual está en frontend: no existe todavía una suite automatizada para navegación, formularios y renderizado de estados. Para una entrega temprana, esta brecha puede aceptarse si se acompaña con revisión manual y reportes de bugs. Para una entrega más cercana a QA formal, conviene agregar pruebas de componentes y flujos críticos.

## Criterio de control interno propuesto

Para mantener consistencia en futuras iteraciones, cada cambio relevante debería documentar:

1. Problema o riesgo identificado.
2. Herramienta o actividad que lo detectó.
3. Cambio aplicado.
4. Justificación técnica o de calidad.
5. Evidencia de verificación.
6. Riesgo residual o siguiente acción.

Este criterio permite que el equipo no solo corrija bugs, sino que deje trazabilidad de por qué se tomaron decisiones y qué queda pendiente antes de escalar a QA o stakeholders.
