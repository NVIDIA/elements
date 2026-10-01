#!/usr/bin/env node
// Renders a composed video page to WebM (plus a lossless WebP poster), or to WebP review stills.
//
//   # review stills at chosen times (seconds)
//   node .agents/skills/summarize-video-releases/scripts/render-video.js --html <dir>/video.html --stills 1.5,6,11 --stills-dir <dir>/stills
//
//   # post snapshots: only feature, terminal, and fix scenes; skips "Also in ..." lists and cards
//   node .agents/skills/summarize-video-releases/scripts/render-video.js --html <dir>/video.html --stills 6,11,20 --snapshots --stills-dir <dir>/snapshots
//
//   # final render: projects/site/public/static/video/releases/08-2026.webm and .webp
//   node .agents/skills/summarize-video-releases/scripts/render-video.js --html <dir>/video.html --month 08-2026
//
// Elements CDN URLs in the page are served from this repository's built packages
// (projects/<package>/dist) when its version matches the requested version and a
// self-contained build exists. Anything else loads from the public CDN; pass
// --offline to forbid that.
// Frames are captured on a virtual clock: CSS animations, component animations,
// and transitions are all seeked to the frame time, so output is deterministic.
// Encoding uses the browser's own WebCodecs VP9 encoder (libvpx, BSD-licensed and
// royalty-free) and a built-in WebM muxer, so no external video encoder is required.
// Sharp converts PNG screenshots to lossless WebP posters and stills.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';
import { resolveAssetPath } from './asset-path.js';
import { muxWebM } from './webm.js';

const VIDEO_DIR = 'projects/site/public/static/video/releases';
const CDN = /^https:\/\/cdn\.jsdelivr\.net\/npm\/(@nvidia-elements\/[\w-]+)@([^/]+)\/(.+?)(?:\/\+esm)?$/;
const TYPES = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const { values } = parseArgs({
  options: {
    html: { type: 'string' },
    month: { type: 'string' },
    out: { type: 'string' },
    poster: { type: 'string' },
    stills: { type: 'string' },
    snapshots: { type: 'boolean', default: false },
    'stills-dir': { type: 'string' },
    fps: { type: 'string', default: '30' },
    quality: { type: 'string', default: '34' },
    bitrate: { type: 'string', default: '2500000' },
    root: { type: 'string', default: process.cwd() },
    offline: { type: 'boolean', default: false },
    channel: { type: 'string' },
    'browser-path': { type: 'string', default: process.env.CHROMIUM_PATH }
  }
});

const root = resolve(values.root);
if (!values.html) fail('Pass --html <composed video page>.');
const htmlPath = resolve(values.html);
const fps = Number(values.fps);
let stills = values.stills
  ? values.stills
      .split(',')
      .map(Number)
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b)
  : null;
const outPath = values.out ? resolve(values.out) : values.month ? join(root, VIDEO_DIR, `${values.month}.webm`) : null;
const posterPath = values.poster ? resolve(values.poster) : outPath ? outPath.replace(/\.webm$/, '.webp') : null;
if (!stills && !outPath)
  fail('Pass --stills <times> for review, or --month MM-YYYY / --out <file.webm> for the final render.');
if (outPath && !outPath.endsWith('.webm')) fail('The renderer writes WebM (VP9). Use a .webm output path.');
if (posterPath && !posterPath.endsWith('.webp')) fail('The renderer writes WebP posters. Use a .webp poster path.');
const skipped = [];
if (values.snapshots) {
  if (!stills) fail('Pass --stills <times> with --snapshots to export post images.');
  // The composer saves scene types and timing in comments in the rendered HTML.
  // Read those saved timings so snapshot selection matches the archived video page.
  const scenes = [...readFileSync(htmlPath, 'utf8').matchAll(/<!-- \d+\. (\w+): ([\d.]+)s to ([\d.]+)s -->/g)].map(
    ([, type, start, end]) => ({ type, start: Number(start), end: Number(end) })
  );
  if (!scenes.length) fail('No scene timings found. Compose the video page before exporting snapshots.');
  stills = stills.filter(time => {
    const scene = scenes.find(s => time >= s.start && time < s.end);
    if (scene && ['feature', 'terminal', 'fix'].includes(scene.type)) return true;
    skipped.push({ time, scene: scene?.type ?? null });
    return false;
  });
  if (!stills.length)
    fail('No feature, terminal, or fix scene times selected. List scenes and cards have no post snapshots.');
}

