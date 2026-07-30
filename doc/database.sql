-- ======================================================
-- SCRIPT DE BASE DE DATOS - PROGRAMACIÓN 4
-- Proyecto: Módulo de Autenticación y Perfil de Usuario
-- ======================================================

CREATE DATABASE IF NOT EXISTS `sistema_autenticacion` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `sistema_autenticacion`;

-- ------------------------------------------------------
-- Estructura de la tabla `usuarios`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `sesiones`;

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario` VARCHAR(50) NOT NULL UNIQUE,
    `clave` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL UNIQUE,
    `telefono` VARCHAR(20) NOT NULL,
    `rol` VARCHAR(30) NOT NULL DEFAULT 'Usuario',
    `refresh_token_hash` VARCHAR(255) NULL,
    `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Estructura de la tabla `sesiones` (Historial Real de Accesos)
-- ------------------------------------------------------
CREATE TABLE `sesiones` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `dispositivo` VARCHAR(255) NOT NULL,
    `ip_acceso` VARCHAR(45) NOT NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'Sesión Actual',
    `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Datos de Prueba Iniciales
-- Nota: La contraseña de ambos usuarios de prueba es: Password123!
-- El hash almacenado corresponde a bcrypt de 'Password123!'
-- ------------------------------------------------------

INSERT INTO
    `usuarios` (
        `usuario`,
        `clave`,
        `nombre`,
        `correo`,
        `telefono`,
        `rol`,
        `creado_en`
    )
VALUES (
        'admin',
        '$2b$10$3Spkg63edAoyiHesqn3KdOAyHK5HzOyhIN798cLA4ugSCAW1bINl2',
        'Ronald Vizcaya',
        'contacto@ronaldvizcaya.com',
        '+58 414-1956381',
        'Administrador',
        '2026-07-29 10:30:00'
    ),
    (
        'estudiante',
        '$2b$10$3Spkg63edAoyiHesqn3KdOAyHK5HzOyhIN798cLA4ugSCAW1bINl2',
        'Carlos Perez',
        'carlos.perez@estudiante.edu.ve',
        '+58 412-1234567',
        'Estudiante',
        '2026-07-30 14:15:00'
    );