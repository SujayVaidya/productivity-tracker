"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { END_DATE, PLAN, START_DATE } from "@/data/plan";
import { getTodayDayNum } from "@/lib/schedule";
import DayCard from "./DayCard";

type Filter = "all" | "dsa" | "backend" | "sunday";

interface ProgressData {
  done: Record<number, boolean>;
  notes: Record<number, string>;
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All Days" },
  { key: "dsa", label: "DSA Days" },
  { key: "backend", label: "Backend Days" },
  { key: "sunday", label: "Sundays" },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Tracker() {
  const todayNum = useMemo(() => getTodayDayNum(START_DATE, PLAN.length), []);
  const dateRangeLabel = useMemo(
    () => `${formatDateLabel(START_DATE)} → ${formatDateLabel(END_DATE)}`,
    []
  );

  const [progress, setProgress] = useState<ProgressData>({ done: {}, notes: {} });
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [countdown, setCountdown] = useState("Loading...");

  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data: ProgressData) => {
        setProgress(data);
        if (todayNum > 0) {
          setExpanded(new Set([todayNum]));
        }
      })
      .catch(() => {});
  }, [todayNum]);

  useEffect(() => {
    function tick() {
      const target = new Date(END_DATE);
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("Time's up.");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdown(`${days} days ${hours}h remaining`);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const toggleExpand = useCallback((day: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const toggleDone = useCallback((day: number) => {
    setProgress((prev) => {
      const nextValue = !prev.done[day];
      const next = { ...prev, done: { ...prev.done, [day]: nextValue } };
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, done: nextValue }),
      }).catch(() => {});
      return next;
    });
  }, []);

  const handleNoteChange = useCallback((day: number, value: string) => {
    setProgress((prev) => ({ ...prev, notes: { ...prev.notes, [day]: value } }));
  }, []);

  const handleNoteCommit = useCallback((day: number, value: string) => {
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, note: value }),
    }).catch(() => {});
  }, []);

  const registerRef = useCallback((day: number, el: HTMLDivElement | null) => {
    dayRefs.current[day] = el;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PLAN.filter((d) => {
      if (filter === "dsa" && d.track !== "DSA") return false;
      if (filter === "backend" && d.track !== "Backend") return false;
      if (filter === "sunday" && d.dow !== "Sun") return false;
      if (q) {
        const haystack = `${d.topic} ${d.task} ${d.track}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [filter, search]);

  const doneCount = Object.values(progress.done).filter(Boolean).length;
  const progressPct = (doneCount / PLAN.length) * 100;

  function scrollToToday() {
    if (todayNum < 0) return;
    setFilter("all");
    setSearch("");
    setExpanded((prev) => new Set(prev).add(todayNum));
    setTimeout(() => {
      dayRefs.current[todayNum]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 pt-12 pb-8 border-b border-border">
        <div className="font-mono text-[11px] text-accent tracking-[0.15em] mb-3">
          102-DAY EXECUTION PLAN — SUJAY 
        </div>
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.1] mb-2.5">
          Every day.
          <br />
          <span className="text-accent">Already planned.</span>
        </h1>
        <p className="text-text-muted text-sm mb-4">
          {dateRangeLabel}. Open this every morning. Do the task. Close it. Live your life.
        </p>
        <div className="inline-flex items-center gap-2 bg-surface2 border border-border rounded-md px-3.5 py-1.5 font-mono text-xs text-accent4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent4 animate-pulse-dot" />
          <span>{countdown}</span>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 pt-4">
        <div className="font-mono text-[10px] text-text-dim mb-1.5 flex justify-between">
          <span>{doneCount} days completed</span>
          <span>{PLAN.length} days total</span>
        </div>
        <div className="h-[3px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 pt-5 flex gap-2.5 flex-wrap items-center">
        <button
          onClick={scrollToToday}
          className="text-[13px] font-semibold bg-accent text-white border-none px-4 py-2 rounded-md cursor-pointer"
        >
          → Jump to Today
        </button>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3.5 py-1.5 rounded-md border cursor-pointer ${
              filter === f.key
                ? "bg-surface2 text-text border-accent"
                : "bg-surface text-text-muted border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-[13px] bg-surface text-text border border-border px-3.5 py-1.5 rounded-md outline-none w-[200px] focus:border-accent placeholder:text-text-dim"
        />
      </div>

      <div className="max-w-[860px] mx-auto px-6 pt-5 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-dim font-mono text-[13px]">No days match your search.</div>
        ) : (
          filtered.map((d) => (
            <DayCard
              key={d.day}
              day={d}
              isToday={d.day === todayNum}
              isDone={!!progress.done[d.day]}
              isExpanded={expanded.has(d.day)}
              note={progress.notes[d.day] ?? ""}
              onToggleExpand={toggleExpand}
              onToggleDone={toggleDone}
              onNoteChange={handleNoteChange}
              onNoteCommit={handleNoteCommit}
              registerRef={registerRef}
            />
          ))
        )}
      </div>
    </div>
  );
}