const packageDirs = mapPackages(root);
const missingAssets = new Set();

/* ---------- static server: the composed page, site static files, and the repo ---------- */
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file;
  if (url.pathname === '/__encoder') {
    res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>encoder</title>');
    return;
  }
  if (url.pathname.startsWith('/__video/')) file = resolveAssetPath(dirname(htmlPath), url.pathname.slice(9));
  else if (url.pathname.startsWith('/static/'))
    file = resolveAssetPath(join(root, 'projects/site/public'), url.pathname.slice(1));
  else file = resolveAssetPath(root, url.pathname.slice(1));
  if (!file || statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  const body = readFileSync(file);
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  // media elements need byte ranges to seek
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range && (range[1] || range[2])) {
    // a suffix range (bytes=-N) asks for the final N bytes
    const suffix = !range[1];
    const start = suffix ? Math.max(body.length - Number(range[2]), 0) : Number(range[1]);
    const end = suffix || !range[2] ? body.length - 1 : Math.min(Number(range[2]), body.length - 1);
    if (start >= body.length || start > end || (suffix && Number(range[2]) === 0)) {
      res.writeHead(416, { 'content-range': `bytes */${body.length}` }).end();
      return;
    }
    res.writeHead(206, {
      'content-type': type,
      'accept-ranges': 'bytes',
      'content-range': `bytes ${start}-${end}/${body.length}`,
      'content-length': end - start + 1
    });
    res.end(body.subarray(start, end + 1));
    return;
  }
  res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  fail(
    'Playwright is not available. Run `mise run install` from the repository root, then `mise exec -- pnpm run playwright`.'
  );
}

// Playwright's bundled Chromium cannot decode H.264; --channel chrome uses an installed Google Chrome, which can.
const browser = await chromium.launch({ executablePath: values['browser-path'] || undefined, channel: values.channel });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1.5,
  reducedMotion: 'no-preference'
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
page.on('console', m => m.type() === 'error' && pageErrors.push(m.text()));

const networkAssets = new Set();
await page.route('https://cdn.jsdelivr.net/**', async route => {
  const url = route.request().url();
  const file = resolveLocal(url);
  if (file)
    return route.fulfill({
      status: 200,
      contentType: TYPES[extname(file)] ?? 'application/octet-stream',
      body: readFileSync(file)
    });
  if (!values.offline) {
    networkAssets.add(url);
    return route.continue();
  }
  missingAssets.add(url);
  return route.fulfill({ status: 404, body: '' });
});

await page.goto(`${origin}/__video/${encodeURIComponent(basename(htmlPath))}?record`);
try {
  await page.waitForFunction(() => window.__video, null, { timeout: 30000 });
} catch {
  await finish(1, 'The page never became ready.');
}
if (missingAssets.size) {
  await finish(
    1,
    `No matching local build for:\n  ${[...missingAssets].join('\n  ')}\nBuild the pinned package versions, or drop --offline to use the public CDN.`
  );
}
const info = await page.evaluate(() => ({
  duration: window.__video.duration,
  poster: window.__video.poster,
  undefinedTags: window.__video.undefinedTags
}));
if (info.undefinedTags.length)
  await finish(
    1,
    `Undefined elements: ${info.undefinedTags.join(', ')}. Add the missing package imports to the storyboard "imports" list (use \`nve api.imports.get\`).`
  );

if (stills) {
  const dir = resolve(values['stills-dir'] ?? join(dirname(htmlPath), 'stills'));
  mkdirSync(dir, { recursive: true });
  const step = 1 / 10;
  const report = [];
  let next = 0;
  // step forward in small increments so transitions progress naturally before each still
  for (let t = 0; next < stills.length && t <= info.duration + 1e-6; t += step) {
    await page.evaluate(time => window.__video.seek(time), t);
    while (next < stills.length && stills[next] <= t + step / 2) {
      const file = join(dir, `still-${stills[next].toFixed(2)}.webp`);
      await captureWebP(file);
      const overflow = await page.evaluate(() => window.__video.overflow());
      report.push({ time: stills[next], file, overflow });
      next++;
    }
  }
  process.stdout.write(
    `${JSON.stringify({ stills: report, ...(values.snapshots ? { skipped } : {}), network: [...networkAssets], errors: pageErrors }, null, 2)}\n`
  );
  await finish(0);
}

