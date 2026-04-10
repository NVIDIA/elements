// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CustomElements } from '@nvidia-elements/core/custom-elements-jsx';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}

declare module '@lit-labs/ssr-react/enable-lit-ssr.js';
