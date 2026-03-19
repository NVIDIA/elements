// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define } from '@nvidia-elements/core/internal';
import { Avatar, AvatarGroup } from '@nvidia-elements/core/avatar';

define(Avatar);
define(AvatarGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-avatar': Avatar;
    'nve-avatar-group': AvatarGroup;
  }
}
