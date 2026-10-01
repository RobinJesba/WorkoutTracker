"use client";

import React, { useState } from "react";
import { TrainerFeedback } from "@/types/workout";
import { 
  ChatCircleText, 
  CheckCircle, 
  Target, 
  PaperPlaneTilt,
  Sparkle
} from "@phosphor-icons/react";

interface TrainerFeedbackProps {
  feedback?: TrainerFeedback;
  sessionId: string;
  isTrainerView: boolean;
}

export const TrainerFeedbackSection: React.FC<TrainerFeedbackProps> = ({
  feedback,
  sessionId,
  isTrainerView,
}) => {
  const [commentInput, setCommentInput] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmittedFeedback(commentInput);
    setCommentInput("");
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChatCircleText size={16} className="text-lime-400" weight="bold" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
            Coach Review & Directives
          </span>
        </div>
        {feedback && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={12} weight="fill" /> Session Approved
          </span>
        )}
      </div>

      {feedback && (
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-200">{feedback.coachName}</span>
              <span className="text-zinc-400 text-[11px]">({feedback.coachRole})</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">{feedback.date}</span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            "{feedback.comment}"
          </p>

          {feedback.nextTarget && (
            <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-start gap-2 text-xs">
              <Target size={14} className="text-lime-400 shrink-0 mt-0.5" weight="bold" />
              <div>
                <span className="font-mono text-[10px] uppercase text-lime-400 tracking-wider font-semibold block">
                  Next Progression Target
                </span>
                <span className="text-zinc-200">{feedback.nextTarget}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {submittedFeedback && (
        <div className="mt-3 bg-zinc-950/80 border border-lime-400/30 rounded-xl p-3 text-xs text-zinc-200">
          <div className="flex items-center gap-1.5 text-lime-400 font-mono text-[11px] mb-1 font-semibold">
            <Sparkle size={12} /> Coach Note Added:
          </div>
          "{submittedFeedback}"
        </div>
      )}

      {/* Interactive note composer when in Trainer View */}
      {isTrainerView && (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Leave coaching cue or target for Robin..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-3 py-2 rounded-lg bg-lime-400 text-zinc-950 text-xs font-semibold hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
            >
              <PaperPlaneTilt size={13} weight="bold" />
              <span>Post Cue</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
