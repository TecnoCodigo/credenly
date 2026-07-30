# 🎓 Proyecto Módulo de Autenticación & Perfil Responsive (Programación 4)

**Docente:** Nelson Ruiz  
**Ponderación:** 25%  
**Modalidad:** Online  

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
