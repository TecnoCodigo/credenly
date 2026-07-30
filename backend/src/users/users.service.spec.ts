import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repoMock: any;

  const mockUser: User = {
    id: 1,
    nombre: 'Nelson Ruiz',
    usuario: 'admin',
    clave: '$2b$10$xyz',
    correo: 'admin@universidad.edu.ve',
    telefono: '+58 414-1234567',
    rol: 'Administrador',
    refreshTokenHash: null,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  };

  beforeEach(async () => {
    repoMock = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findByUsuario debe retornar un usuario si existe', async () => {
    repoMock.findOne.mockResolvedValue(mockUser);
    const result = await service.findByUsuario('admin');
    expect(result).toEqual(mockUser);
    expect(repoMock.findOne).toHaveBeenCalledWith({ where: { usuario: 'admin' } });
  });

  it('findById debe retornar un usuario por su ID', async () => {
    repoMock.findOne.mockResolvedValue(mockUser);
    const result = await service.findById(1);
    expect(result).toEqual(mockUser);
    expect(repoMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('setRefreshToken debe actualizar el hash del refresh token', async () => {
    repoMock.update.mockResolvedValue({ affected: 1 });
    await service.setRefreshToken(1, 'hashed_token');
    expect(repoMock.update).toHaveBeenCalledWith(1, { refreshTokenHash: 'hashed_token' });
  });
});
