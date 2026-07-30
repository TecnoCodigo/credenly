import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { User } from './users/user.entity';
import { Session } from './auth/session.entity';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'p4_user'),
        password: config.get<string>('DB_PASSWORD', 'p4_password'),
        database: config.get<string>('DB_NAME', 'sistema_autenticacion'),
        entities: [User, Session],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Session]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [UsersService, AuthService, JwtStrategy],
})
export class AppModule { }
