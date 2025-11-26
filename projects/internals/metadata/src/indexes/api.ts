import MiniSearch from 'minisearch';
import type { Attribute, Element } from '../types.js';
import { stopWords } from './utils.js';

export interface ApiSearchDocument {
  id: string;
  type: 'element' | 'attribute';
  name: string;
  tagName?: string;
  description: string;
  behavior?: string;
}

export type ApiSearchResult = (Element | Attribute)[];

export function createApiIndex(data: { elements: Element[]; attributes: Attribute[] }): MiniSearch<ApiSearchDocument> {
  const index = new MiniSearch<ApiSearchDocument>({
    fields: ['name', 'tagName', 'description', 'behavior'],
    storeFields: ['id', 'type', 'name', 'tagName', 'description', 'behavior'],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
      boost: {
        name: 3,
        tagName: 3,
        behavior: 2,
        description: 1
      }
    },
    tokenize: (string, fieldName) => {
      if (fieldName === 'name' || fieldName === 'tagName') {
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
        id: `element:${element.name}`,
        type: 'element',
        name: element.name,
        tagName: element.manifest.tagName,
        description: element.manifest.description ?? '',
        behavior: element.manifest.metadata?.behavior ?? ''
      });
    }
  }

  // Index attributes
  for (const attribute of data.attributes) {
    documents.push({
      id: `attribute:${attribute.name}`,
      type: 'attribute',
      name: attribute.name,
      description: attribute.description ?? ''
    });
  }

  index.addAll(documents);
  return index;
}
