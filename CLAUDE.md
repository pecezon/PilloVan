# Instrucciones del Proyecto (CLAUDE.md)

Este documento contiene las reglas generales, convenciones y directrices para el asistente de IA al trabajar en el proyecto PilloVan.

## Comandos Personalizados
- `/load-project`: Lee CLAUDE.md, SPEC.md y WORKLOG.md en ese orden. El asistente debe responder con un resumen del estado actual, qué estaba en progreso y el próximo paso. No debe escribir código hasta recibir aprobación.
- `/review-code`: Revisa el código recién escrito con mentalidad de senior developer estricto. Evalúa: 1) Bugs/Edge cases, 2) Cumplimiento de CLAUDE.md, 3) Simplificación (over-engineering), 4) Manejo de errores, 5) Riesgos en producción. El asistente será directo y claro.
- `/new-feature [descripción]`: Inicia la implementación de una nueva feature. Primero genera un plan para describir el approach. Al ser aprobado, implementa en orden: Backend (modelo -> repo -> controlador -> ruta) y luego Frontend (UI, React Query, Supabase).
- `/fix-bug [descripción]`: Diagnostica y arregla un bug. El asistente responderá con: 1) Causa probable, 2) Archivos involucrados, y 3) El fix mínimo necesario. Promete estrictamente NO arreglar nada más allá del bug reportado y mostrar el diff exacto de los cambios a realizar.
- `/update-worklog`: Actualiza WORKLOG.md al terminar la sesión. Incluye: Fecha, Qué implementamos (lista de lo hecho), Qué quedó en progreso, Bloqueos y Próximos pasos por prioridad.
- `/add-reference [tema]`: Agrega a REFERENCES.md un snippet de ejemplo para un nuevo patrón o librería. Incluye: Cuándo usar el patrón, snippet mínimo funcional y gotchas/detalles importantes, manteniendo el estilo existente.
- `/update-spec [cambio]`: Actualiza SPEC.md ante cambios de diseño o alcance. Asegura: 1) Marcar [x] features implementadas, 2) Agregar nuevas con [ ], 3) Actualizar modelo de datos, 4) Actualizar endpoints.
- `/agent [rol]`: Invoca un sub-agente experto para revisar código bajo un enfoque específico:
  - `security`: Busca SQL injection, mala autenticación, secrets, inputs no sanitizados y JWT mal configurado. Reporta con severidad.
  - `dba`: DBA experto en PostgreSQL. Revisa queries eficientes/índices, normalización, N+1 queries con Prisma.
  - `qa`: QA Engineer. Genera casos de prueba manuales y estructurados basados en el plan de pruebas (Happy path y Sad path).
  - `frontend`: Experto en React/UX. Evalúa manejo de estado, Tailwind, HeroUI, y experiencia de usuario.

## Stack Tecnológico (PilloVan)
- **Frontend**: React JS, TailwindCSS, HeroUI, React Router, TanStack Query, Supabase Auth.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL.
- **Base de Datos**: PostgreSQL + Prisma, Supabase (Autenticación y manejo de sesiones).

## Convenciones Generales
- Mantener el código modular, limpio y bien estructurado.
- Usar async/await para operaciones asíncronas y bloques try/catch en los controladores.
- Usar Tailwind CSS y HeroUI para el diseño visual, garantizando consistencia.
- Prisma se encarga de la interacción con la DB, no usar consultas SQL manuales.
- Separar completamente la presentación del backend. El backend funciona exclusivamente como API REST devolviendo JSON.
- No desarrollar app móvil, ni GPS en tiempo real completo (solo aproximado/manual), ni soporte multilenguaje (solo inglés).

## Proceso de Trabajo
1. Analizar requerimientos y la base de código actual antes de proponer soluciones.
2. Hacer cambios iterativos, pequeños y testeables.
3. Asegurarse de actualizar `WORKLOG.md` al completar tareas importantes o al terminar una sesión de trabajo.
