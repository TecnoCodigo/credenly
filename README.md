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

Este repositorio contiene la solución completa de la actividad de Programación 4 desarrollada con **NestJS (Backend REST + JWT)**, **MySQL 8.0**, y **React + Vite + TailwindCSS (Frontend Responsive)**.

---

## 📁 Estructura del Monorepo

- `doc/`: Documentación académica del proyecto (Roles, datos del grupo, script `.sql`, manual de usuario).
- `infra/`: Configuraciones de despliegue en Cloudflare (Workers / Pages / CI/CD Actions).
- `backend/`: API REST en NestJS con TypeORM, JWT y Refresh Tokens hash en MySQL.
- `frontend/`: Aplicación web responsiva en React con Vite, TailwindCSS e interceptores Axios.
- `docker-compose.yml`: Orquestación multi-contenedor para entorno local.

---

## 🚀 Inicio Rápido

Consulta el guía detallada en [doc/MANUAL_USUARIO.md](doc/MANUAL_USUARIO.md) o ejecuta:

```bash
docker-compose up -d --build
```
