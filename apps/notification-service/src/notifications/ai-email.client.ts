import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailCopy {
  subject: string;
  intro: string;
}

export interface EmailCopyRequest {
  bookingId: number;
  situation: string;
  facts: string;
}

const SYSTEM_PROMPT = [
  'Ты пишешь короткие служебные письма сервиса аренды автомобилей.',
  'Язык — русский.',
  'Верни только JSON без пояснений: {"subject":"...","intro":"..."}',
  'subject — тема до 100 символов, без переносов.',
  'intro — одно или два предложения о том, что произошло.',
  'Не перечисляй дату, цену и номер брони: их добавит система отдельной таблицей.',
  'Не выдумывай факты. Не используй HTML и Markdown.',
].join('\n');

// Тема и вступление письма. null — модель не настроена или не ответила.
@Injectable()
export class AiEmailClient {
  private readonly logger = new Logger(AiEmailClient.name);
  private reportedDisabled = false;

  constructor(private readonly config: ConfigService) {}

  async composeCopy(request: EmailCopyRequest): Promise<EmailCopy | null> {
    const apiKey = this.config.get<string>('LLM_API_KEY')?.trim();
    const baseUrl = this.config.get<string>('LLM_BASE_URL')?.trim();

    if (!apiKey && !baseUrl) {
      this.reportDisabled();
      return null;
    }

    const url = `${(baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`;
    const model = this.config.get<string>('LLM_MODEL')?.trim() || 'gpt-4o-mini';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        signal: AbortSignal.timeout(this.timeoutMs()),
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 300,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `${request.situation}\n\n${request.facts}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        this.logger.warn(
          `LLM declined email for booking ${request.bookingId}: HTTP ${response.status}`,
        );
        return null;
      }

      const copy = parseEmailCopy(readMessageContent(await response.json()));
      if (!copy) {
        this.logger.warn(
          `LLM returned an unreadable email for booking ${request.bookingId}`,
        );
        return null;
      }

      return copy;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `LLM unavailable for booking ${request.bookingId}: ${message}`,
      );
      return null;
    }
  }

  private timeoutMs(): number {
    const value = Number(this.config.get<string>('LLM_TIMEOUT_MS') ?? 8000);
    return Number.isFinite(value) && value > 0 ? value : 8000;
  }

  private reportDisabled(): void {
    if (this.reportedDisabled) {
      return;
    }
    this.reportedDisabled = true;
    this.logger.warn(
      'LLM is not configured (set LLM_API_KEY or LLM_BASE_URL). Emails use templates.',
    );
  }
}

const readMessageContent = (body: unknown): string | null => {
  if (typeof body !== 'object' || body === null || !('choices' in body)) {
    return null;
  }

  const { choices } = body;
  if (!Array.isArray(choices)) {
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

const parseEmailCopy = (raw: string | null): EmailCopy | null => {
  if (!raw) {
    return null;
  }

  const jsonText = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  if (!('subject' in parsed) || !('intro' in parsed)) {
    return null;
  }

  if (typeof parsed.subject !== 'string' || typeof parsed.intro !== 'string') {
    return null;
  }

  const subject = parsed.subject.replace(/\s+/g, ' ').trim();
  const intro = parsed.intro.replace(/\s+/g, ' ').trim();

  if (subject.length < 3 || subject.length > 140) {
    return null;
  }
  if (intro.length < 3 || intro.length > 400) {
    return null;
  }
  if (/[<>]/.test(subject) || /[<>]/.test(intro)) {
    return null;
  }

  return { subject, intro };
};
