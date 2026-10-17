// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface WorkspaceHeaderConfiguration {
  selected: boolean;
  offset: number;
  animate: boolean;
  tabWidth: number;
  headerHeight: number;
  suffixEnd: number;
  clipLeft: number;
  clipWidth: number;
}

export function sameHeaderConfiguration(current: WorkspaceHeaderConfiguration, next: WorkspaceHeaderConfiguration) {
  return (
    current.selected === next.selected &&
    current.offset === next.offset &&
    current.animate === next.animate &&
    current.tabWidth === next.tabWidth &&
    current.headerHeight === next.headerHeight &&
    current.suffixEnd === next.suffixEnd &&
    current.clipLeft === next.clipLeft &&
    current.clipWidth === next.clipWidth
  );
}
