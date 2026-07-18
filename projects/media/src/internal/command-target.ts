// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getFlattenedDOMTree } from '@nvidia-elements/core/internal';

type CommandTargetHost = HTMLElement & {
  commandForElement: HTMLElement | null;
};

export function getCommandTarget(host: CommandTargetHost) {
  if (host.commandForElement) {
    return host.commandForElement;
  }

  const id = host.getAttribute('commandfor');
  if (!id) {
    return null;
  }

  return getFlattenedDOMTree(host.getRootNode() as HTMLElement).find(element => element.id === id) ?? null;
}
