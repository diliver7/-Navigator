/**
 * Human-in-the-loop 审批通道。
 * Agent 流式响应在等待用户确认时会挂起，客户端通过 /api/agent/approve 回传结果，
 * 服务端使用进程内 Map 完成 Promise 解锁（开发/演示环境单实例）。
 */

type Resolver = (approved: boolean) => void;

const globalStore = globalThis as unknown as {
  __navigatorApprovals?: Map<string, Resolver>;
};

const approvals = (globalStore.__navigatorApprovals ??= new Map<string, Resolver>());

export function waitForApproval(id: string, signal?: AbortSignal, timeoutMs = 120_000): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;

    const finish = (approved: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      approvals.delete(id);
      resolve(approved);
    };

    const timer = setTimeout(() => finish(false), timeoutMs);
    const onAbort = () => finish(false);
    signal?.addEventListener("abort", onAbort, { once: true });

    approvals.set(id, finish);
  });
}

export function resolveApproval(id: string, approved: boolean): boolean {
  const finish = approvals.get(id);
  if (!finish) return false;
  finish(approved);
  return true;
}

export function hasPendingApproval(id: string): boolean {
  return approvals.has(id);
}
