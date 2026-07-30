import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Session } from './session.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'supersecret_access_key_p4_2026'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: { sub: number; usuario: string; sessionId?: number }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o sesión inválida');
    }

    if (payload.sessionId) {
      const sesionEspecifica = await this.sessionsRepository.findOne({
        where: { id: payload.sessionId, usuarioId: user.id },
      });

      if (!sesionEspecifica || sesionEspecifica.estado !== 'Activa') {
        throw new UnauthorizedException('Esta sesión específica ha sido revocada o finalizada remotamente.');
      }
    }

    const { clave, refreshTokenHash, ...userWithoutSecrets } = user;
    return userWithoutSecrets;
  }
}
