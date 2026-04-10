// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import MiniSearch from 'minisearch';
import type { Example } from '../types.js';
import { stopWords } from './utils.js';

export function createIndex(examples: Example[]) {
  const index = new MiniSearch({
    fields: ['id', 'name', 'summary', 'description', 'template', 'element', 'tags', 'entrypoint'],
    searchOptions: {
      fuzzy: true,
      boost: {
        element: 3,
        summary: 2,
        name: 2,
        description: 2,
        tags: 1.5,
        template: 1,
        id: 1
      }
    },
    tokenize: (string, fieldName) => {
      if (fieldName === 'name' || fieldName === 'element') {
        return string.split(/(?=[A-Z])/).join(' ');
      }
      return MiniSearch.getDefault('tokenize')(string, fieldName);
    },
    processTerm: (term, fieldName) => {
      if (stopWords.has(term)) {
        return null;
      } else if (term === 'table' || term === 'tables') {
        return ['nve-grid', 'datagrid', 'grid'];
      } else {
        return MiniSearch.getDefault('processTerm')(term, fieldName);
      }
    }
  });

  index.addAll(examples);
  return index;
}
