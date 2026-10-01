"use client";

import React, { useState } from "react";
import { WorkoutSession } from "@/types/workout";
import { IntervalCardioVisualizer } from "./IntervalCardioVisualizer";
import { StrengthCard } from "./StrengthCard";
import { TrainerFeedbackSection } from "./TrainerFeedbackSection";
import { 
  CalendarBlank, 
  Clock, 
  Quotes, 
  CaretDown, 
  CaretUp,
  Fire,
  Heartbeat
} from "@phosphor-icons/react";

interface WorkoutSessionCardProps {
  session: WorkoutSession;
  isTrainerView: boolean;
  defaultExpanded?: boolean;
}

export const WorkoutSessionCard: React.FC<WorkoutSessionCardProps> = ({
  session,
  isTrainerView,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "hybrid":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-lime-400/10 text-lime-400 border border-lime-400/30">
            Hybrid (Cardio + Strength)
          </span>
        );
      case "cardio":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
            Cardio Focus
          </span>
        );
      case "strength":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30">
            Strength Focus
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 mb-6 transition-all duration-200 hover:border-zinc-700/80">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-zinc-400 flex items-center gap-1.5">
              <CalendarBlank size={14} className="text-zinc-400" />
              {session.dayLabel} • {session.date}
            </span>
            <span className="text-xs font-mono text-zinc-400">({session.time})</span>
            {getCategoryBadge(session.category)}
          </div>
          <h3 className="text-lg font-bold text-zinc-100 tracking-tight">
            {session.title}
          </h3>
        </div>

        {/* Duration & Expand Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200">
            <Clock size={14} className="text-zinc-400" />
            <span>{session.totalDurationMin} min</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isExpanded ? "Collapse session" : "Expand session"}
          >
            {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
          </button>
        </div>
      </div>

      {/* Raw User Quote (Logged via Chat) */}
      <div className="mt-4 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
        <Quotes size={18} className="text-zinc-400 shrink-0 mt-0.5" weight="fill" />
        <div className="text-xs leading-relaxed">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block mb-0.5">
            Logged via Chat
          </span>
          <p className="text-zinc-300 italic">"{session.rawUserQuote}"</p>
        </div>
      </div>

      {/* Expanded Workout Content */}
      {isExpanded && (
        <div className="space-y-6 mt-2">
          {/* Cardio Blocks (Intervals) */}
          {session.cardioBlocks && session.cardioBlocks.length > 0 && (
            <div>
              {session.cardioBlocks.map((block) => (
                <IntervalCardioVisualizer key={block.id} cardioBlock={block} />
              ))}
            </div>
          )}

          {/* Strength Exercises */}
          {session.strengthExercises && session.strengthExercises.length > 0 && (
            <div>
              <StrengthCard exercises={session.strengthExercises} />
            </div>
          )}

          {/* Session Notes */}
          {session.notes && (
            <div className="text-xs text-zinc-400 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/50">
              <span className="font-semibold text-zinc-300">Athlete Notes: </span>
              {session.notes}
            </div>
          )}

          {/* Trainer Feedback Section */}
          <TrainerFeedbackSection
            feedback={session.trainerFeedback}
            sessionId={session.id}
            isTrainerView={isTrainerView}
          />
        </div>
      )}
    </div>
  );
};
