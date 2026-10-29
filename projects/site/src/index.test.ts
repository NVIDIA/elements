import { readFileSync } from 'node:fs';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import { ExamplesService, TestsService } from '@internals/metadata';
import { getPatternCount, getTotalTests } from './_11ty/utils/metrics.js';

type HtmlNode = DefaultTreeAdapterMap['node'];

function findByClass(node: HtmlNode, className: string): HtmlNode[] {
  if ('attrs' in node && node.attrs.some(attr => attr.name === 'class' && attr.value.split(' ').includes(className))) {
    return [node];
  }
  return 'childNodes' in node ? node.childNodes.flatMap(child => findByClass(child, className)) : [];
}

function getText(node: HtmlNode): string {
  if ('value' in node) return node.value;
  return 'childNodes' in node ? node.childNodes.map(getText).join(' ') : '';
}

describe('home page', () => {
  it('matches the component list count and renders pattern and test counts from metadata', async () => {
    const page = parse(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'));
    const homePage = findByClass(page, 'getting-started-page')[0];
    expect(homePage).toBeDefined();
    if (!homePage) throw new Error('Home page content is missing.');
    const gallery = parse(readFileSync(new URL('../dist/docs/elements/index.html', import.meta.url), 'utf8'));
    const componentLinks = findByClass(gallery, 'component-card-link');
    const componentUrls = new Set(
      componentLinks.map(node => ('attrs' in node ? node.attrs.find(attr => attr.name === 'href')?.value : undefined))
    );
    expect(componentUrls.size).toBeGreaterThan(0);
    expect(componentUrls.size).toBe(componentLinks.length);
    const tests = await TestsService.getData();
    const examples = await ExamplesService.getData();
    const text = getText(homePage).replace(/\s+/g, ' ');
    expect(text).toContain(`${componentUrls.size.toLocaleString('en-US')}+ Components`);
    expect(text).toContain(`${getPatternCount(examples).toLocaleString('en-US')}+ Patterns`);
    expect(text).toContain(`${getTotalTests(tests.projects).toLocaleString('en-US')}+ automated tests`);
  });
});
