export interface ChatCitation {
  title: string;
  source: string;
}

export interface ChatResponse {
  answer: string;
  citations: ChatCitation[];
  usedLlm: boolean;
}

export interface ChatRequest {
  message: string;
}
