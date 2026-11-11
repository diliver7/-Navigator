"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useAgentStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

type TestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const MODEL_OPTIONS = [
  { value: "deepseek-chat", label: "deepseek-chat · 推荐（支持工具调用）" },
  { value: "deepseek-reasoner", label: "deepseek-reasoner · 深度推理（工具能力有限）" },
];

export function ApiKeyDialog({ open, onClose }: ApiKeyDialogProps) {
  const settings = useAgentStore((state) => state.settings);
  const updateSettings = useAgentStore((state) => state.updateSettings);
  const resetApiKey = useAgentStore((state) => state.resetApiKey);

  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [model, setModel] = useState(settings.model);
  const [visible, setVisible] = useState(false);
  const [test, setTest] = useState<TestState>({ status: "idle" });

  useEffect(() => {
    if (!open) return;
    setApiKey(settings.apiKey);
    setBaseUrl(settings.baseUrl);
    setModel(settings.model);
    setTest({ status: "idle" });
    setVisible(false);
  }, [open, settings]);

  const testing = test.status === "testing";

  const handleTest = async () => {
    setTest({ status: "testing" });
    try {
      const response = await fetch("/api/test-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey.trim() ? { "x-deepseek-key": apiKey.trim() } : {}),
        },
        body: JSON.stringify({ baseUrl, model }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; reply?: string };
      if (response.ok && data.ok) {
        setTest({ status: "success", message: `连接成功，模型返回：${data.reply || "OK"}` });
      } else {
        setTest({ status: "error", message: data.error || "连接失败，请检查密钥" });
      }
    } catch {
      setTest({ status: "error", message: "无法连接本地服务，请确认开发服务器正在运行" });
    }
  };

  const handleSave = () => {
    updateSettings({
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || "https://api.deepseek.com",
      model: model || "deepseek-chat",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="可选增强设置"
      description="可选：填入自己的 DeepSeek API Key，让 58 篇方法笔记结合你的考试日期与作息组织成个性化计划。配置只保存在当前浏览器。"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-mint/20 bg-mint/[0.06] px-3.5 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
          <p className="text-[11.5px] leading-5 text-mint/90">
            密钥仅存入 <code className="rounded bg-black/30 px-1">localStorage</code>，每次请求通过
            <code className="mx-0.5 rounded bg-black/30 px-1">x-deepseek-key</code>
            请求头临时转发到本地服务，服务端不落盘、不写日志。公开部署时建议关闭自定义 Key 入口。
          </p>
        </div>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <KeyRound className="h-3.5 w-3.5 text-brand-soft" />
            DeepSeek API Key
          </span>
          <div className="relative">
            <input
              type={visible ? "text" : "password"}
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value);
                setTest({ status: "idle" });
              }}
              placeholder="留空即使用完整离线功能"
              spellCheck={false}
              autoComplete="off"
              className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 pr-11 font-mono text-xs text-slate-100 outline-none transition placeholder:font-sans placeholder:text-slate-600 focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={visible ? "隐藏密钥" : "显示密钥"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-white"
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <span className="mt-1.5 block text-[11px] text-slate-500">
            {settings.apiKey
              ? "当前使用你保存在本地的密钥。"
              : "当前为离线模式，58 篇方法笔记与全部功能已就绪；填写后将启用增强层。"}
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">Base URL</span>
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://api.deepseek.com"
              spellCheck={false}
              className="w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 font-mono text-xs text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">模型</span>
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="w-full rounded-xl border border-line bg-black/30 px-3 py-2.5 text-xs text-slate-100 outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0a1020]">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {test.status !== "idle" && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs",
              test.status === "success" && "border-mint/25 bg-mint/[0.06] text-mint",
              test.status === "error" && "border-rose-400/25 bg-rose-500/[0.07] text-rose-300",
              test.status === "testing" && "border-line bg-white/[0.03] text-slate-400",
            )}
          >
            {test.status === "testing" && <Loader2 className="mt-0.5 h-3.5 w-3.5 animate-spin" />}
            {test.status === "success" && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5" />}
            {test.status === "error" && <AlertCircle className="mt-0.5 h-3.5 w-3.5" />}
            <span>{test.status === "testing" ? "正在测试连接…" : test.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-brand-soft"
          >
            获取 DeepSeek API Key
            <ExternalLink className="h-3 w-3" />
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetApiKey();
                setApiKey("");
                setTest({ status: "idle" });
              }}
              className="rounded-xl px-3 py-2 text-xs text-slate-400 transition hover:text-white"
            >
              使用默认密钥
            </button>
            <button type="button" onClick={handleTest} disabled={testing} className="btn-ghost px-3.5 py-2 text-xs">
              {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              测试连接
            </button>
            <button type="button" onClick={handleSave} className="btn-primary px-4 py-2 text-xs">
              保存到本地
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
