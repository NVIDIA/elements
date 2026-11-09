// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface WorkspacePanelMeasurements {
  suffixWidth: number;
  footerHeight: number;
}

export interface WorkspaceMeasurements {
  gap: number;
  panels?: Record<string, WorkspacePanelMeasurements>;
  headerHeight: number;
  gripWidth: number;
  actionWidth: number;
  groupActionWidth?: number;
  tabWidth: number;
  tabMinWidth: number;
  width: number;
  height: number;
}

export interface WorkspaceMeasurementChange {
  readonly measurements: WorkspaceMeasurements;
  readonly spaceChanged: boolean;
}

export function sameWorkspaceMeasurements(previous: WorkspaceMeasurements | undefined, current: WorkspaceMeasurements) {
  return (
    previous !== undefined &&
    sameWorkspaceMeasurementScalars(previous, current) &&
    samePanelMeasurements(previous.panels, current.panels)
  );
}

export function sameWorkspaceMeasurementScalars(previous: WorkspaceMeasurements, current: WorkspaceMeasurements) {
  return (
    previous.gap === current.gap &&
    previous.headerHeight === current.headerHeight &&
    previous.gripWidth === current.gripWidth &&
    previous.actionWidth === current.actionWidth &&
    previous.groupActionWidth === current.groupActionWidth &&
    previous.tabWidth === current.tabWidth &&
    previous.tabMinWidth === current.tabMinWidth &&
    previous.width === current.width &&
    previous.height === current.height
  );
}

function samePanelMeasurements(previous: WorkspaceMeasurements['panels'], current: WorkspaceMeasurements['panels']) {
  if (previous === current) return true;
  if (!previous || !current) return false;
  for (const id in previous) {
    const before = previous[id]!;
    const after = current[id];
    if (!after || before.suffixWidth !== after.suffixWidth || before.footerHeight !== after.footerHeight) {
      return false;
    }
  }
  for (const id in current) {
    if (!Object.hasOwn(previous, id)) return false;
  }
  return true;
}
