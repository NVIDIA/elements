// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

declare global {
  var REACT_CREATE_ELEMENT: typeof React.createElement | undefined;
  var IS_CREATE_ELEMENT_PATCHED: boolean | undefined;
}

if (!globalThis.REACT_CREATE_ELEMENT) {
  globalThis.REACT_CREATE_ELEMENT = React.createElement;
}
