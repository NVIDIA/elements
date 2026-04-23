// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { ChatMessage } from '@nvidia-elements/core/chat-message';

define(ChatMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-chat-message': ChatMessage;
  }
}
