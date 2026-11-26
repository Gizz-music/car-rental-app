import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { assistant } from '@car-rental/contracts';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../auth/jwt-auth.guard';
import { AssistantClient } from './assistant.client';
import { ChatDto } from './dto/chat.dto';

@UseGuards(JwtAuthGuard)
@Controller('assistant')
export class AssistantHttpController {
  constructor(private readonly assistantClient: AssistantClient) {}

  @Post('chat')
  chat(
    @Body() dto: ChatDto,
    @Req() { user }: AuthenticatedRequest,
  ): Promise<assistant.ChatResponse> {
    return this.assistantClient.chat({
      message: dto.message,
      userId: user.sub,
      email: user.email,
      name: user.name,
    });
  }
}
