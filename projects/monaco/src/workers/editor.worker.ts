// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// @ts-expect-error no types for vendored worker
import * as worker from '../vendor/monaco-editor/editor/editor.worker.js';
export default worker;