/* ---------- final render ---------- */
mkdirSync(dirname(outPath), { recursive: true });
mkdirSync(dirname(posterPath), { recursive: true });
const frames = Math.round(info.duration * fps);
const posterFrame = Math.round(info.poster * fps);
if (!Number.isFinite(fps) || fps <= 0 || !Number.isFinite(info.poster) || posterFrame < 0 || posterFrame >= frames) {
  await finish(1, 'The frame rate must be positive and the poster time must be within the video duration.');
}
const WIDTH = 1920,
  HEIGHT = 1080;
// Frame-count intervals, not fractional-fps modulo divisors, so a fractional fps
// (e.g. 29.97) still yields periodic keyframes and drains instead of only at i === 0.
const drainInterval = Math.max(1, Math.round(fps));
const keyframeInterval = Math.max(1, Math.round(fps * 2));
const progressInterval = Math.max(1, Math.round(fps * 5));

// A separate page on the same localhost origin (WebCodecs needs a secure context) keeps
// encoder work out of the page being recorded.
const encoderPage = await context.newPage();
await encoderPage.goto(`${origin}/__encoder`);
const setup = await encoderPage.evaluate(
  async ({ width, height, fps, quality, bitrate }) => {
    if (typeof VideoEncoder === 'undefined') return { error: 'This browser has no WebCodecs VideoEncoder.' };
    const base = { codec: 'vp09.00.40.08', width, height, framerate: fps, latencyMode: 'quality' };
    // Prefer constant quality (like a CRF); fall back to variable bitrate.
    const candidates = [
      { ...base, bitrateMode: 'quantizer' },
      { ...base, bitrateMode: 'variable', bitrate }
    ];
    let config;
    for (const candidate of candidates) {
      if ((await VideoEncoder.isConfigSupported(candidate)).supported) {
        config = candidate;
        break;
      }
    }
    if (!config) return { error: 'This browser cannot encode 1080p VP9.' };
    window.__chunks = [];
    window.__encoderError = null;
    window.__encoder = new VideoEncoder({
      output: chunk => {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        window.__chunks.push({ key: chunk.type === 'key', timestamp: chunk.timestamp, data });
      },
      error: e => (window.__encoderError = String(e))
    });
    window.__encoder.configure(config);
    window.__quantizer = config.bitrateMode === 'quantizer' ? quality : undefined;
    window.__toBase64 = bytes => {
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(binary);
    };
    return { mode: config.bitrateMode };
  },
  { width: WIDTH, height: HEIGHT, fps, quality: Number(values.quality), bitrate: Number(values.bitrate) }
);
if (setup.error) await finish(1, setup.error);

const chunks = [];
const drain = async () => {
  const batch = await encoderPage.evaluate(() =>
    window.__chunks.splice(0).map(c => ({ key: c.key, timestamp: c.timestamp, data: window.__toBase64(c.data) }))
  );
  for (const c of batch)
    chunks.push({ key: c.key, timestamp: c.timestamp, data: new Uint8Array(Buffer.from(c.data, 'base64')) });
};

const started = Date.now();
for (let i = 0; i < frames; i++) {
  await page.evaluate(time => window.__video.seek(time), i / fps);
  const frame = await page.screenshot({ type: 'jpeg', quality: 95 });
  if (i === posterFrame && posterPath) await captureWebP(posterPath);
  const error = await encoderPage.evaluate(
    async ({ jpeg, i, fps, keyframeInterval }) => {
      const bytes = Uint8Array.from(atob(jpeg), c => c.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }));
      const frame = new VideoFrame(bitmap, { timestamp: Math.round((i * 1e6) / fps), duration: Math.round(1e6 / fps) });
      const options = { keyFrame: i % keyframeInterval === 0 };
      if (window.__quantizer !== undefined) options.vp9 = { quantizer: window.__quantizer };
      window.__encoder.encode(frame, options);
      frame.close();
      bitmap.close();
      while (window.__encoder.encodeQueueSize > 4)
        await new Promise(r => window.__encoder.addEventListener('dequeue', r, { once: true }));
      return window.__encoderError;
    },
    { jpeg: frame.toString('base64'), i, fps, keyframeInterval }
  );
  if (error) await finish(1, `Encoding failed at frame ${i}: ${error}`);
  if (i % drainInterval === 0) await drain();
  if (i % progressInterval === 0)
    process.stderr.write(`frame ${i}/${frames} (${((Date.now() - started) / 1000).toFixed(0)}s)\n`);
}
await encoderPage.evaluate(() => window.__encoder.flush());
await drain();
chunks.sort((a, b) => a.timestamp - b.timestamp);
writeFileSync(outPath, muxWebM({ width: WIDTH, height: HEIGHT, fps, chunks }));

