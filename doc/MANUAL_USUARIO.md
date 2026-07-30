# Manual de Usuario e Instalación - Sistema de Autenticación P4

## Requisitos Previos
- Node.js (v18+)
- Docker y Docker Compose (opción recomendada para BD local)
- MySQL 8.0 (si se ejecuta sin Docker)

---

## 🚀 Ejecución Rápida con Docker Compose

1. Clonar o extraer el proyecto en la carpeta de preferencia.
2. Copiar el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Ejecutar los contenedores en segundo plano:
   ```bash
   docker-compose up -d --build
   ```
4. El sistema estará disponible en:
   - **Frontend (React UI):** `http://localhost:3000`
   - **Backend API (NestJS):** `http://localhost:4000/api`
   - **MySQL BD:** `localhost:3306`

---

## 🔑 Credenciales de Prueba por Defecto

| Usuario | Contraseña | Rol | Correo |
| :--- | :--- | :--- | :--- |
| `admin` | `Password123!` | Administrador | admin@universidad.edu.ve |
| `estudiante` | `Password123!` | Estudiante | carlos.perez@estudiante.edu.ve |

---

## ☁️ Despliegue en Cloudflare (Frontend & Workers)

1. En la carpeta `infra/`, utilizar el CLI de Cloudflare (`wrangler`):
   ```bash
   npx wrangler pages deploy ../frontend/dist --project-name=sistema-autenticacion-p4
   ```
2. Para el backend serverless o Cloudflare Worker:
   ```bash
   npx wrangler deploy
   ```
