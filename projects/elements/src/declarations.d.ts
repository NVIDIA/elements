// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

declare module '*.css?inline' {
  const content: string;
  export = content;
}

declare module '*.svg?raw' {
  const content: string;
  export = content;
}
