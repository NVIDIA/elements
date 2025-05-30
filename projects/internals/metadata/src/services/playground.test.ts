import { describe, it, expect } from 'vitest';
import { createPlaygroundURL } from './playground.js';
import type { MetadataSummary } from '../types.js';

describe('createPlaygroundURL', () => {
  const metadata = {
    created: '2021-01-01',
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: { metadata: { entrypoint: '@nvidia-elements/core/button', markdown: ' ### Import ' } }
          }
        ]
      },
      '@nvidia-elements/monaco': {
        elements: [
          { name: 'nve-monaco', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/monaco', markdown: ' ### Import ' } } }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create a playground URL', () => {
    const url = createPlaygroundURL('nve-button', { id: 'nve-button', theme: 'light' }, metadata);
    expect(url.includes('?story=nve-button&files=')).toBe(true);
  });

  it('should create a playground URL with a referer', () => {
    const url = createPlaygroundURL(
      'nve-button',
      { id: 'nve-button', theme: 'light', referer: 'https://www.nvidia.com' },
      metadata
    );
    expect(url.includes('?story=nve-button&ref=https://www.nvidia.com&files=')).toBe(true);
  });
});
