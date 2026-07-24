import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ATOM_FEED_TEMPLATE,
  ATOM_UPDATES_COLLECTION,
  RSS_FEED_TEMPLATE,
  RSS_UPDATES_COLLECTION,
  UPDATE_FEEDS,
  UPDATE_FEED_METADATA,
  UPDATES_COLLECTION,
  getAtomUpdatesCollection,
  getRssUpdatesCollection,
  updatesFeedPlugin
} from './updates-feed.js';

describe('updatesFeedPlugin', () => {
  let publicOutputPath;

  afterEach(async () => {
    if (publicOutputPath) await rm(publicOutputPath, { force: true, recursive: true });
  });

  it('should generate RSS and Atom from the updates collection', () => {
    const addCollection = vi.fn();
    const addPlugin = vi.fn();
    const addTemplate = vi.fn();
    const on = vi.fn();

    updatesFeedPlugin({ addCollection, addPlugin, addTemplate, on });

    expect(addCollection).toHaveBeenCalledWith(RSS_UPDATES_COLLECTION, getRssUpdatesCollection);
    expect(addCollection).toHaveBeenCalledWith(ATOM_UPDATES_COLLECTION, getAtomUpdatesCollection);
    expect(addPlugin).toHaveBeenCalledOnce();
    expect(addPlugin.mock.calls[0]).toHaveLength(1);
    expect(addTemplate.mock.calls).toEqual(
      UPDATE_FEEDS.map(feed => [
        feed.inputPath,
        feed.type === 'atom' ? ATOM_FEED_TEMPLATE : RSS_FEED_TEMPLATE,
        {
          eleventyExcludeFromCollections: [feed.collection],
          eleventyImport: { collections: [feed.collection] },
          layout: false,
          metadata: UPDATE_FEED_METADATA,
          permalink: feed.outputPath
        }
      ])
    );
    expect(on).toHaveBeenCalledWith('eleventy.after', expect.any(Function));
  });

  it('should use explicit publication dates and descriptions in chronologically sorted feeds', () => {
    const post = {
      content: '<p>Post content.</p>',
      data: {
        dateModified: '2026-07-23',
        datePublished: '2026-07-22',
        description: 'The post description.',
        title: 'What’s new',
        updateMonth: '2026-07-01'
      },
      date: new Date('2026-07-22T00:00:00Z'),
      url: '/docs/whats-new/07-2026/'
    };
    const collectionApi = {
      getFilteredByTag: vi.fn().mockReturnValue([
        post,
        {
          ...post,
          data: { ...post.data, title: 'What’s new in June', updateMonth: '2026-06-01' },
          url: '/docs/whats-new/06-2026/'
        }
      ])
    };
    const rssPosts = getRssUpdatesCollection(collectionApi);
    const atomPosts = getAtomUpdatesCollection(collectionApi);
    const rssPost = rssPosts[1];
    const atomPost = atomPosts[1];

    expect(rssPosts.map(entry => entry.url)).toEqual(['/docs/whats-new/06-2026/', '/docs/whats-new/07-2026/']);
    expect(atomPosts.map(entry => entry.url)).toEqual(['/docs/whats-new/06-2026/', '/docs/whats-new/07-2026/']);
    expect(rssPost).toMatchObject({
      data: {
        dateModified: new Date('2026-07-23T00:00:00Z'),
        datePublished: new Date('2026-07-22T00:00:00Z')
      },
      date: new Date('2026-07-22T00:00:00Z'),
      url: post.url
    });
    expect(atomPost).toMatchObject({
      data: {
        dateModified: new Date('2026-07-23T00:00:00Z'),
        datePublished: new Date('2026-07-22T00:00:00Z'),
        summary: post.data.description
      },
      date: new Date('2026-07-23T00:00:00Z'),
      url: post.url
    });
    expect(rssPost.content).toBe(post.content);
    expect(atomPost.content).toBe(post.content);
    expect(collectionApi.getFilteredByTag).toHaveBeenCalledWith(UPDATES_COLLECTION);
    expect(post.data).not.toHaveProperty('summary');
  });

  it('should emit separate published and updated Atom dates', () => {
    expect(ATOM_FEED_TEMPLATE).toContain('<updated>{{ post.data.dateModified | dateToRfc3339 }}</updated>');
    expect(ATOM_FEED_TEMPLATE).toContain('<published>{{ post.data.datePublished | dateToRfc3339 }}</published>');
    expect(RSS_FEED_TEMPLATE).toContain('<pubDate>{{ post.date | dateToRfc822("UTC") }}</pubDate>');
  });

  it('should escape Atom text constructs', () => {
    expect(ATOM_FEED_TEMPLATE).toContain('<summary>{{ post.data.summary | escape }}</summary>');
    expect(ATOM_FEED_TEMPLATE).toContain(
      '<content type="html">{{ post.content | renderTransforms(post.data.page, metadata.base) | escape }}</content>'
    );
  });

  it('should publish generated feeds to the Vite public directory', async () => {
    publicOutputPath = await mkdtemp(join(tmpdir(), 'elements-updates-feed-'));
    const on = vi.fn();
    const atom = '<feed>updates</feed>';
    updatesFeedPlugin({ addCollection: vi.fn(), addPlugin: vi.fn(), addTemplate: vi.fn(), on }, { publicOutputPath });
    const afterBuild = on.mock.calls.find(([event]) => event === 'eleventy.after')?.[1];

    await afterBuild({
      results: [
        { content: '<rss>updates</rss>', url: '/feed.xml' },
        { content: atom, url: '/atom.xml' },
        { content: '<html></html>', url: '/index.html' }
      ]
    });

    await expect(readFile(join(publicOutputPath, 'feed.xml'), 'utf-8')).resolves.toBe('<rss>updates</rss>');
    await expect(readFile(join(publicOutputPath, 'atom.xml'), 'utf-8')).resolves.toBe(atom);
  });
});
