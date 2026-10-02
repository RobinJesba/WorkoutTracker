"use client";

import React, { useState } from "react";
import { MuscleIcon } from "./MuscleIcon";
import { WorkoutEntry, WorkoutItem } from "@/types/workout";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutSaved: (workout: WorkoutEntry, isMerged?: boolean) => void;
  existingWorkouts?: WorkoutEntry[];
}

function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatIsoToDisplay(isoStr: string): string {
  if (!isoStr) return "";
  const parts = isoStr.split("-").map(Number);
  if (parts.length !== 3) return isoStr;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const NOTES_PLACEHOLDER = `Dumbbell chest press - 10kg * 6, 7.5kg * 12, 7.5 * 10
Scapula pullups 15reps, 10reps
Single arm kneeling cable lat pulldown - 12kg * 12, 10kg * 10
Running: 5 sets 2 mins run @ 12km/h and 2 mins walk 3km/h`;

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onWorkoutSaved,
  existingWorkouts = [],
}) => {
  const [selectedDateIso, setSelectedDateIso] = useState<string>(getTodayIso());
  const [rawText, setRawText] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Parsed Preview State
  const [parsedTitle, setParsedTitle] = useState<string>("");
  const [parsedItems, setParsedItems] = useState<WorkoutItem[] | null>(null);

  if (!isOpen) return null;

  const displayDate = formatIsoToDisplay(selectedDateIso);
  const existingWorkoutForDate = existingWorkouts.find((w) => w.date === displayDate);

  const handleSubmit = async () => {
    if (!rawText.trim()) {
      setParseError("Please enter your workout notes first.");
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/parse-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to parse workout notes");
      }

      const data = await res.json();
      setParsedTitle(data.title || "Workout Session");
      setParsedItems(data.items || []);
    } catch (err: any) {
      setParseError(err.message || "Failed to process workout notes");
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (!parsedItems) return;
    setParsedItems(parsedItems.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    if (!parsedItems || parsedItems.length === 0) {
      setSaveError("No items to save.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const titleToUse = existingWorkoutForDate
      ? existingWorkoutForDate.title
      : parsedTitle || "Workout Session";

    const newWorkoutPayload: WorkoutEntry = {
      id: existingWorkoutForDate?.id || `workout-${Date.now()}`,
      date: displayDate,
      title: titleToUse,
      items: parsedItems,
    };

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWorkoutPayload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save workout to database");
      }

      const resData = await res.json().catch(() => ({}));
      const isMerged = Boolean(resData.merged || existingWorkoutForDate);

      // Notify parent to update local state & cache
      onWorkoutSaved(newWorkoutPayload, isMerged);
      handleReset();
      onClose();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save workout");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRawText("");
    setParsedItems(null);
    setParsedTitle("");
    setParseError(null);
    setSaveError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">Log Workout</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-zinc-200">
          {/* Date Picker Row */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">
              Workout Date
            </label>
            <div className="relative group">
              {/* Visually displays the exact "Oct 3, 2026" format */}
              <div className="w-full flex items-center justify-between bg-zinc-950/80 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-mono text-zinc-100 group-hover:border-zinc-700 transition-colors">
                <span className="font-mono text-zinc-100 font-medium tracking-tight">
                  {displayDate}
                </span>
                <svg className="w-4 h-4 text-emerald-400/80" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>

              {/* Invisible native date picker over the entire box to trigger calendar */}
              <input
                type="date"
                value={selectedDateIso}
                onChange={(e) => {
                  if (e.target.value) setSelectedDateIso(e.target.value);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [color-scheme:dark]"
                title="Select date"
              />
            </div>
            {existingWorkoutForDate && (
              <p className="mt-1.5 text-[11px] font-mono text-emerald-400/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Existing workout found for {displayDate} ({existingWorkoutForDate.items.length} exercises) — new exercises will be appended.
              </p>
            )}
          </div>

          {/* Raw Workout Notes Input */}
          {!parsedItems && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-zinc-400">Workout Notes</label>
                <span className="text-[11px] font-mono text-zinc-500">Paste your raw log</span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                placeholder={NOTES_PLACEHOLDER}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 text-xs sm:text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 leading-relaxed resize-none"
              />
            </div>
          )}

          {/* Error Message */}
          {parseError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {parseError}
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedItems && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
                    {existingWorkoutForDate ? existingWorkoutForDate.title : parsedTitle || "Workout Session"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-zinc-400">{displayDate}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[11px] font-mono text-emerald-400/90">
                      +{parsedItems.length} new {parsedItems.length === 1 ? "exercise" : "exercises"}
                    </span>
                    {existingWorkoutForDate && (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          (Appends to {existingWorkoutForDate.items.length} existing)
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setParsedItems(null)}
                  className="text-xs font-mono text-zinc-400 hover:text-zinc-200 underline decoration-zinc-700"
                >
                  Edit Notes
                </button>
              </div>

              {/* Parsed List Items */}
              <ul className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {parsedItems.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/70 hover:border-zinc-700/60"
                  >
                    {/* Dual-silhouette Muscle Anatomy */}
                    <div className="p-1 rounded-md bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center shrink-0 w-[58px] min-w-[58px]">
                      <MuscleIcon
                        targetMuscles={item.targetMuscles}
                        primaryMuscles={item.primaryMuscles}
                        secondaryMuscles={item.secondaryMuscles}
                        muscleGroup={item.muscleGroup}
                        size={20}
                      />
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-zinc-100 text-xs sm:text-sm truncate">
                          {item.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          {(item.primaryMuscles || item.targetMuscles)?.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.2 rounded text-[9.5px] font-mono uppercase bg-zinc-800/90 text-emerald-400 border border-emerald-400/20"
                            >
                              {m}
                            </span>
                          ))}
                          {item.secondaryMuscles?.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-zinc-900/90 text-zinc-400 border border-zinc-700/60"
                            >
                              + {m}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 font-mono text-xs truncate">
                        {item.details}
                      </p>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                      title="Remove exercise"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              {saveError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  {saveError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800/80 bg-zinc-950/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors"
          >
            Cancel
          </button>

          {!parsedItems ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isParsing || !rawText.trim()}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-md active:scale-95 disabled:pointer-events-none cursor-pointer"
            >
              {isParsing ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || parsedItems.length === 0}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-md active:scale-95 disabled:pointer-events-none cursor-pointer"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving to D1...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{existingWorkoutForDate ? "Merge into Log" : "Save to Log"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
