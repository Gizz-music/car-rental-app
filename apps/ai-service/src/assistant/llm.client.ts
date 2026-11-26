import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SYSTEM_PROMPT = [
  'You are the in-app assistant of a car rental service.',
  'Answer in the same language as the user.',
  'Use only the CONTEXT block. Do not invent cars, prices, bookings, or discounts.',
  'If CONTEXT does not contain the answer, say you do not know and point the user to Cars or Profile.',
  'Keep the answer short (at most two short paragraphs).',
  'Do not use HTML.',
].join('\n');

@Injectable()
export class LlmClient {
  private readonly logger = new Logger(LlmClient.name);
  private reportedDisabled = false;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    const apiKey = this.config.get<string>('LLM_API_KEY')?.trim();
    const baseUrl = this.config.get<string>('LLM_BASE_URL')?.trim();
    return Boolean(apiKey || baseUrl);
  }

  async complete(userPrompt: string): Promise<string | null> {
    if (!this.isConfigured()) {
      this.reportDisabled();
      return null;
    }

    const apiKey = this.config.get<string>('LLM_API_KEY')?.trim();
    const baseUrl = (
      this.config.get<string>('LLM_BASE_URL')?.trim() ||
      'https://api.openai.com/v1'
    ).replace(/\/$/, '');
    const model = this.config.get<string>('LLM_MODEL')?.trim() || 'gpt-4o-mini';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        signal: AbortSignal.timeout(this.timeoutMs()),
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 400,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        this.logger.warn(`LLM declined chat: HTTP ${response.status}`);
        return null;
      }

      const content = readMessageContent(await response.json());
      const text = content?.replace(/\s+/g, ' ').trim() ?? '';
      return text.length >= 3 ? text : null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`LLM unavailable: ${message}`);
      return null;
    }
  }

  private timeoutMs(): number {
    const value = Number(this.config.get<string>('LLM_TIMEOUT_MS') ?? 20000);
    return Number.isFinite(value) && value > 0 ? value : 20000;
  }

  private reportDisabled(): void {
    if (this.reportedDisabled) {
      return;
    }
    this.reportedDisabled = true;
    this.logger.warn(
      'LLM is not configured (set LLM_API_KEY or LLM_BASE_URL). Answers use the knowledge base.',
    );
  }
}

const readMessageContent = (body: unknown): string | null => {
  if (typeof body !== 'object' || body === null || !('choices' in body)) {
    return null;
  }

  const { choices } = body;
  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  const first: unknown = choices[0];
  if (typeof first !== 'object' || first === null || !('message' in first)) {
    return null;
  }

  const { message } = first;
  if (
    typeof message !== 'object' ||
    message === null ||
    !('content' in message)
  ) {
    return null;
  }

  return typeof message.content === 'string' ? message.content : null;
};
