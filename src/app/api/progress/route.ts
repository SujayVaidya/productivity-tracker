import { NextResponse } from "next/server";
import { readProgress, writeProgress } from "@/lib/store";

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
