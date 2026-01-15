"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { ChatMessage, QuickActionKey } from "@/types/chat";
import { QuickActions } from "./QuickActions";
import { MessageBubble } from "./MessageBubble";
import { ReflectionCard, type ReflectionResult } from "./ReflectionCard";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function gentleReplyForQuickAction(key: QuickActionKey) {
  if (key === "progress")
    return "好。我们不看那些冷冰冰的数字总额，看点具体的：你离上次想去的那个地方，或者那个小目标，是不是又近了一步？哪怕只是今天多攒了一杯咖啡钱，也算。";

  if (key === "expense")
    return "记一笔不是为了审判，是为了看清。这笔钱花出去的时候，你的心情是「终于买到了」的释然，还是「下意识下单」的麻木？跟我说说，我陪你理一下。";

  return "外面声音确实太吵了。是房贷的压力让你睡不着，还是担心手里的资产缩水？别怕，我们把窗户关上，只看跟你有关的这一部分。";
}

export function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      content:
        "晚上好。辛苦了。\n理财不需要每天都紧绷着，今晚我们只做一点点「清晰」的工作。你想从哪儿聊起？",
      ts: Date.now(),
    },
  ]);

  const [draft, setDraft] = useState("");
  const [showReflection, setShowReflection] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const headerLine = useMemo(() => {
    return "你可以随便说。也可以只说一句：今天想轻松一点，还是想更有掌控感一点？";
  }, []);

  const push = (role: "assistant" | "user", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uid(), role, content, ts: Date.now() },
    ]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const onPick = (key: QuickActionKey) => {
    push("user", ({
      progress: "想看一眼我的梦想进度",
      expense: "刚花了一笔钱，想对齐一下",
      noise: "市场有点吵，帮我过滤一下",
    } as const)[key]);

    // 先给共情/承接，再引导（符合你之前的 timing 建议）
    push("assistant", gentleReplyForQuickAction(key));

    // 仅当用户选择「支出对齐」，我们再给一个「可选」的反思卡入口（不强弹）
    if (key === "expense") {
      setTimeout(() => setShowReflection(true), 600);
    }
  };

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    push("user", text);

    // Phase 1：更具感性的关键词捕捉
    if (/花|买|消费|付了|转账|火锅|奶茶|相机/.test(text)) {
      push(
        "assistant",
        "我接收到了。先不去想这笔钱该不该花，先问问你的心：它让你此刻感到幸福或满足吗？\n如果还没想清楚，我们可以用这张小卡片，温柔地安放这段情绪。"
      );
      setTimeout(() => setShowReflection(true), 700);
    } else if (/累|烦|压力|不知道/.test(text)) {
      push(
        "assistant",
        "听起来你今天承载了很多。理财的本质是理生活，如果生活累了，我们就先停下数字，聊聊怎么让你舒服一点。"
      );
    } else {
      push(
        "assistant",
        "我在听。你是觉得当下的节奏有点乱，还是单纯想找个人复盘一下？我会陪着你的速度。"
      );
    }
  };

  const onReflectionSubmit = (r: ReflectionResult) => {
    setShowReflection(false);
    push(
      "user",
      `【反思卡】动机：${r.motive}；靠近目标：${r.closerToGoal}；明天后悔：${r.regretTomorrow}`
    );
    push(
      "assistant",
      "谢谢你把它说清楚。\n这不是审判，是把「冲动」变成「清晰」。我们下次会更容易做选择。"
    );
  };

  const onReflectionSkip = () => {
    setShowReflection(false);
    push("assistant", "可以跳过的。先照顾好你自己，我们随时再回来。");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">YouYu · 理财助手</p>
            <h1 className="text-2xl font-semibold text-slate-50">聊聊</h1>
            <p className="mt-1 text-xs text-slate-400">{headerLine}</p>
          </div>
          <Link className="text-sm text-slate-200 underline" href="/dashboard">
            返回看板
          </Link>
        </header>

        <QuickActions onPick={onPick} />

        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/30 overflow-hidden">
          <div className="max-h-[55vh] overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}

            {showReflection ? (
              <div className="pt-2">
                <ReflectionCard
                  onSubmit={onReflectionSubmit}
                  onSkip={onReflectionSkip}
                />
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-800/60 p-3 bg-slate-950/40">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
                placeholder="你可以随便问，也可以只说一句：我今天有点累。"
                className="flex-1 rounded-xl border border-slate-800/60 bg-slate-950/30 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-300/30"
              />
              <button
                onClick={onSend}
                className="rounded-xl px-4 py-3 text-sm text-slate-50 border border-indigo-300/30 bg-indigo-400/15 hover:bg-indigo-400/20 transition"
              >
                发送
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

