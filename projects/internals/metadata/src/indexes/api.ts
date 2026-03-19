// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import MiniSearch from 'minisearch';
import type { Attribute, Element } from '../types.js';
import { stopWords } from './utils.js';

export interface ApiSearchDocument {
  id: string;
  name: string;
  type: string;
  description: string;
  behavior?: string;
}

export function createApiIndex(data: { elements: Element[]; attributes: Attribute[] }): MiniSearch<ApiSearchDocument> {
  const index = new MiniSearch<ApiSearchDocument>({
    fields: ['name', 'type', 'description', 'behavior'],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
      boost: {
        id: 3,
        name: 4,
        behavior: 2,
        description: 1
      }
    },
    tokenize: (string, fieldName) => {
      if (fieldName === 'name') {
        // Split kebab-case and camelCase for better matching
        return string
          .split(/[-_]/)
          .flatMap(part => part.split(/(?=[A-Z])/))
          .map(s => s.toLowerCase())
          .filter(Boolean);
      }
      return MiniSearch.getDefault('tokenize')(string, fieldName);
    },
    processTerm: (term, _fieldName) => {
      if (stopWords.has(term)) {
        return null;
      }
      return MiniSearch.getDefault('processTerm')(term, _fieldName);
    }
  });

  const documents: ApiSearchDocument[] = [];

  // Index elements
  for (const element of data.elements) {
    if (element.manifest && !element.manifest.deprecated) {
      documents.push({
        id: element.name,
        name: element.name,
        type: 'element',
        description: element.manifest.description ?? '',
        behavior: element.manifest.metadata?.behavior ?? ''
      });
    }
  }

  // Index attributes
  for (const attribute of data.attributes) {
    documents.push({
      id: attribute.name,
      name: attribute.name,
      type: 'attribute',
      description: attribute.description ?? ''
    });
  }

  index.addAll(documents);
  return index;
}
