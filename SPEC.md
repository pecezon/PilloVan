# Especificación del Proyecto (SPEC.md)

## Nombre del Proyecto
Plataforma de Coordinación para la Industria Turística Local (PilloVan)

## Problemática
La industria turística local en la Riviera Maya sufre de falta de coordinación y eficiencia operativa. La coordinación de tours, vehículos y conductores se maneja con hojas de cálculo y mensajes, resultando en retrasos, errores y baja optimización de recursos.

## Objetivo General
Desarrollar una plataforma B2B (end-to-end) de despacho y coordinación logística para la industria turística local en la Riviera Maya.

## Objetivos Específicos
- **Centralizar información:** Base de datos única para inventario de tours, vehículos y conductores.
- **Automatización de procesos:** Módulo de dispatching para asignar vehículos y conductores dinámicamente.
- **Comunicación instantánea:** Integración con servicio de mensajería (WhatsApp) para confirmaciones.
- **Monitoreo:** Panel de control en tiempo real para estatus y ubicación aproximada de servicios activos.

## Alcance
- [ ] Gestión de administradores (CRUD de Tours, Vans y Conductores).
- [ ] Asignación de Servicios (manual y sugerida).
- [ ] Asistencia de despacho (algoritmo simple de disponibilidad).
- [ ] Comunicación básica (mensajes y confirmaciones).
- [ ] Monitoreo (panel de control de servicios activos).

## Limitaciones
- No se desarrollará app móvil.
- No se implementará seguimiento GPS en tiempo real (solo manual/aproximado).
- Solo en inglés (sin soporte multilenguaje).
- No automatización avanzada con IA.

## Arquitectura y Diseño
- Arquitectura Cliente-Servidor. Frontend y Backend separados.
- **Frontend:** React JS, TailwindCSS, HeroUI, TanStack Query, React Router, Google Libphonenumber.
- **Backend:** Node.js, Express.
- **DB:** PostgreSQL, Prisma ORM, Supabase (Auth).
- **Despliegue:** Render.

## Diseño de la Base de Datos
Esquema centralizado en `schema.prisma`.
- **users**: auth_id, firstName, lastName, email (unique), role (TOURIST, WORKER, COMPANY, ADMIN).
- **Tour**: name, place, occupancy, companyId. (Pertenece a company, tiene múltiples Trips).
- **Trip**: pickup_time, pickup_location, status (PENDING, IN_PROGRESS, etc.), whatsApp_group_link.
- **TripUsers**: Tabla pivote (tripId, userId, role) llave compuesta.

## Roles
- **ADMIN**: Asigna roles a empresas.
- **COMPANY**: Puede crear y editar tours y trips.
- **WORKER**: Trabajadores asignados.
- **TOURIST**: Solo accede a información de sus viajes (Rol por default).
