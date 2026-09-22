import { NextResponse } from "next/server";
import { readProgress, writeProgress } from "@/lib/store";

export async function GET() {
  const data = await readProgress();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body: {
    day?: number;
    done?: boolean;
    note?: string;
    problemId?: string;
    sheetDone?: boolean;
    sheetUpdates?: Record<string, boolean>;
  } = await request.json();

  const current = await readProgress();

  if (body.sheetUpdates && typeof body.sheetUpdates === "object") {
    for (const [id, value] of Object.entries(body.sheetUpdates)) {
      current.sheetDone[id] = value;
    }
    await writeProgress(current);
    return NextResponse.json(current);
  }

  if (typeof body.problemId === "string") {
    if (typeof body.sheetDone === "boolean") {
      current.sheetDone[body.problemId] = body.sheetDone;
    }
    await writeProgress(current);
    return NextResponse.json(current);
  }

  if (typeof body.day !== "number") {
    return NextResponse.json({ error: "day or problemId is required" }, { status: 400 });
  }

  if (typeof body.done === "boolean") {
    current.done[body.day] = body.done;
  }
  if (typeof body.note === "string") {
    current.notes[body.day] = body.note;
  }

  await writeProgress(current);
  return NextResponse.json(current);
}
