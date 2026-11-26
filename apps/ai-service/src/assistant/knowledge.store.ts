import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export interface KnowledgeChunk {
  title: string;
  source: string;
  text: string;
}

export interface RankedChunk extends KnowledgeChunk {
  score: number;
}

const TITLE_LINE = /^#\s+(.+)$/m;

export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-zа-яё0-9]+/i)
    .filter((token) => token.length > 2);

export const scoreChunk = (queryTokens: string[], chunk: KnowledgeChunk) => {
  if (queryTokens.length === 0) {
    return 0;
  }

  const chunkTokens = new Set(tokenize(`${chunk.title} ${chunk.text}`));
  let hits = 0;
  for (const token of queryTokens) {
    if (chunkTokens.has(token)) {
      hits += 1;
    }
  }

  return hits / Math.sqrt(chunkTokens.size || 1);
};

export const rankChunks = (
  query: string,
  chunks: KnowledgeChunk[],
  limit: number,
): RankedChunk[] => {
  const queryTokens = tokenize(query);
  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(queryTokens, chunk) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

const chunkMarkdown = (source: string, markdown: string): KnowledgeChunk[] => {
  const title = markdown.match(TITLE_LINE)?.[1]?.trim() || source;
  const paragraphs = markdown
    .replace(TITLE_LINE, '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [{ title, source, text: markdown.trim() }];
  }

  return paragraphs.map((text) => ({ title, source, text }));
};

@Injectable()
export class KnowledgeStore implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeStore.name);
  private chunks: KnowledgeChunk[] = [];

  async onModuleInit() {
    const dir = join(__dirname, '..', 'knowledge');
    const names = (await readdir(dir)).filter((name) => name.endsWith('.md'));
    const files = await Promise.all(
      names.map(async (name) => ({
        name,
        markdown: await readFile(join(dir, name), 'utf8'),
      })),
    );

    this.chunks = files.flatMap(({ name, markdown }) =>
      chunkMarkdown(name, markdown),
    );
    this.logger.log(`Loaded ${this.chunks.length} knowledge chunks`);
  }

  retrieve(query: string, limit = 4): RankedChunk[] {
    return rankChunks(query, this.chunks, limit);
  }
}
