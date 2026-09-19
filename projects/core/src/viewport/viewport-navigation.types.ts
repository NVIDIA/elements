// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
  ViewportPanDetail,
  ViewportPanEndDetail,
  ViewportPointerPanDetail,
  ViewportZoomDetail
} from './viewport.types.js';

export type ViewportZoomAction = 'fit' | 'in' | 'out' | 'reset';

/** Dispatches public viewport navigation events on behalf of navigation controllers. */
export interface ViewportNavigationEventDelegate {
  readonly dispatchPanStart: (detail: ViewportPointerPanDetail) => boolean;
  readonly dispatchPan: (detail: ViewportPanDetail) => boolean;
  readonly dispatchPanEnd: (detail: ViewportPanEndDetail) => void;
  readonly dispatchZoom: (detail: ViewportZoomDetail) => boolean;
}
