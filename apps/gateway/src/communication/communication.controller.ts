import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { microservices } from '@repo/rabbitmq-config';

@ApiTags('communication')
@Controller('communication')
export class CommunicationController {
  constructor(
    @Inject(microservices.symbols.COMMUNICATION_SERVICE)
    private readonly communicationService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Ping' })
  @ApiResponse({ description: 'Ping réussi', status: 201 })
  @Get('ping')
  ping() {
    return this.communicationService.send<string, string>('ping', 'ping');
  }

  @ApiOperation({ summary: 'Envoyer un message' })
  @ApiResponse({ description: 'Message envoyé', status: 201 })
  @Post('messages')
  createMessage(@Body() body: { content: string; sender: string }) {
    return this.communicationService.send('message.create', body);
  }

  @ApiOperation({ summary: 'Récupérer tout les messages' })
  @ApiResponse({ description: 'Messages récupérés', status: 201 })
  @Get('messages')
  getMessages() {
    return this.communicationService.send('message.findAll', {});
  }
}
