import { PlanDay } from "@/data/plan";

export interface ScheduleRow {
  time: string;
  label: string;
  highlight?: boolean;
}

export function buildSchedule(day: PlanDay): ScheduleRow[] {
  const eveningLabel = day.evening_task.split(".")[0];

  if (day.gym) {
    return [
      { time: "5:30", label: "Wake up, brush, prep" },
      { time: "6:00 – 6:10", label: "Meditation (10 min)", highlight: true },
      { time: "6:10 – 7:10", label: `${day.track} — ${day.topic}`, highlight: true },
      { time: "7:10 – 7:30", label: "Break + change" },
      { time: "7:30 – 9:00", label: "Gym", highlight: true },
      { time: "9:00 – 9:30", label: "Get ready + commute" },
      { time: "9:30 – 8:00", label: "Office" },
      { time: "8:00 – 9:00", label: `Evening: ${eveningLabel}`, highlight: true },
      { time: "9:00+", label: "Dinner + free time" },
    ];
  }

  return [
    { time: "5:30", label: "Wake up, brush, prep" },
    { time: "6:00 – 6:10", label: "Meditation (10 min)", highlight: true },
    { time: "6:10 – 9:00", label: "Project / OSS — 2.5 hrs", highlight: true },
    { time: "9:00 – 12:00", label: "Free / Cricket / Outing" },
    { time: "12:00 – 2:00", label: "Read + Plan next week", highlight: true },
    { time: "2:00+", label: "Fully free" },
  ];
}

export function eveningTypeLabel(type: PlanDay["evening_type"]): string {
  switch (type) {
    case "reading":
      return "Reading";
    case "social":
      return "Social Media";
    case "review":
      return "Week Review";
    case "plan":
      return "Plan + Read";
  }
}

export function getTodayDayNum(startDate: string, planLength: number): number {
  const today = new Date();
  const start = new Date(startDate);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diff = Math.round((todayMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0 || diff >= planLength) return -1;
  return diff + 1;
}
