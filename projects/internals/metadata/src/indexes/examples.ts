import MiniSearch from 'minisearch';
import type { Example } from '../types.js';
import { isPublicExample, stopWords } from './utils.js';

export function createIndex(examples: Example[]) {
  const index = new MiniSearch({
    fields: ['id', 'name', 'summary', 'description', 'template', 'element', 'tags'],
    storeFields: ['id', 'name', 'summary', 'description', 'template', 'element', 'tags', 'entrypoint'],
    searchOptions: {
      fuzzy: 0.1,
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
      if (fieldName === 'id') {
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

  index.addAll(examples.filter(isPublicExample));
  return index;
}
