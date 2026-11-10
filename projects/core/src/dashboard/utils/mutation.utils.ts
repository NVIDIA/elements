// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { matchesElementName } from '@nvidia-elements/core/internal';

import { DashboardPanel } from '../panel/panel.js';

export function isDashboardCatalogueMutation(host: HTMLElement, record: MutationRecord) {
  if (record.attributeName === 'slot') return isDirectDashboardPanel(host, record.target);

  if (record.target === host && record.type === 'childList') {
    return [...record.addedNodes, ...record.removedNodes].some(
      node => node instanceof Element && matchesElementName(node, DashboardPanel)
    );
  }

  return record.target === host || (record.type === 'attributes' && isDirectDashboardPanel(host, record.target));
}

export function isDashboardTitleMutation(host: HTMLElement, record: MutationRecord) {
  if (record.type === 'childList' && isDirectDashboardPanel(host, record.target)) {
    return [...record.addedNodes, ...record.removedNodes].some(
      node => node instanceof Element && node.localName === 'nve-dashboard-panel-header'
    );
  }

  const element = record.target instanceof Element ? record.target : record.target.parentElement;
  if (!element) return false;

  const header =
    record.attributeName === 'slot' ? element.parentElement : element.closest('nve-dashboard-panel-header');

  return header?.localName === 'nve-dashboard-panel-header' && header.parentElement?.parentElement === host;
}

function isDirectDashboardPanel(host: HTMLElement, node: Node): boolean {
  return node instanceof Element && matchesElementName(node, DashboardPanel) && node.parentElement === host;
}
