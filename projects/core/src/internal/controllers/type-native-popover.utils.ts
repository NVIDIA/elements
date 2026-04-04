// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LogService } from '../services/log.service.js';
import { getIdMatchNotFoundWarning } from '../utils/audit-logs.js';
import { generateId, getFlattenedDOMTree, getAnchorNames, appendAnchorName } from '../utils/dom.js';

export function associateAnchor(host: HTMLElement, anchor: HTMLElement) {
  const anchorNames = getAnchorNames(anchor);
  let anchorId = anchorNames.find(name => name.startsWith('--_'));
  if (!anchorId) {
    anchorId = `--${anchor.id && !anchor.id.includes(':') ? `_${anchor.id}` : generateId()}`;
    appendAnchorName(anchor, anchorId);
  }
  host.style.positionAnchor = anchorId;
}

export function getHostTrigger(element: HTMLElement, trigger: HTMLElement | string) {
  if (typeof trigger === 'string') {
    return (
      (getFlattenedDOMTree(element.parentNode as HTMLElement)
        .filter(el => el?.id !== '')
        .find(el => el.id === trigger) as HTMLButtonElement) ?? globalThis.document.body
    );
  } else {
    return trigger as HTMLButtonElement;
  }
}

export function getHostAnchor(host: HTMLElement & { anchor?: HTMLElement | string; _activeTrigger?: HTMLElement }) {
  const anchor = host.anchor ?? host._activeTrigger;

  if (typeof anchor === 'string' && anchor?.length) {
    const match = getFlattenedDOMTree(host.parentNode as HTMLElement).find(el => el.id === anchor);

    if (!match) {
      LogService.warn(getIdMatchNotFoundWarning(anchor));
    }

    return match ?? globalThis.document.body;
  } else if (anchor && anchor !== globalThis.document.body) {
    return anchor as HTMLElement;
  } else {
    return globalThis.document.body;
  }
}

export function hasOpenPopover(host: HTMLElement) {
  return !!getFlattenedDOMTree(host).filter(e => e.popover && e.matches(':popover-open')).length;
}
