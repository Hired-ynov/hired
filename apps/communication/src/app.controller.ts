import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('ping')
  ping() {
    return this.appService.getPing();
  }

  @MessagePattern('message.create')
  async createMessage(@Payload() data: { content: string; sender: string }) {
    return await this.appService.create(data);
  }

  @MessagePattern('message.findAll')
  async getMessages() {
    return await this.appService.findAll();
  }

  @MessagePattern('message.findOne')
  async getMessage(@Payload() data: { id: string }) {
    return await this.appService.findOne({ id: data.id });
  }
}
