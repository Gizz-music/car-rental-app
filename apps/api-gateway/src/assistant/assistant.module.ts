import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { assistant, assistantGrpcOptions } from '@car-rental/contracts';
import { AuthModule } from '../auth/auth.module';
import { AssistantClient } from './assistant.client';
import { AssistantHttpController } from './assistant.controller';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: assistant.ASSISTANT_PACKAGE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: assistantGrpcOptions(
            config.getOrThrow<string>('ASSISTANT_GRPC_URL'),
          ),
        }),
      },
    ]),
  ],
  controllers: [AssistantHttpController],
  providers: [AssistantClient],
})
export class AssistantModule {}
