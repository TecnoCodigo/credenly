import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Subject, Observable } from 'rxjs';
import { UsersService } from '../users/users.service';
import { Session } from './session.entity';

@Injectable()
export class AuthService {
  private sessionEventsSubject = new Subject<{ userId: number; sessionId?: number }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) { }

  getEventsObservable(): Observable<any> {
    return new Observable((observer) => {
      const subscription = this.sessionEventsSubject.subscribe((data) => {
        observer.next({ data: JSON.stringify(data) });
      });
      return () => subscription.unsubscribe();
    });
  }

  async validateUser(usuario: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsuario(usuario);
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.clave);
      if (isMatch) {
        const { clave, refreshTokenHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any, userAgent: string = 'Navegador Web', ip: string = '127.0.0.1') {
    const nuevaSesion = this.sessionsRepository.create({
      usuarioId: user.id,
      dispositivo: userAgent,
      ipAcceso: ip || '127.0.0.1',
      estado: 'Activa',
    });
    const sesionGuardada = await this.sessionsRepository.save(nuevaSesion);

    const payload = { sub: user.id, usuario: user.usuario, rol: user.rol, sessionId: sesionGuardada.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'supersecret_access_key_p4_2026'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '900s'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'supersecret_refresh_key_p4_2026'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashedRefreshToken);

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async getUserSessions(userId: number, estado?: string, page: number = 1, limit: number = 10) {
    const query = this.sessionsRepository.createQueryBuilder('session')
      .where('session.usuario_id = :userId', { userId });

    if (estado && estado !== 'todas') {
      query.andWhere('session.estado = :estado', { estado });
    }

    query.orderBy('session.estado = "Activa"', 'DESC')
      .addOrderBy('session.creado_en', 'DESC');

    const total = await query.getCount();
    const sesiones = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: sesiones,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async revokeSession(userId: number, sessionId: number) {
    const sesion = await this.sessionsRepository.findOne({
      where: { id: sessionId, usuarioId: userId },
    });

    if (sesion) {
      await this.sessionsRepository.update(sessionId, { estado: 'Finalizada' });
      // Emitir evento Server-Sent Event (SSE) instantáneo
      this.sessionEventsSubject.next({ userId, sessionId });
    }

    return { message: 'Sesión revocada correctamente' };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const decoded: any = this.jwtService.decode(refreshToken);
    const payload = {
      sub: user.id,
      usuario: user.usuario,
      rol: user.rol,
      sessionId: decoded?.sessionId
    };

    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'supersecret_access_key_p4_2026'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '900s'),
    });

    return {
      access_token: newAccessToken,
    };
  }

  async logout(userId: number, userAgent: string = '') {
    await this.usersService.setRefreshToken(userId, null);

    let browser = '';
    if (userAgent.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (userAgent.includes('Edg/')) browser = 'Microsoft Edge';
    else if (userAgent.includes('Chrome/')) browser = 'Google Chrome';
    else if (userAgent.includes('Safari/')) browser = 'Apple Safari';

    const query = this.sessionsRepository.createQueryBuilder('session')
      .where('session.usuario_id = :userId', { userId })
      .andWhere('session.estado = :estado', { estado: 'Activa' });

    if (browser) {
      query.andWhere('session.dispositivo LIKE :browser', { browser: `%${browser}%` });
    }

    const sesionEspecifica = await query.orderBy('session.creado_en', 'DESC').getOne();

    if (sesionEspecifica) {
      await this.sessionsRepository.update(sesionEspecifica.id, { estado: 'Finalizada' });
      this.sessionEventsSubject.next({ userId, sessionId: sesionEspecifica.id });
    }

    return { message: 'Sesión cerrada correctamente' };
  }
}
