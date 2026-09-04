// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { scenePlatform } from './gpu/platform.js';

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
