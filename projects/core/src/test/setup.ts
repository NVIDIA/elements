// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import styles from '@nvidia-elements/core/index.css?inline';

/** @deprecated */
const sheet = new CSSStyleSheet();
sheet.replaceSync(`${styles}`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
document.documentElement.setAttribute('nve-theme', '');
