import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { assistant } from '@car-rental/contracts';
import { KnowledgeStore, type RankedChunk } from './knowledge.store';
import { LlmClient } from './llm.client';
import { RentalToolsService } from './rental-tools.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly knowledge: KnowledgeStore,
    private readonly llm: LlmClient,
    private readonly tools: RentalToolsService,
  ) {}

  async chat(request: assistant.ChatRequest): Promise<assistant.ChatResponse> {
    const message = request.message?.trim() ?? '';
    if (message.length < 2) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Message is too short',
      });
    }

    const chunks = this.knowledge.retrieve(message);
    const extra: string[] = [];

    if (this.tools.wantsFleet(message)) {
      const fleet = await this.tools.fleetSnapshot();
      if (fleet) {
        extra.push(fleet);
      }
    }

    if (this.tools.wantsBookings(message) && request.userId) {
      const bookings = await this.tools.bookingsSnapshot(request.userId);
      if (bookings) {
        extra.push(bookings);
      }
    }

    const context = buildContext(chunks, extra);
    const generated = await this.llm.complete(
      `CONTEXT:\n${context}\n\nQUESTION:\n${message}`,
    );

    return {
      answer: generated ?? fallbackAnswer(chunks, extra),
      citations: uniqueCitations(chunks),
      usedLlm: Boolean(generated),
    };
  }
}

const buildContext = (chunks: RankedChunk[], extra: string[]): string => {
  const articles = chunks
    .map((chunk) => `### ${chunk.title} (${chunk.source})\n${chunk.text}`)
    .join('\n\n');

  return [articles, ...extra].filter(Boolean).join('\n\n');
};

const fallbackAnswer = (chunks: RankedChunk[], extra: string[]): string => {
  if (chunks.length === 0 && extra.length === 0) {
    return 'I could not find this in the rental rules. Open Cars to pick dates or Profile to manage bookings.';
  }

  const fromDocs = chunks
    .slice(0, 2)
    .map((chunk) => chunk.text)
    .join(' ');
  const live = extra.join(' ');
  return [fromDocs, live].filter(Boolean).join('\n\n').slice(0, 1200);
};

const uniqueCitations = (chunks: RankedChunk[]): assistant.Citation[] => {
  const seen = new Set<string>();
  const citations: assistant.Citation[] = [];

  for (const chunk of chunks) {
    const key = `${chunk.title}:${chunk.source}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    citations.push({ title: chunk.title, source: chunk.source });
  }

  return citations;
};
