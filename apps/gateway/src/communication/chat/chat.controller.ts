import { Controller, Get, Param } from '@nestjs/common';

@Controller('communication/chat')
export class ChatController {
  @Get('/:id/messages')
  getMessages(@Param('id') chatId: string): { chatId: string; messages: [] } {
    return { chatId, messages: [] };
  }

  //@Post("/:id/messages")
  //postMessage(@Param('id') chatId: string, @Body() messageDto: any) {}
}
