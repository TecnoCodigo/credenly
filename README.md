# Credenly (PROYECTO ESTUDIANTIL UPTJAA T3-F1 IF-04)

# Datos del Grupo de Trabajo

**Materia:** Programación 4  
**Profesor:** Nelson Ruiz  
**Proyecto:** Módulo de Autenticación de Usuarios (Login) y Perfil Responsive  


---

## Integrantes del Grupo (4 Integrantes)

1. **Integrante 1 (DBA):** [Yelianni Herrera] - C.I: [ V-30.615.188]
2. **Integrante 2 (Backend):** [Ronald Vizcaya] - C.I: [ V-26.384.967 ]
3. **Integrante 3 (Frontend UI):** [Ricardo Prado] - C.I: [ V-28.658.757 ]
4. **Integrante 4 (Responsividad UI):** [Elias Estrabao] - C.I: [ V-26.896.160 ]

Este repositorio contiene la solución completa de la actividad de Programación 4 desarrollada con **NestJS (Backend REST + JWT)**, **MySQL 5.7**, y **React + Vite + TailwindCSS (Frontend Responsive)**.

---

## ☁️ Arquitectura e Infraestructura en la Nube

El proyecto implementa una arquitectura moderna orientada a la nube (Cloud-Native), desplegada de manera 100% automatizada mediante **Infraestructura como Código (IaC)** e **Integración y Despliegue Continuo (CI/CD)**.

### Tecnologías y Servicios Utilizados:

1. **Frontend (Capa de Presentación):** 
   - Desarrollado en **React, Vite y TailwindCSS**.
   - Desplegado en **Cloudflare Pages**, una red de distribución de contenido (CDN) global que ofrece los estáticos desde el borde (edge) de forma instantánea.

2. **Backend (Capa de Lógica de Negocio y API REST):** 
   - Desarrollado en **Node.js (NestJS)** con **TypeORM**.
   - Empaquetado en Docker (almacenado en **Google Artifact Registry**) y desplegado en **Google Cloud Run** (Arquitectura Serverless). Se autoescala de manera elástica según la demanda.

3. **Base de Datos (Capa de Persistencia):**
   - Motor relacional **MySQL 5.7** corriendo dentro de un contenedor Docker.
   - Alojado en una máquina virtual **Google Compute Engine (e2-micro)** conectada a una subred de datos privada en Google Cloud (VPC), protegida con reglas estrictas de Firewall.

4. **Automatización y DevOps:**
   - La provisión de los recursos en Google Cloud (Redes, Instancias, Registros, Cloud Run y Permisos) es orquestada por **Terraform** (`infra/terraform`).
   - Todo el proceso, desde construir el código hasta aplicar la infraestructura y actualizar los servicios de Google Cloud y Cloudflare, ocurre sin intervención humana gracias a los flujos automatizados de **GitHub Actions**.

---

## 📁 Estructura del Monorepo

- `doc/`: Documentación académica del proyecto (Roles, datos del grupo, script `.sql`, manual de usuario).
- `infra/`: Código de infraestructura en **Terraform** y flujos de despliegue (`.github/workflows`).
- `backend/`: API REST en NestJS con TypeORM, JWT y Hash de contraseñas.
- `frontend/`: Aplicación SPA en React con Axios e interceptores de seguridad.
- `docker-compose.yml`: Orquestación multi-contenedor para pruebas y desarrollo local.

---

## 🚀 Inicio Rápido

Consulta el guía detallada en [doc/MANUAL_USUARIO.md](doc/MANUAL_USUARIO.md) o ejecuta:

```bash
docker-compose up -d --build
```
