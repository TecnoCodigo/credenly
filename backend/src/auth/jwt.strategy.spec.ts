import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { Session } from './session.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersServiceMock: any;
  let sessionsRepoMock: any;

  const mockUser = {
    id: 1,
    nombre: 'Nelson Ruiz',
    usuario: 'admin',
    clave: '$2b$10$xyz',
    refreshTokenHash: 'hash',
  };

  const mockSession = {
    id: 10,
    usuarioId: 1,
    estado: 'Activa',
  };

  beforeEach(async () => {
    usersServiceMock = {
      findById: jest.fn(),
    };

    sessionsRepoMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('supersecret_access_key_p4_2026'),
          },
        },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: getRepositoryToken(Session), useValue: sessionsRepoMock },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('debe estar definido', () => {
    expect(strategy).toBeDefined();
  });

  it('debe validar y retornar el usuario sin la clave ni refreshTokenHash si la sesión está activa', async () => {
    usersServiceMock.findById.mockResolvedValue(mockUser);
    sessionsRepoMock.findOne.mockResolvedValue(mockSession);

    const payload = { sub: 1, usuario: 'admin', sessionId: 10 };
    const result = await strategy.validate({} as any, payload);

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect((result as any).clave).toBeUndefined();
    expect((result as any).refreshTokenHash).toBeUndefined();
  });

  it('debe lanzar UnauthorizedException si la sesión ha sido revocada', async () => {
    usersServiceMock.findById.mockResolvedValue(mockUser);
    sessionsRepoMock.findOne.mockResolvedValue(null);

    const payload = { sub: 1, usuario: 'admin', sessionId: 10 };
    await expect(strategy.validate({} as any, payload)).rejects.toThrow(UnauthorizedException);
  });
});
