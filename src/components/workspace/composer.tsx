"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, ShieldCheck, Square, Volume2, VolumeX } from "lucide-react";
import { useAgentStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

interface ComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function Composer({ onSend, onStop, isStreaming }: ComposerProps) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const settings = useAgentStore((state) => state.settings);
  const updateSettings = useAgentStore((state) => state.updateSettings);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setValue("");
  };

  const toggleMic = () => {
    if (typeof window === "undefined") return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setValue((current) => (current ? current : "当前浏览器不支持语音输入，请使用 Chrome / Edge。"));
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");
      if (transcript) setValue((current) => `${current}${current ? " " : ""}${transcript}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="relative border-t border-line bg-[#070b16]/85 px-3 py-3 backdrop-blur-xl sm:px-5">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "rounded-2xl border bg-[#0b1222] p-2 transition",
            listening ? "border-mint/50 shadow-mint" : "border-line focus-within:border-brand/45",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="描述你的目标，例如：帮我制定两周复习计划，检索学习方法并创建三个待办…"
            className="w-full resize-none bg-transparent px-2.5 py-1.5 text-[13.5px] leading-6 text-slate-100 outline-none placeholder:text-slate-600"
          />

          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMic}
                aria-label={listening ? "停止语音输入" : "语音输入"}
                title="语音输入（Web Speech API）"
                className={cn(
                  "relative rounded-lg p-2 transition",
                  listening
                    ? "bg-mint/15 text-mint"
                    : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
                )}
              >
                <Mic className="h-4 w-4" />
                {listening && <span className="absolute inset-0 animate-pulse-ring rounded-lg border border-mint/50" />}
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ voiceOutput: !settings.voiceOutput })}
                aria-label="切换语音朗读"
                title={settings.voiceOutput ? "已开启回答朗读" : "开启回答朗读"}
                className={cn(
                  "rounded-lg p-2 transition",
                  settings.voiceOutput
                    ? "bg-brand/15 text-brand-soft"
                    : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
                )}
              >
                {settings.voiceOutput ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ requireApproval: !settings.requireApproval })}
                title="写入类工具执行前是否需要人工确认"
                className={cn(
                  "ml-1 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10.5px] transition",
                  settings.requireApproval
                    ? "border-amber/25 bg-amber/[0.08] text-amber"
                    : "border-line text-slate-500 hover:text-slate-300",
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {settings.requireApproval ? "人工确认开启" : "自动执行"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] text-slate-600 sm:inline">Enter 发送 · Shift+Enter 换行</span>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/[0.04] px-3 py-2 text-xs text-slate-300 transition hover:border-white/25"
                >
                  <Square className="h-3.5 w-3.5" />
                  停止
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!value.trim()}
                  aria-label="发送"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-soft hover:text-[#0a0f1d] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-slate-600">
          AI 可能出错，请核对重要信息 · 写入类操作会先请求你的确认 · 密钥仅保存在本机
        </p>
      </div>
    </div>
  );
}
