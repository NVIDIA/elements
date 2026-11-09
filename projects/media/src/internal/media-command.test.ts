// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { isMediaCommand, mediaCommands } from './media-command.js';

describe('isMediaCommand', () => {
  it.each(Object.values(mediaCommands))('recognizes the %s command', command => {
    expect(isMediaCommand(command)).toBe(true);
  });

  it.each([undefined, '', 'play', '--PLAY', '--play-extra', '--unknown'])('rejects unsupported command %s', command => {
    expect(isMediaCommand(command)).toBe(false);
  });
});
