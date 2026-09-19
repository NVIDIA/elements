// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { registerElementsAutoValidation } from './auto-validation.js';
import { registerElementsTools } from './tools.js';

export const VERSION = '0.0.0';

/**
 * Initializes the NVIDIA Elements Pi extension.
 *
 * Sets the Elements runtime environment to `pi`, registers the Elements tools, and enables the
 * automatic-validation flag, command, and event hooks. Automatic validation uses its default
 * options and runs after eligible HTML edit and write results.
 *
 * @param pi - Pi's extension API used for tool, flag, command, and event registration.
 * @returns Nothing.
 */
export default function elementsExtension(pi: ExtensionAPI): void {
  process.env.ELEMENTS_ENV = 'pi';
  registerElementsTools(pi);
  registerElementsAutoValidation(pi);
}
