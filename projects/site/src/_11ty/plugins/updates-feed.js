import { promises as fsp } from 'node:fs';
import nodePath from 'node:path';
import rssPlugin from '@11ty/eleventy-plugin-rss';
import { getContentDates, normalizeContentDate } from '../utils/content-dates.js';
import { ELEMENTS_SITE_ORIGIN } from '../utils/site-url.js';

const DEFAULT_PUBLIC_OUTPUT_PATH = './.11ty-vite/public';

export const UPDATES_COLLECTION = 'updates';
export const RSS_UPDATES_COLLECTION = 'rssUpdates';
export const ATOM_UPDATES_COLLECTION = 'atomUpdates';

export const UPDATE_FEEDS = [
  {
    collection: RSS_UPDATES_COLLECTION,
    inputPath: 'updates-feed-rss.njk',
    label: 'RSS',
    outputPath: '/feed.xml',
    type: 'rss'
  },
  {
    collection: ATOM_UPDATES_COLLECTION,
    inputPath: 'updates-feed-atom.njk',
    label: 'Atom',
    outputPath: '/atom.xml',
    type: 'atom'
  }
];

export const UPDATE_FEED_METADATA = {
  author: { name: 'NVIDIA Elements' },
  base: ELEMENTS_SITE_ORIGIN,
  language: 'en',
  subtitle:
    'What’s new in the NVIDIA Elements Design System, including product updates, release highlights, and announcements.',
  title: 'NVIDIA Elements updates'
};

export const RSS_FEED_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xml:base="{{ metadata.base | addPathPrefixToFullUrl }}" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{{ metadata.title }}</title>
    <link>{{ metadata.base | addPathPrefixToFullUrl }}</link>
    <atom:link href="{{ permalink | htmlBaseUrl(metadata.base) }}" rel="self" type="application/rss+xml" />
    <description>{{ metadata.subtitle }}</description>
    <language>{{ metadata.language or page.lang }}</language>
    {%- for post in collections['${RSS_UPDATES_COLLECTION}'] | reverse %}
    {%- set absolutePostUrl = post.url | htmlBaseUrl(metadata.base) %}
    <item>
      <title>{{ post.data.title }}</title>
      <link>{{ absolutePostUrl }}</link>
      <description>{{ post.content | renderTransforms(post.data.page, metadata.base) }}</description>
      <pubDate>{{ post.date | dateToRfc822("UTC") }}</pubDate>
      <dc:creator>{{ metadata.author.name }}</dc:creator>
      <guid>{{ absolutePostUrl }}</guid>
    </item>
    {%- endfor %}
  </channel>
</rss>`;

export const ATOM_FEED_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="{{ metadata.language or page.lang }}">
  <title>{{ metadata.title }}</title>
  <subtitle>{{ metadata.subtitle }}</subtitle>
  <link href="{{ permalink | htmlBaseUrl(metadata.base) }}" rel="self" />
  <link href="{{ metadata.base | addPathPrefixToFullUrl }}" />
  <updated>{{ collections['${ATOM_UPDATES_COLLECTION}'] | getNewestCollectionItemDate | dateToRfc3339 }}</updated>
  <id>{{ metadata.base | addPathPrefixToFullUrl }}</id>
  <author>
    <name>{{ metadata.author.name }}</name>
  </author>
  {%- for post in collections['${ATOM_UPDATES_COLLECTION}'] | reverse %}
  {%- set absolutePostUrl %}{{ post.url | htmlBaseUrl(metadata.base) }}{% endset %}
  <entry>
    <title>{{ post.data.title }}</title>
    <link href="{{ absolutePostUrl }}" />
    <updated>{{ post.data.dateModified | dateToRfc3339 }}</updated>
    <published>{{ post.data.datePublished | dateToRfc3339 }}</published>
    <id>{{ absolutePostUrl }}</id>
    <summary>{{ post.data.summary | escape }}</summary>
    <content type="html">{{ post.content | renderTransforms(post.data.page, metadata.base) | escape }}</content>
  </entry>
  {%- endfor %}
</feed>`;

export async function writeUpdateFeeds(results, publicOutputPath = DEFAULT_PUBLIC_OUTPUT_PATH) {
  const feeds = new Map(UPDATE_FEEDS.map(feed => [feed.outputPath, feed]));
  const generatedFeeds = results.filter(result => feeds.has(result.url));

  await fsp.mkdir(publicOutputPath, { recursive: true });
  await Promise.all(
    generatedFeeds.map(result =>
      fsp.writeFile(nodePath.join(publicOutputPath, result.url.slice(1)), result.content, 'utf-8')
    )
  );
}

function getFeedDates(post) {
  const dates = getContentDates(post.data);
  const published = new Date(dates.datePublished ?? normalizeContentDate(post.date));
  const modified = new Date(dates.dateModified ?? published);

  return { modified, published };
}

export function sortUpdatesByMonth(posts) {
  return [...posts].sort((left, right) => {
    const leftMonth = new Date(left.data.updateMonth ?? left.date);
    const rightMonth = new Date(right.data.updateMonth ?? right.date);
    return leftMonth - rightMonth;
  });
}

function createFeedPost(post, { atom = false } = {}) {
  const { modified, published } = getFeedDates(post);
  return {
    get content() {
      return post.content;
    },
    data: {
      ...post.data,
      ...(atom ? { summary: post.data.description } : {}),
      dateModified: modified,
      datePublished: published
    },
    date: atom ? modified : published,
    url: post.url
  };
}

export function getRssUpdatesCollection(collectionApi) {
  return sortUpdatesByMonth(collectionApi.getFilteredByTag(UPDATES_COLLECTION)).map(post => createFeedPost(post));
}

export function getAtomUpdatesCollection(collectionApi) {
  return sortUpdatesByMonth(collectionApi.getFilteredByTag(UPDATES_COLLECTION)).map(post =>
    createFeedPost(post, { atom: true })
  );
}

export function updatesFeedPlugin(eleventyConfig, { publicOutputPath = DEFAULT_PUBLIC_OUTPUT_PATH } = {}) {
  eleventyConfig.addCollection(RSS_UPDATES_COLLECTION, getRssUpdatesCollection);
  eleventyConfig.addCollection(ATOM_UPDATES_COLLECTION, getAtomUpdatesCollection);
  eleventyConfig.addPlugin(rssPlugin);

  for (const feed of UPDATE_FEEDS) {
    eleventyConfig.addTemplate(feed.inputPath, feed.type === 'atom' ? ATOM_FEED_TEMPLATE : RSS_FEED_TEMPLATE, {
      eleventyExcludeFromCollections: [feed.collection],
      eleventyImport: { collections: [feed.collection] },
      layout: false,
      metadata: UPDATE_FEED_METADATA,
      permalink: feed.outputPath
    });
  }
  eleventyConfig.on('eleventy.after', ({ results } = {}) => writeUpdateFeeds(results ?? [], publicOutputPath));
}
