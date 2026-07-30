# Distribución de Roles del Equipo - Programación 4

**Unidad Curricular:** Programación 4  
**Docente:** Nelson Ruiz  
**Ponderación:** 25%  
**Modalidad:** Online  

---

## Integrantes y Asignación de Roles

### 1. Administrador de Base de Datos (DBA)
- **Responsabilidades:** 
  - Diseñar el modelo relacional de la tabla `usuarios` en MySQL.
  - Generar el script DDL/DML `doc/database.sql` con restricción de unicidad, tipos de datos óptimos e inserción de datos iniciales.
  - Asegurar la persistencia e integridad de datos en el entorno local (Docker) y en producción (Cloudflare D1 / MySQL).

### 2. Desarrollador Backend (NestJS / Node.js & ORM)
- **Responsabilidades:**
  - Configuración de la conexión a MySQL usando **TypeORM / NestJS**.
  - Implementación de la lógica de autenticación con contraseñas encriptadas (`bcrypt`).
  - Emisión, verificación y rotación de tokens seguros: `access_token` (JWT corta duración) y `refresh_token` (larga duración).
  - Creación de endpoints REST (`/auth/login`, `/auth/refresh`, `/auth/profile`, `/auth/logout`) protegidos con Guards/Middleware.

### 3. Desarrollador UI (Frontend React)
- **Responsabilidades:**
  - Maquetación y diseño estético en **React + Vite** de las vistas principales (`Login` y `Perfil`).
  - Creación de componentes modulares (Formularios, Tarjetas de Usuario, Botones de Acción, Avisos de Error).
  - Implementación de interceptores HTTP (Axios) para adjuntar tokens automáticamente y manejar la sesión de usuario.

### 4. Especialista en Responsividad (CSS & UI Adaptive)
- **Responsabilidades:**
  - Configuración del framework responsive **TailwindCSS** y reglas personalizadas (Media Queries `@media`).
  - Garantizar adaptabilidad total (100% Responsive) para smartphones (320px+), tablets (768px+) y monitores de escritorio (1024px+).
  - Implementación de animaciones sutiles, estados de hover/focus y modo visual optimizado.
