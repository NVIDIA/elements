// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

type PiLogEntry = Readonly<{ event: string } & Record<string, unknown>>;

export const piLogger = {
  info(entry: PiLogEntry): void {
    console.info(entry);
  },
  warn(entry: PiLogEntry): void {
    console.warn(entry);
  }
};
