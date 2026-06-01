// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

declare module '*.md?inline' {
  const content: string;
  export = content;
}

declare module 'sanitize-html';
declare module 'archiver' {
  import type { Writable } from 'node:stream';

  export class ZipArchive {
    constructor(options?: { zlib?: { level?: number } });

    pipe<T extends Writable>(destination: T): T;
    directory(dirpath: string, destpath: string | false): this;
    finalize(): Promise<void>;
  }
}
declare module 'adm-zip';
