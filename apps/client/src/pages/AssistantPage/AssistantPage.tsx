import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@consta/uikit/Button";
import { Text } from "@consta/uikit/Text";
import { TextField } from "@consta/uikit/TextField";

import { useChatMutation } from "@/features/assistant/api/assistantApi";
import type { ChatCitation } from "@/features/assistant/model/types";
import { getApiErrorMessage } from "@/shared/lib/apiError";

import styles from "./styles.module.css";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  citations?: ChatCitation[];
  usedLlm?: boolean;
}

export const AssistantPage = () => {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chat, { isLoading }] = useChatMutation();
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }
    thread.scrollTop = thread.scrollHeight;
  }, [messages, isLoading]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (message.length < 2 || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: message,
    };
    setMessages((current) => [...current, userMessage]);
    setDraft("");

    try {
      const response = await chat({ message }).unwrap();
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: response.answer,
          citations: response.citations,
          usedLlm: response.usedLlm,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: getApiErrorMessage(
            error,
            "Assistant is unavailable. Try again in a moment.",
          ),
        },
      ]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <Text as="h1" size="2xl" weight="semibold" view="primary">
          Assistant
        </Text>
        <Text size="s" view="secondary">
          Ask about booking rules, the fleet, or your reservations. Answers come
          from the knowledge base; the catalog and your bookings are loaded when
          the question needs them.
        </Text>
      </div>

      <div ref={threadRef} className={styles.thread} aria-live="polite">
        {messages.length === 0 ? (
          <Text size="s" view="secondary">
            Try: “How do I cancel?” or “Which cars are available?”
          </Text>
        ) : (
          messages.map((item) => (
            <article
              key={item.id}
              className={
                item.role === "user" ? styles.userBubble : styles.assistantBubble
              }
            >
              <Text size="s" view="primary">
                {item.text}
              </Text>
              {item.role === "assistant" && item.usedLlm === false ? (
                <Text size="xs" view="secondary">
                  Knowledge base (LLM is not configured)
                </Text>
              ) : null}
              {item.citations?.length ? (
                <ul className={styles.citations}>
                  {item.citations.map((citation) => (
                    <li key={`${citation.title}-${citation.source}`}>
                      <Text size="xs" view="secondary">
                        {citation.title}
                      </Text>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))
        )}
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <TextField
          width="full"
          placeholder="Your question"
          value={draft}
          disabled={isLoading}
          onChange={(value: string | null) => setDraft(value ?? "")}
        />
        <Button
          type="submit"
          label={isLoading ? "Thinking…" : "Send"}
          disabled={isLoading || draft.trim().length < 2}
        />
      </form>
    </div>
  );
};
