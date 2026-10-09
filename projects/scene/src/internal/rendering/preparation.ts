// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { scenePlatform } from '../gpu/platform.js';

/** Cancellation and scheduling boundary shared by renderer-owned preparation. */
export interface PreparationContext {
  readonly isCurrent: () => boolean;
  readonly yield: () => Promise<void>;
}

/** Work units processed before a preparation task yields to browser work. */
export const PREPARATION_CHUNK_SIZE = 16_384;

export function createPreparationContext(isCurrent: () => boolean): PreparationContext {
  return { isCurrent, yield: () => scenePlatform.yieldForPreparation() };
}

/** Runs a bounded traversal to completion without scheduling between its steps. */
export function runPreparationSync<Result>(steps: Iterator<void, Result, void>): Result {
  let step = steps.next();
  while (!step.done) step = steps.next();
  return step.value;
}

/**
 * Runs a bounded traversal after an initial yield and schedules between its steps.
 * Traversals allocate inside next(), yield after bounded work, and return their result on completion.
 * Cancellation closes the traversal and discards its result, including a completed obsolete result.
 */
export function runPreparation<Result>(
  steps: Iterator<void, Result, void>,
  context: PreparationContext
): Promise<Result | undefined> {
  return runPreparationSteps(steps, context, 'yield');
}

/** Runs a traversal inside an enclosing task that has already passed its initial yield. */
export function resumePreparation<Result>(
  steps: Iterator<void, Result, void>,
  context: PreparationContext
): Promise<Result | undefined> {
  return runPreparationSteps(steps, context, 'continue');
}

async function runPreparationSteps<Result>(
  steps: Iterator<void, Result, void>,
  context: PreparationContext,
  start: 'yield' | 'continue'
): Promise<Result | undefined> {
  let complete = false;
  try {
    if (start === 'yield' && !(await beginPreparation(context))) return undefined;
    let step = steps.next();
    while (!step.done) {
      if (!(await continuePreparation(context))) return undefined;
      step = steps.next();
    }
    complete = true;
    return context.isCurrent() ? step.value : undefined;
  } finally {
    if (!complete) steps.return?.();
  }
}

/** Starts every task outside its requesting render callback and checks cancellation afterward. */
export async function beginPreparation(context: PreparationContext): Promise<boolean> {
  await context.yield();
  return context.isCurrent();
}

/** Yields between bounded chunks and reports whether the result is still wanted. */
export async function continuePreparation(context: PreparationContext): Promise<boolean> {
  await context.yield();
  return context.isCurrent();
}
