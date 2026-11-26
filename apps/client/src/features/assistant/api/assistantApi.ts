import { baseApi } from "@/shared/api/baseApi";

import type { ChatRequest, ChatResponse } from "../model/types";

export const assistantApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    chat: build.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({
        url: "assistant/chat",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useChatMutation } = assistantApi;
