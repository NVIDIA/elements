// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

declare module 'markdown-it-link-attributes' {
  import type { PluginWithOptions } from 'markdown-it';

  interface LinkAttributesOptions {
    matcher?: (href: string, config: LinkAttributesOptions) => boolean | RegExpMatchArray | null;
    attrs: Record<string, string>;
  }

  const markdownItLink: PluginWithOptions<LinkAttributesOptions | LinkAttributesOptions[]>;
  export default markdownItLink;
}
