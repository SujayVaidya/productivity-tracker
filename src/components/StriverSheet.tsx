"use client";

import { useMemo, useState } from "react";
import { SHEET_STEPS, SHEET_PROBLEMS, PLAN_STEP_NUMBERS, SheetProblem, Difficulty } from "@/data/striverSheet";

interface StriverSheetProps {
  sheetDone: Record<string, boolean>;
  onToggle: (id: string) => void;
  onToggleTopic: (ids: string[], markDone: boolean) => void;
  search: string;
}

const PLAN_STEPS = new Set(PLAN_STEP_NUMBERS);

const diffClass: Record<Exclude<Difficulty, "">, string> = {
  Easy: "bg-accent2/15 text-[#7de8e2]",
  Medium: "bg-accent4/15 text-[#e8c94a]",
  Hard: "bg-accent3/15 text-[#ff9494]",
};

export default function StriverSheet({ sheetDone, onToggle, onToggleTopic, search }: StriverSheetProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const q = search.trim().toLowerCase();

  const problemsByStep = useMemo(() => {
    const map = new Map<number, SheetProblem[]>();
    for (const p of SHEET_PROBLEMS) {
      if (q) {
        const haystack = `${p.title} ${p.topic} ${p.stepTitle}`.toLowerCase();
        if (!haystack.includes(q)) continue;
      }
      if (!map.has(p.step)) map.set(p.step, []);
      map.get(p.step)!.push(p);
    }
    return map;
  }, [q]);

  function toggleStep(step: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  }

  const totalDone = SHEET_PROBLEMS.filter((p) => sheetDone[p.id]).length;

  if (problemsByStep.size === 0) {
    return <div className="text-center py-16 text-text-dim font-mono text-[13px]">No problems match your search.</div>;
  }

  return (
    <div>
      <div className="mb-4 font-mono text-[11px] text-text-dim flex justify-between">
        <span>{totalDone} / {SHEET_PROBLEMS.length} problems solved</span>
        <span>Striver&apos;s A2Z DSA Sheet</span>
      </div>
      {SHEET_STEPS.map((step) => {
        const problems = problemsByStep.get(step.n);
        if (!problems || problems.length === 0) return null;

        const isExpanded = expanded.has(step.n) || q.length > 0;
        const doneInStep = problems.filter((p) => sheetDone[p.id]).length;

        const byTopic = new Map<string, SheetProblem[]>();
        for (const p of problems) {
          if (!byTopic.has(p.topic)) byTopic.set(p.topic, []);
          byTopic.get(p.topic)!.push(p);
        }

        return (
          <div key={step.n} className="mb-2.5 bg-surface border border-border rounded-[10px] overflow-hidden">
            <div
              className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer select-none"
              onClick={() => toggleStep(step.n)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs text-text-dim flex-shrink-0">STEP {step.n}</span>
                <span className="text-sm font-semibold text-text truncate">{step.title}</span>
                {PLAN_STEPS.has(step.n) && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-accent text-white flex-shrink-0">
                    IN PLAN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono text-[11px] text-text-muted">
                  {doneInStep}/{problems.length}
                </span>
                <span className={`text-text-dim text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`}>▾</span>
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="h-[3px] bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent2 rounded-full transition-[width]"
                  style={{ width: `${(doneInStep / problems.length) * 100}%` }}
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border">
                {[...byTopic.entries()].map(([topic, tProblems]) => {
                  const topicDoneCount = tProblems.filter((p) => sheetDone[p.id]).length;
                  const allTopicDone = topicDoneCount === tProblems.length;
                  const topicIds = tProblems.map((p) => p.id);
                  return (
                  <div key={topic} className="px-4 py-3 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        title={allTopicDone ? "Clear this topic" : "Mark whole topic done"}
                        onClick={() => onToggleTopic(topicIds, !allTopicDone)}
                        className={`w-[16px] h-[16px] rounded border flex items-center justify-center text-[9px] flex-shrink-0 transition-colors ${
                          allTopicDone
                            ? "bg-accent2 border-accent2 text-white"
                            : topicDoneCount > 0
                              ? "border-accent2 text-accent2"
                              : "border-border text-transparent"
                        }`}
                      >
                        {allTopicDone ? "✓" : topicDoneCount > 0 ? "–" : ""}
                      </button>
                      <div className="font-mono text-[10px] text-text-dim tracking-wide">
                        {topic.toUpperCase()} · {topicDoneCount}/{tProblems.length}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {tProblems.map((p) => (
                        <div key={p.id} className="flex items-center gap-2.5 text-[13px] flex-wrap sm:flex-nowrap">
                          <button
                            title="Mark solved"
                            onClick={() => onToggle(p.id)}
                            className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[10px] flex-shrink-0 transition-colors ${
                              sheetDone[p.id] ? "bg-accent2 border-accent2 text-white" : "border-border text-transparent"
                            }`}
                          >
                            {sheetDone[p.id] ? "✓" : ""}
                          </button>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex-1 min-w-[140px] hover:text-accent ${
                              sheetDone[p.id] ? "text-text-dim line-through" : "text-text"
                            }`}
                          >
                            {p.title}
                          </a>
                          {p.difficulty && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${diffClass[p.difficulty]}`}
                            >
                              {p.difficulty.toUpperCase()}
                            </span>
                          )}
                          {p.article && (
                            <a
                              href={p.article}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-text-muted hover:text-accent hover:border-accent flex-shrink-0"
                            >
                              ARTICLE
                            </a>
                          )}
                          {p.video && (
                            <a
                              href={p.video}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-text-muted hover:text-accent hover:border-accent flex-shrink-0"
                            >
                              VIDEO
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
