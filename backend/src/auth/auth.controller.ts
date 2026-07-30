import { Controller, Post, Body, Get, Delete, Param, Query, UseGuards, Req, UnauthorizedException, Sse } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Sse('events')
  sseEvents(): Observable<any> {
    return this.authService.getEventsObservable();
  }

  @Post('login')
  async login(@Req() req, @Body() body: { usuario: string; clave: string; clientIp?: string }) {
    if (!body.usuario || !body.clave) {
      throw new UnauthorizedException('Debe ingresar usuario y contraseña');
    }

    const user = await this.authService.validateUser(body.usuario, body.clave);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const rawUserAgent = req.headers['user-agent'] || 'Navegador Web Desconocido';

    let browser = 'Navegador Web';
    if (rawUserAgent.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (rawUserAgent.includes('Edg/')) browser = 'Microsoft Edge';
    else if (rawUserAgent.includes('Chrome/')) browser = 'Google Chrome';
    else if (rawUserAgent.includes('Safari/')) browser = 'Apple Safari';
    else if (rawUserAgent.includes('OPR/') || rawUserAgent.includes('Opera/')) browser = 'Opera';

    let os = 'Desconocido';
    if (rawUserAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (rawUserAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (rawUserAgent.includes('Mac OS X')) os = 'macOS';
    else if (rawUserAgent.includes('Android')) os = 'Android';
    else if (rawUserAgent.includes('iPhone') || rawUserAgent.includes('iPad')) os = 'iOS';
    else if (rawUserAgent.includes('Linux')) os = 'Linux';

    const dispositivoDetallado = `${browser} (${os})`;

    const rawIp =
      body.clientIp ||
      req.headers['cf-connecting-ip'] ||
      (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
      req.ip ||
      req.connection?.remoteAddress ||
      '127.0.0.1';

    let ip = typeof rawIp === 'string' ? rawIp.replace(/^.*:/, '').trim() : '127.0.0.1';
    if (ip === '1' || ip === 'localhost') ip = '127.0.0.1';

    return this.authService.login(user, dispositivoDetallado, ip);
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: number; refresh_token: string }) {
    if (!body.userId || !body.refresh_token) {
      throw new UnauthorizedException('Parámetros de renovación faltantes');
    }
    return this.authService.refreshTokens(body.userId, body.refresh_token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sessions')
  async getSessions(
    @Req() req,
    @Query('estado') estado?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.authService.getUserSessions(
      req.user.id,
      estado,
      page ? Number(page) : 1,
      limit ? Number(limit) : 5,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('sessions/:id')
  async revokeSession(@Req() req, @Param('id') id: string) {
    return this.authService.revokeSession(req.user.id, Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req) {
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.logout(req.user.id, userAgent);
  }
}
