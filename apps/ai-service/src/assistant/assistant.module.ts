import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { carRental, carRentalGrpcOptions } from '@car-rental/contracts';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { KnowledgeStore } from './knowledge.store';
import { LlmClient } from './llm.client';
import { RentalToolsService } from './rental-tools.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: carRental.CAR_RENTAL_PACKAGE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: carRentalGrpcOptions(
            config.getOrThrow<string>('CAR_RENTAL_GRPC_URL'),
          ),
        }),
      },
    ]),
  ],
  controllers: [AssistantController],
  providers: [AssistantService, KnowledgeStore, LlmClient, RentalToolsService],
})
export class AssistantModule {}
