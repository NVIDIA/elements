// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

declare module '*.md?inline' {
  const content: string;
  export = content;
}

declare module 'sanitize-html';
declare module 'archiver';
declare module 'adm-zip';
