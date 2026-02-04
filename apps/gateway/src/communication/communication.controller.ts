import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('communication')
export class CommunicationController {
  constructor(
    @Inject('COMMUNICATION_SERVICE')
    private readonly communicationService: ClientProxy,
  ) {}

  @Get('ping')
  ping() {
    return this.communicationService.send<string, string>('ping', 'ping');
  }

  @Post('messages')
  createMessage(@Body() body: { content: string; sender: string }) {
    return this.communicationService.send('message.create', body);
  }

  @Get('messages')
  getMessages() {
    return this.communicationService.send('message.findAll', {});
  }
}
