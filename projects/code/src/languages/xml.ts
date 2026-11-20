// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parser } from '@lezer/xml';
import { registerLanguage } from '../internal/highlight/language-registry.js';

registerLanguage('xml', parser);
