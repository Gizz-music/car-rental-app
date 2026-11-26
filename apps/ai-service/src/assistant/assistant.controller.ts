import { Controller } from '@nestjs/common';
import { assistant } from '@car-rental/contracts';
import { AssistantService } from './assistant.service';

@Controller()
@assistant.AssistantServiceControllerMethods()
export class AssistantController
  implements assistant.AssistantServiceController
{
  constructor(private readonly assistantService: AssistantService) {}

  chat(request: assistant.ChatRequest) {
    return this.assistantService.chat(request);
  }
}
