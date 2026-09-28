#!/usr/bin/env node
// Reads a monthly What's New post and prints a JSON outline for storyboarding.
//
//   node .agents/skills/summarize-video-releases/scripts/read-post.js            # newest post
//   node .agents/skills/summarize-video-releases/scripts/read-post.js --month 08-2026
//
// The outline is evidence for the storyboard, not copy to paste. It includes the
// resolved input and output paths so the agent never has to guess them.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const POSTS_DIR = 'projects/site/src/docs/whats-new';
const VIDEO_DIR = 'projects/site/public/static/video/releases';
const SITE_URL = 'https://nvidia.github.io/elements';

const { values } = parseArgs({
  options: {
    month: { type: 'string' },
    root: { type: 'string', default: process.cwd() }
  }
});

const root = resolve(values.root);
const postsDir = join(root, POSTS_DIR);
if (!existsSync(postsDir))
  fail(`No What's New directory at ${POSTS_DIR}. Run from the repository root or pass --root.`);

const slugPattern = /^(\d{2})-(\d{4})\.md$/;
const slugs = readdirSync(postsDir)
  .map(file => file.match(slugPattern))
  .filter(Boolean)
  .map(([, mm, yyyy]) => ({ slug: `${mm}-${yyyy}`, order: Number(yyyy) * 100 + Number(mm) }))
  .sort((a, b) => b.order - a.order);

const month = values.month ? normalizeMonth(values.month) : slugs[0]?.slug;
if (!month) fail('No monthly posts found. Create the post with the summarize-releases skill first.');

const postPath = join(POSTS_DIR, `${month}.md`);
if (!existsSync(join(root, postPath)))
  fail(`No post for ${month} at ${postPath}. Create it with the summarize-releases skill first.`);

const source = readFileSync(join(root, postPath), 'utf8');
const { frontmatter, body } = splitFrontmatter(source);
const sections = parseSections(body);
const highlightsIndex = sections.findIndex(s => s.level === 2 && /highlights/i.test(s.heading));
const packagesSection = sections.find(s => s.level === 2 && /released packages/i.test(s.heading));

// Posts use either "## Highlights" + "### Feature" or top-level "## Feature" sections.
const highlightSections =
  highlightsIndex >= 0
    ? sections.filter(
        (s, i) => s.level === 3 && i > highlightsIndex && (!packagesSection || i < sections.indexOf(packagesSection))
      )
    : sections.filter(s => s.level === 2 && s !== packagesSection);

const monthDate = frontmatter.updateMonth ? new Date(frontmatter.updateMonth) : monthToDate(month);
const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
  monthDate
);
const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(monthDate);

const outline = {
  month,
  monthLabel,
  monthName,
  post: {
    path: postPath,
    url: `${SITE_URL}/docs/whats-new/${month}/`,
    title: frontmatter.title,
    description: frontmatter.description,
    intro: sections[0]?.level === 0 ? (sections[0].paragraphs[0] ?? '') : ''
  },
  output: {
    video: `${VIDEO_DIR}/${month}.webm`,
    poster: `${VIDEO_DIR}/${month}.jpg`,
    publicUrl: `/static/video/releases/${month}.webm`,
    exists: existsSync(join(root, VIDEO_DIR, `${month}.webm`))
  },
  highlights: highlightSections.map(s => ({
    heading: s.heading,
    summary: s.paragraphs.join(' ').replace(/\s+/g, ' ').trim(),
    links: s.links,
    code: s.code
  })),
  packages: packagesSection ? packagesSection.items.map(item => item.replace(/`([^`]+)`/g, '$1')) : []
};

process.stdout.write(`${JSON.stringify(outline, null, 2)}\n`);

function normalizeMonth(input) {
  const mmYyyy = input.match(/^(\d{1,2})-(\d{4})$/);
  const yyyyMm = input.match(/^(\d{4})-(\d{1,2})$/);
  if (mmYyyy) return `${mmYyyy[1].padStart(2, '0')}-${mmYyyy[2]}`;
  if (yyyyMm) return `${yyyyMm[2].padStart(2, '0')}-${yyyyMm[1]}`;
  fail(`Unrecognized month "${input}". Use MM-YYYY (for example 08-2026) or YYYY-MM.`);
}

function monthToDate(slug) {
  const [mm, yyyy] = slug.split('-');
  return new Date(Date.UTC(Number(yyyy), Number(mm) - 1, 1));
}

function splitFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: text };
  const raw = match[1];
  const frontmatter = {};
  // Posts use JS-object frontmatter; read the simple string fields without evaluating it.
  for (const [, key, value] of raw.matchAll(/^\s*(\w+):\s*'((?:[^'\\]|\\.)*)'/gm))
    frontmatter[key] = value.replace(/\\'/g, "'");
  return { frontmatter, body: text.slice(match[0].length) };
}

function parseSections(text) {
  const sections = [{ level: 0, heading: '', paragraphs: [], code: [], links: [], items: [] }];
  let current = sections[0];
  let fence = null;
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) current.paragraphs.push(stripMarkdown(paragraph.join(' ')));
    paragraph = [];
  };

  for (const line of text.split('\n')) {
    if (fence) {
      if (line.startsWith('```')) {
        current.code.push(fence);
        fence = null;
      } else fence.source += (fence.source ? '\n' : '') + line;
      continue;
    }
    const fenceOpen = line.match(/^```(\w*)/);
    if (fenceOpen) {
      flush();
      fence = { language: fenceOpen[1] || 'text', source: '' };
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      flush();
      current = {
        level: heading[1].length,
        heading: heading[2].trim(),
        paragraphs: [],
        code: [],
        links: [],
        items: []
      };
      sections.push(current);
      continue;
    }
    const item = line.match(/^\s*[-*]\s+(.*)$/);
    if (item) {
      flush();
      current.items.push(stripMarkdown(item[1]));
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    for (const [, label, href] of line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) current.links.push({ label, href });
    paragraph.push(line.trim());
  }
  flush();
  return sections;
}

function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .trim();
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
