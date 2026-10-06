// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CustomElementField, CustomElementMethod } from '@internals/metadata';

export interface TemplateContext {
  renderTemplate(content: string, engine: string): Promise<string>;
}

export interface ApiItem
  extends Pick<CustomElementField, 'name' | 'description' | 'descriptionText' | 'deprecated' | 'privacy' | 'attribute'>,
    Partial<Pick<CustomElementMethod, 'parameters' | 'return'>> {
  kind?: string;
  type?: {
    values?: {
      value: string;
      description?: string;
      deprecated?: boolean | string;
    }[];
  };
}

export type ApiManifest = Partial<
  Record<'members' | 'commands' | 'events' | 'slots' | 'cssProperties' | 'cssParts', ApiItem[]>
> & { attributes?: { name: string; fieldName?: string }[] };

export interface ApiElement {
  manifest?: ApiManifest;
}

export interface ApiTableOptions {
  container: string;
  methodName?: string | null;
}