const size = statSync(outPath).size;
const duration = +((chunks.at(-1).timestamp + 1e6 / fps) / 1e6).toFixed(3);
process.stdout.write(
  `${JSON.stringify({ video: outPath, poster: posterPath, codec: 'VP9', mode: setup.mode, duration, frames: chunks.length, megabytes: +(size / 1e6).toFixed(2), network: [...networkAssets], errors: pageErrors }, null, 2)}\n`
);
await finish(0);

/* ---------- helpers ---------- */
async function captureWebP(file) {
  const png = await page.screenshot({ type: 'png' });
  writeFileSync(file, await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer());
}

// Serve a CDN URL from the local build when a self-contained file exists: bundle paths
// map directly, other subpaths go through the package "exports" map. Files that still
// contain bare imports (for example "lit") cannot load in a browser without a bundler,
// so those fall through to the public CDN, which pins and resolves them.
function resolveLocal(url) {
  const match = url.match(CDN);
  const pkg = match && packageDirs.get(match[1]);
  if (!pkg || match[2] !== pkg.version) return null;
  const { dir } = pkg;
  const subpath = match[3];
  // A locally served `+esm` entry resolves its relative imports against the CDN URL,
  // which omits `dist/`, so also look for the file inside the build output.
  const candidates = [
    subpath,
    subpath.replace(/index\.min\.js$/, 'index.js'),
    ...fromExports(dir, subpath),
    `dist/${subpath}`
  ];
  for (const candidate of candidates) {
    const file = resolveAssetPath(dir, candidate.replace(/^\.\//, ''));
    if (!file || statSync(file).isDirectory()) continue;
    if (
      /\.m?js$/.test(file) &&
      /(?:^|[\s;}])(?:import|export)[^'"`]*?from\s*["'](?![./]|https?:)|import\s*\(?\s*["'](?![./]|https?:)/m.test(
        readFileSync(file, 'utf8')
      )
    )
      continue;
    return file;
  }
  return null;
}

function fromExports(dir, subpath) {
  try {
    const { exports } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    if (!exports || typeof exports !== 'object') return [];
    const key = `./${subpath}`;
    const target = value => (typeof value === 'string' ? value : (value?.browser ?? value?.import ?? value?.default));
    if (exports[key]) return [target(exports[key])].filter(Boolean);
    for (const [pattern, value] of Object.entries(exports)) {
      if (!pattern.includes('*')) continue;
      const [prefix, suffix] = pattern.split('*');
      if (key.startsWith(prefix) && key.endsWith(suffix)) {
        const star = key.slice(prefix.length, key.length - suffix.length);
        const mapped = target(value);
        if (mapped) return [mapped.replace('*', star)];
      }
    }
  } catch {}
  return [];
}

function mapPackages(repoRoot) {
  const map = new Map();
  const projects = join(repoRoot, 'projects');
  if (!existsSync(projects)) return map;
  for (const name of readdirSync(projects)) {
    const pkg = join(projects, name, 'package.json');
    if (!existsSync(pkg)) continue;
    try {
      const { name: packageName, version } = JSON.parse(readFileSync(pkg, 'utf8'));
      if (packageName?.startsWith('@nvidia-elements/')) map.set(packageName, { dir: join(projects, name), version });
    } catch {}
  }
  return map;
}

async function finish(code, message) {
  if (message) process.stderr.write(`${message}\n`);
  if (pageErrors.length && code) process.stderr.write(`Page errors:\n  ${pageErrors.join('\n  ')}\n`);
  await browser?.close();
  server.close();
  process.exit(code);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
