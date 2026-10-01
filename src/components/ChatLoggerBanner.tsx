"use client";

import React, { useState } from "react";
import { 
  ChatTeardropDots, 
  Copy, 
  Check, 
  Sparkle,
  ArrowRight
} from "@phosphor-icons/react";

export const ChatLoggerBanner: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const sampleQuotes = [
    "Ran 2m @ 12kph, walked 2m @ 3kph for 5 sets. Squats 3x15 @ 50kg.",
    "Bench press 4x8 @ 75kg, Dumbbell rows 3x12 @ 26kg.",
    "Rowing machine 500m x 4 intervals with 90s rest, Planks 3x60s.",
  ];

  const handleCopy = (text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 mb-8">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20 shrink-0 mt-0.5">
          <ChatTeardropDots size={20} weight="bold" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-100">
              AI-Powered Conversational Logging
            </h3>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
              <Sparkle size={10} className="text-lime-400" /> Active Assistant
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-2xl">
            No rigid forms to fill out in the gym. Whenever you finish a session, just drop your raw notes into our chat (e.g. intervals, weights, reps, or RPE). Antigravity parses the numbers, recalculates volume and paces, and updates this live dashboard automatically.
          </p>

          {/* Quick Quote Examples */}
          <div className="mt-3.5 pt-3 border-t border-zinc-800/50">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
              Try dropping formats like these in chat:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQuotes.map((quote) => (
                <button
                  key={quote}
                  type="button"
                  onClick={() => handleCopy(quote)}
                  className="text-left text-xs font-mono bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 group cursor-pointer"
                  title="Click to copy example"
                >
                  <span className="truncate max-w-[280px] sm:max-w-md">"{quote}"</span>
                  {copiedText === quote ? (
                    <Check size={12} className="text-lime-400 shrink-0" weight="bold" />
                  ) : (
                    <Copy size={12} className="text-zinc-400 group-hover:text-zinc-200 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
