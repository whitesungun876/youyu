"use client";

import type { ChatMessage } from "@/types/chat";

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          "border",
          isUser
            ? "bg-indigo-500/15 border-indigo-400/25 text-slate-50"
            : "bg-slate-950/40 border-slate-800/60 text-slate-100",
        ].join(" ")}
      >
        {msg.content}
      </div>
    </div>
  );
}

