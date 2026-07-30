import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Session } from './session.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;
  let sessionsRepoMock: any;

  const mockUser = {
    id: 1,
    nombre: 'Nelson Ruiz',
    usuario: 'admin',
    clave: '$2b$10$xyz',
    correo: 'admin@universidad.edu.ve',
    telefono: '+58 414-1234567',
    rol: 'Administrador',
    refreshTokenHash: '$2b$10$tokenHash',
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  };

  const mockSession = {
    id: 10,
    usuarioId: 1,
    dispositivo: 'Google Chrome (Windows 10/11)',
    ipAcceso: '127.0.0.1',
    estado: 'Activa',
    creadoEn: new Date(),
  };

  beforeEach(async () => {
    usersServiceMock = {
      findByUsuario: jest.fn(),
      findById: jest.fn(),
      setRefreshToken: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
      decode: jest.fn().mockReturnValue({ sessionId: 10 }),
    };

    configServiceMock = {
      get: jest.fn((key: string, defaultValue: string) => defaultValue),
    };

    sessionsRepoMock = {
      create: jest.fn().mockReturnValue(mockSession),
      save: jest.fn().mockResolvedValue(mockSession),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockSession]),
        getOne: jest.fn().mockResolvedValue(mockSession),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: getRepositoryToken(Session), useValue: sessionsRepoMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getEventsObservable', () => {
    it('debe emitir eventos y permitir desuscripción', (done) => {
      const observable = service.getEventsObservable();
      const subscription = observable.subscribe((event) => {
        expect(event).toBeDefined();
        subscription.unsubscribe();
        done();
      });
      // Emitir un evento de prueba
      (service as any).sessionEventsSubject.next({ userId: 1, sessionId: 10 });
    });
  });

  describe('validateUser', () => {
    it('debe retornar datos del usuario sin contraseña si la clave coincide', async () => {
      usersServiceMock.findByUsuario.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.validateUser('admin', 'Password123!');
      expect(result).toBeDefined();
      expect(result.clave).toBeUndefined();
      expect(result.usuario).toBe('admin');
    });

    it('debe retornar null si las credenciales son incorrectas', async () => {
      usersServiceMock.findByUsuario.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const result = await service.validateUser('admin', 'wrongpass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('debe registrar sesión en BD y generar tokens JWT', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => '$2b$10$hashedtoken');

      const result = await service.login(mockUser, 'Google Chrome (Windows 10/11)', '190.97.237.75');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(sessionsRepoMock.create).toHaveBeenCalled();
      expect(sessionsRepoMock.save).toHaveBeenCalled();
      expect(usersServiceMock.setRefreshToken).toHaveBeenCalledWith(1, '$2b$10$hashedtoken');
    });
  });

  describe('getUserSessions', () => {
    it('debe retornar las sesiones paginadas y contadas (todas)', async () => {
      const result = await service.getUserSessions(1, 'todas', 1, 5);
      expect(result.data).toEqual([mockSession]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('debe filtrar sesiones por estado específico', async () => {
      const result = await service.getUserSessions(1, 'Activa', 1, 5);
      expect(sessionsRepoMock.createQueryBuilder().andWhere).toHaveBeenCalled();
      expect(result.total).toBe(1);
    });
  });

  describe('revokeSession', () => {
    it('debe actualizar el estado de la sesión a Finalizada', async () => {
      sessionsRepoMock.findOne.mockResolvedValue(mockSession);
      const result = await service.revokeSession(1, 10);
      expect(sessionsRepoMock.update).toHaveBeenCalledWith(10, { estado: 'Finalizada' });
      expect(result).toEqual({ message: 'Sesión revocada correctamente' });
    });
  });

  describe('refreshTokens', () => {
    it('debe renovar el access token si el refresh token coincide', async () => {
      usersServiceMock.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.refreshTokens(1, 'valid_refresh_token');
      expect(result).toHaveProperty('access_token');
    });

    it('debe lanzar UnauthorizedException si no se encuentra el usuario', async () => {
      usersServiceMock.findById.mockResolvedValue(null);
      await expect(service.refreshTokens(1, 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el refresh token es inválido', async () => {
      usersServiceMock.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      await expect(service.refreshTokens(1, 'invalid_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('debe limpiar el refresh token y marcar la sesión del navegador como finalizada (Firefox)', async () => {
      const result = await service.logout(1, 'Mozilla Firefox/120.0');
      expect(usersServiceMock.setRefreshToken).toHaveBeenCalledWith(1, null);
      expect(sessionsRepoMock.update).toHaveBeenCalledWith(10, { estado: 'Finalizada' });
      expect(result).toEqual({ message: 'Sesión cerrada correctamente' });
    });

    it('debe identificar Microsoft Edge', async () => {
      await service.logout(1, 'Mozilla/5.0 Edg/119.0');
      expect(sessionsRepoMock.createQueryBuilder().andWhere).toHaveBeenCalledWith('session.dispositivo LIKE :browser', { browser: '%Microsoft Edge%' });
    });

    it('debe identificar Google Chrome', async () => {
      await service.logout(1, 'Mozilla/5.0 Chrome/119.0');
      expect(sessionsRepoMock.createQueryBuilder().andWhere).toHaveBeenCalledWith('session.dispositivo LIKE :browser', { browser: '%Google Chrome%' });
    });

    it('debe identificar Apple Safari', async () => {
      await service.logout(1, 'Mozilla/5.0 Safari/605.1.15');
      expect(sessionsRepoMock.createQueryBuilder().andWhere).toHaveBeenCalledWith('session.dispositivo LIKE :browser', { browser: '%Apple Safari%' });
    });
  });
});
