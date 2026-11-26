import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssistantModule } from './assistant/assistant.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AssistantModule],
})
export class AppModule {}
