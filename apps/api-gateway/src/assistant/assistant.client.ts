import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { assistant } from '@car-rental/contracts';

@Injectable()
export class AssistantClient implements OnModuleInit {
  private assistantService: assistant.AssistantServiceClient;

  constructor(
    @Inject(assistant.ASSISTANT_PACKAGE_NAME)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.assistantService =
      this.client.getService<assistant.AssistantServiceClient>(
        assistant.ASSISTANT_SERVICE_NAME,
      );
  }

  chat(request: assistant.ChatRequest) {
    return lastValueFrom(this.assistantService.chat(request));
  }
}
