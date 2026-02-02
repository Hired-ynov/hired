import { Controller, Get, Post, Body, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Controller('gateway')
export class GatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('API_SERVICE') private readonly apiService: ClientProxy,
    @Inject('COMMUNICATION_SERVICE')
    private readonly communicationService: ClientProxy,
    @Inject('CORE_SERVICE') private readonly coreService: ClientProxy,
    @Inject('FILES_SERVICE') private readonly filesService: ClientProxy,
  ) {}

  // Exemple d'appel au service d'authentification
  @Post('auth/login')
  async login(@Body() credentials: { email: string; password: string }) {
    try {
      const result = await firstValueFrom(
        this.authService
          .send({ cmd: 'login' }, credentials)
          .pipe(timeout(5000)),
      );
      return result;
    } catch (error) {
      throw new Error(`Auth service error: ${(error as Error).message}`);
    }
  }

  // Exemple d'appel au service API
  @Get('api/data')
  async getData() {
    try {
      const result = await firstValueFrom(
        this.apiService.send({ cmd: 'get_data' }, {}).pipe(timeout(5000)),
      );
      return result;
    } catch (error) {
      throw new Error(`API service error: ${(error as Error).message}`);
    }
  }

  // Exemple d'appel au service de communication
  @Post('communication/send')
  async sendMessage(@Body() message: any) {
    try {
      const result = await firstValueFrom(
        this.communicationService
          .send({ cmd: 'send_message' }, message)
          .pipe(timeout(5000)),
      );
      return result;
    } catch (error) {
      throw new Error(
        `Communication service error: ${(error as Error).message}`,
      );
    }
  }

  // Exemple avec emit (fire and forget)
  @Post('events/notify')
  async notifyEvent(@Body() eventData: any) {
    this.communicationService.emit('user.notification', eventData);
    return { status: 'Event emitted' };
  }

  // Health check pour chaque service
  @Get('health/:service')
  async checkServiceHealth(@Param('service') service: string) {
    const serviceMap = {
      auth: this.authService,
      api: this.apiService,
      communication: this.communicationService,
      core: this.coreService,
      files: this.filesService,
    };

    const client = serviceMap[service];
    if (!client) {
      return { status: 'error', message: 'Service not found' };
    }

    try {
      const result = await firstValueFrom(
        client.send({ cmd: 'health' }, {}).pipe(timeout(3000)),
      );
      return { status: 'healthy', service, result };
    } catch (error) {
      return {
        status: 'unhealthy',
        service,
        error: (error as Error).message,
      };
    }
  }
}
