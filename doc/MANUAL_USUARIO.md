# Manual de Usuario e Instalación - Sistema de Autenticación P4

## Requisitos Previos
- Node.js (v18+)
- Docker y Docker Compose (opción recomendada para BD local)
- MySQL 5.7 (si se ejecuta sin Docker)

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

## ☁️ Despliegue Automatizado (CI/CD)

El sistema ya no depende de despliegues manuales, todo se ejecuta de manera automatizada a través de un flujo de integración y entrega continua (CI/CD) utilizando **GitHub Actions**.

### ¿Cómo funciona el despliegue a producción?
Cada vez que se hace un *Push* a la rama `main` del repositorio, se activa automáticamente un flujo (`deploy.yml`) que realiza los siguientes pasos de forma estrictamente secuencial:

1. **Aprovisionamiento con Terraform**: Conecta con Google Cloud Platform y aplica el estado de Terraform, garantizando que la red VPC, el motor de base de datos de Compute Engine (MySQL 5.7), las reglas del cortafuegos y el registro de contenedores estén creados y actualizados.
2. **Construcción de Imágenes**: Se ejecuta `docker build` en el directorio de `backend` y se sube de manera segura a Google Artifact Registry.
3. **Despliegue Serverless**: Se actualiza el servicio de **Google Cloud Run** inyectando la nueva imagen de contenedor, de manera que la API en la nube esté ejecutando la última versión del código de manera elástica y segura.
4. **Despliegue del Frontend**: Se descargan e instalan las dependencias de Node.js, se hace un _build_ del código en React con las variables de entorno inyectadas que enlazan con el nuevo backend de Cloud Run, y finalmente se empujan todos los archivos estáticos hacia un proyecto de **Cloudflare Pages** configurado para servir al usuario de la manera más rápida posible.

Gracias a esta arquitectura orientada a *DevOps* moderno, tú como usuario o desarrollador solo tienes que centrarte en hacer tus commits; la infraestructura y el paso a la nube se ajustan solos de forma inmediata.
