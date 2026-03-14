import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('communication')
@Controller('communication')
export class CommunicationController {
  constructor(
    @Inject(microservices.symbols.COMMUNICATION_SERVICE)
    private readonly communicationService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Ping' })
  @ApiResponse({ status: 201, description: 'Ping réussi' })
  @Get('ping')
  ping() {
    return this.communicationService.send<string, string>('ping', 'ping');
  }

  @ApiOperation({ summary: 'Envoyer un message' })
  @ApiResponse({ status: 201, description: 'Message envoyé' })
  @Post('messages')
  createMessage(@Body() body: { content: string; sender: string }) {
    return this.communicationService.send('message.create', body);
  }

  @ApiOperation({ summary: 'Récupérer tout les messages' })
  @ApiResponse({ status: 201, description: 'Messages récupérés' })
  @Get('messages')
  getMessages() {
    return this.communicationService.send('message.findAll', {});
  }
}
