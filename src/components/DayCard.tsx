"use client";

import { PlanDay } from "@/data/plan";
import { buildSchedule, eveningTypeLabel } from "@/lib/schedule";

const trackBadge: Record<PlanDay["track"], { label: string; className: string }> = {
  DSA: { label: "DSA", className: "bg-accent/15 text-[#a99dfc]" },
  Backend: { label: "BACKEND", className: "bg-accent2/15 text-[#7de8e2]" },
  "Project / OSS": { label: "PROJECT", className: "bg-accent3/15 text-[#ff9494]" },
};

interface DayCardProps {
  day: PlanDay;
  isToday: boolean;
  isDone: boolean;
  isExpanded: boolean;
  note: string;
  onToggleExpand: (day: number) => void;
  onToggleDone: (day: number) => void;
  onNoteChange: (day: number, value: string) => void;
  onNoteCommit: (day: number, value: string) => void;
  registerRef: (day: number, el: HTMLDivElement | null) => void;
}

export default function DayCard({
  day,
  isToday,
  isDone,
  isExpanded,
  note,
  onToggleExpand,
  onToggleDone,
  onNoteChange,
  onNoteCommit,
  registerRef,
}: DayCardProps) {
  const badge = trackBadge[day.track];
  const schedule = buildSchedule(day);

  return (
    <div
      ref={(el) => registerRef(day.day, el)}
      className={`rounded-[10px] border mb-2.5 overflow-hidden transition-colors bg-surface ${
        isToday ? "border-accent" : "border-border hover:border-text-dim"
      } ${isDone ? "opacity-50" : ""}`}
    >
      <div
        className="grid grid-cols-[80px_1fr_auto] gap-3 items-center px-4 py-3.5 cursor-pointer select-none"
        onClick={() => onToggleExpand(day.day)}
      >
        <div>
          <div className={`font-mono text-xl font-bold leading-none ${isToday ? "text-accent" : "text-text-dim"}`}>
            D{day.day}
          </div>
          <div className="font-mono text-[10px] text-text-dim mt-0.5">
            {day.date} {day.dow}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-text">{day.topic}</div>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${badge.className}`}>
              {badge.label}
            </span>
            {day.gym && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#ff9632]/10 text-[#ffaa55]">
                GYM
              </span>
            )}
            {isToday && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-accent text-white">
                TODAY
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            title="Mark done"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone(day.day);
            }}
            className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
              isDone ? "bg-accent2 border-accent2 text-white" : "border-border text-transparent"
            }`}
          >
            {isDone ? "✓" : ""}
          </button>
          <span
            className={`text-text-dim text-sm flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4">
          {isToday && (
            <div className="bg-accent/[0.08] border border-accent/20 rounded-md px-3 py-2 text-xs text-accent mb-3 font-medium">
              ⚡ This is today. Do the work.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="bg-surface2 rounded-lg p-3.5">
              <div className="font-mono text-[10px] text-text-dim tracking-wide mb-1.5">
                MORNING 6:10–7:10 — {day.track.toUpperCase()}
              </div>
              <div className="text-[13px] font-semibold text-text mb-1.5">{day.topic}</div>
              <div className="text-[13px] text-text-muted leading-[1.55]">{day.task}</div>
            </div>
            <div className="bg-surface2 rounded-lg p-3.5">
              <div className="font-mono text-[10px] text-text-dim tracking-wide mb-1.5">EVENING 8:00–9:00</div>
              <div className="text-[13px] font-semibold text-text mb-1.5">
                {eveningTypeLabel(day.evening_type)}
              </div>
              <div className="text-[13px] text-text-muted leading-[1.55]">{day.evening_task}</div>
            </div>
          </div>

          <div className="bg-surface2 rounded-lg p-3.5">
            <div className="font-mono text-[10px] text-text-dim mb-2.5">TODAY&apos;S SCHEDULE</div>
            {schedule.map((row) => (
              <div key={row.time} className="flex gap-2.5 items-baseline mb-1.5 text-xs">
                <span className="font-mono text-text-dim min-w-[90px] flex-shrink-0 text-[11px]">{row.time}</span>
                <span className={row.highlight ? "text-text font-medium" : "text-text-muted"}>{row.label}</span>
              </div>
            ))}
          </div>

          <div className="font-mono text-[10px] text-text-dim mt-3 mb-1">NOTES / REFLECTIONS</div>
          <textarea
            className="w-full min-h-[60px] bg-bg border border-border rounded-md px-3 py-2.5 text-[13px] text-text resize-y outline-none focus:border-accent placeholder:text-text-dim"
            placeholder="What did you learn? What was hard? Write anything..."
            value={note}
            onChange={(e) => onNoteChange(day.day, e.target.value)}
            onBlur={(e) => onNoteCommit(day.day, e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
