// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from '../internal/highlight/mixed-parsers.js';
import { registerLanguage } from '../internal/highlight/language-registry.js';

registerLanguage('html', html);
