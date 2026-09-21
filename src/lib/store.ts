import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";

export interface ProgressData {
  done: Record<number, boolean>;
  notes: Record<number, string>;
}

const EMPTY: ProgressData = { done: {}, notes: {} };
const REDIS_KEY = "productivity-tracker:progress";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "progress.json");

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function readProgressFile(): Promise<ProgressData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return { done: parsed.done ?? {}, notes: parsed.notes ?? {} };
  } catch {
    return { ...EMPTY };
  }
}

async function writeProgressFile(data: ProgressData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function readProgress(): Promise<ProgressData> {
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<ProgressData>(REDIS_KEY);
    return data ?? { ...EMPTY };
  }
  return readProgressFile();
}

export async function writeProgress(data: ProgressData): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, data);
    return;
  }
  await writeProgressFile(data);
}
