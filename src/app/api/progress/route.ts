import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "progress.json");

interface ProgressData {
  done: Record<number, boolean>;
  notes: Record<number, string>;
}

const EMPTY: ProgressData = { done: {}, notes: {} };

async function readProgress(): Promise<ProgressData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return { done: parsed.done ?? {}, notes: parsed.notes ?? {} };
  } catch {
    return { ...EMPTY };
  }
}

async function writeProgress(data: ProgressData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = await readProgress();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body: { day?: number; done?: boolean; note?: string } = await request.json();
  if (typeof body.day !== "number") {
    return NextResponse.json({ error: "day is required" }, { status: 400 });
  }

  const current = await readProgress();
  if (typeof body.done === "boolean") {
    current.done[body.day] = body.done;
  }
  if (typeof body.note === "string") {
    current.notes[body.day] = body.note;
  }

  await writeProgress(current);
  return NextResponse.json(current);
}
