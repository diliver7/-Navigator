"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentSettings, ChatMessage, MemoryFact, Session } from "@/types/agent";
import { uid } from "@/lib/utils";

const DEFAULT_TITLE = "新的学习任务";

const defaultSettings: AgentSettings = {
  apiKey: "",
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-chat",
  requireApproval: true,
  voiceOutput: false,
};

interface AgentState {
  sessions: Session[];
  activeSessionId: string | null;
  settings: AgentSettings;
  memory: MemoryFact[];
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  createSession: (title?: string) => string;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;

  appendMessage: (sessionId: string, message: ChatMessage) => void;
  patchMessage: (
    sessionId: string,
    messageId: string,
    patch: Partial<ChatMessage> | ((message: ChatMessage) => Partial<ChatMessage>),
  ) => void;

  updateSettings: (patch: Partial<AgentSettings>) => void;
  resetApiKey: () => void;
  addMemory: (text: string, source: string) => void;
  removeMemory: (id: string) => void;
  clearAll: () => void;
}

function createSessionEntity(title = DEFAULT_TITLE): Session {
  const now = Date.now();
  return {
    id: uid("session"),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      settings: defaultSettings,
      memory: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      createSession: (title) => {
        const session = createSessionEntity(title);
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 30),
          activeSessionId: session.id,
        }));
        return session.id;
      },

      selectSession: (id) => {
        if (get().sessions.some((session) => session.id === id)) {
          set({ activeSessionId: id });
        }
      },

      deleteSession: (id) => {
        set((state) => {
          const sessions = state.sessions.filter((session) => session.id !== id);
          const activeSessionId =
            state.activeSessionId === id ? sessions[0]?.id ?? null : state.activeSessionId;
          return { sessions, activeSessionId };
        });
      },

      renameSession: (id, title) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, title: title.slice(0, 40) } : session,
          ),
        }));
      },

      appendMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, messages: [...session.messages, message], updatedAt: Date.now() }
              : session,
          ),
        }));
      },

      patchMessage: (sessionId, messageId, patch) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session;
            return {
              ...session,
              updatedAt: Date.now(),
              messages: session.messages.map((message) => {
                if (message.id !== messageId) return message;
                const next = typeof patch === "function" ? patch(message) : patch;
                return { ...message, ...next };
              }),
            };
          }),
        }));
      },

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      resetApiKey: () => set((state) => ({ settings: { ...state.settings, apiKey: "" } })),

      addMemory: (text, source) => {
        const value = text.trim().slice(0, 80);
        if (!value) return;
        set((state) => {
          if (state.memory.some((fact) => fact.text === value)) return state;
          const fact: MemoryFact = { id: uid("memory"), text: value, source, createdAt: Date.now() };
          return { memory: [fact, ...state.memory].slice(0, 12) };
        });
      },

      removeMemory: (id) => set((state) => ({ memory: state.memory.filter((fact) => fact.id !== id) })),

      clearAll: () =>
        set({
          sessions: [],
          activeSessionId: null,
          memory: [],
          settings: defaultSettings,
        }),
    }),
    {
      name: "navigator-agent-store",
      version: 1,
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        settings: state.settings,
        memory: state.memory,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<AgentState>;
        const sessions = (saved.sessions ?? []).map((session) => ({
          ...session,
          messages: session.messages.map((message) => ({
            ...message,
            streaming: false,
            approvals: (message.approvals ?? []).map((approval) =>
              approval.status === "pending" ? { ...approval, status: "denied" as const } : approval,
            ),
            tools: (message.tools ?? []).map((tool) =>
              tool.status === "awaiting" || tool.status === "running"
                ? { ...tool, status: "error" as const }
                : tool,
            ),
          })),
        }));
        return { ...current, ...saved, sessions };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export { DEFAULT_TITLE };
