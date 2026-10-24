import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

/** Records optional runner timings outside cached test outputs. */
export function recordPhase(phase, start, details = {}) {
  const directory = process.env.LIGHTHOUSE_PROFILE_DIR;
  if (!directory) return;
  mkdirSync(directory, { recursive: true });
  appendFileSync(
    path.join(directory, `${process.pid}.jsonl`),
    `${JSON.stringify({
      project: process.cwd(),
      phase,
      startTime: performance.timeOrigin + start,
      durationMs: performance.now() - start,
      ...details
    })}\n`
  );
}

export async function profilePhase(phase, operation, details) {
  const start = performance.now();
  try {
    return await operation();
  } finally {
    recordPhase(phase, start, details);
  }
}
