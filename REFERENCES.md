# Referencias y Patrones de Arquitectura (REFERENCES.md)

Este documento centraliza los patrones de diseño, convenciones de nombres e implementaciones de referencia para PilloVan.

## Backend (Node.js + Express + Prisma)

### Patrón de Arquitectura
1. **Model**: Schema de Prisma (`schema.prisma`)
2. **Controller/Route**: Rutas de Express que implementan lógica y realizan consultas asíncronas con Prisma.

### Manejo de API REST
- GET para obtener información, POST para crear, PUT para actualizar, DELETE para eliminar.
- Devolver consistentes objetos JSON y códigos de estado (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal Error).
- Todas las operaciones a DB son asíncronas con `async/await` envueltas en `try/catch`.

**Ejemplo de Controlador:**
```javascript
router.get("/get-tours-by-company/:companyId", async (req, res) => {
  const companyId = req.params.companyId;
  try {
    const getTours = await prisma.tour.findMany({
      where: { companyId: companyId },
    });
    return res.status(200).json(getTours);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
```

### Seguridad
- Autenticación manejada por Supabase Auth + Auth0 en frontend.
- Cero contraseñas almacenadas directamente en Prisma.
- Creación de usuario en tabla local correlacionado por `id` de Auth.

## Frontend (React + Vite)

### Tecnologías Clave
- UI: Tailwind CSS y HeroUI.
- Estado asíncrono: TanStack Query (cacheo y peticiones).
- Formularios/Télefonos: Google Libphonenumber.

### Peticiones y Manejo de Estado
- Consumo de API REST usando validaciones, manejando correctamente loading y estados de error.
- Separación de responsabilidades: los componentes de visualización y las llamadas a la red.

## Base de Datos (Prisma)
- Definición clara de las relaciones (1-a-Muchos, Muchos-a-Muchos usando pivotes como `TripUsers`).

**Ejemplo de Consulta Asíncrona (Prisma):**
```javascript
const trips = await prisma.trip.findMany({
  where: {
    users: { some: { userId: userId } },
    status: { in: ["IN_PROGRESS", "PENDING"] },
  },
  include: {
    users: { select: { user: true } },
    tour: true,
  },
  orderBy: { pickup_time: "asc" },
});
```
