#!/usr/bin/env node
// Composes a storyboard JSON file into a single static HTML video page.
//
//   node .agents/skills/summarize-video-releases/scripts/compose-video.js \
//     --storyboard <dir>/storyboard.json --out <dir>/video.html
//
// Every scene becomes static nve-* markup so `nve api.validate` can check the
// whole page. All timing is computed here from scene durations, so storyboards
// only ever use times relative to the start of their own scene.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const SHELL = join(here, '../assets/video-shell.html');
const MIN_DURATION = 24;
const MAX_DURATION = 36;
// Hold each scene 20% longer; entrance animations and cue offsets retain their timing.
const DEFAULT_DURATIONS = { hook: 3.6, title: 3.6, feature: 5.4, terminal: 5.4, fix: 6.6, list: 4.2, end: 4.2 };

const { values } = parseArgs({
  options: {
    storyboard: { type: 'string' },
    out: { type: 'string' },
    'allow-duration': { type: 'boolean', default: false }
  }
});
if (!values.storyboard || !values.out) fail('Usage: compose-video.js --storyboard <file> --out <file.html>');

const board = JSON.parse(readFileSync(resolve(values.storyboard), 'utf8'));
const packageVersions = ['core', 'code', 'styles', 'themes'];
for (const name of packageVersions) {
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(board.versions?.[name] ?? '')) {
    fail(`Storyboard needs versions.${name} with an exact released package version.`);
  }
}
const warnings = [];
const cues = [];
const counters = [];
let uid = 0;

/* ---------- helpers ---------- */
const esc = s =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const sec = n => `${Math.round(n * 1000) / 1000}s`;
const at = t => `--at: ${sec(t)}`;
// Storyboard markup may time its own entrances relative to the scene: style="--at: +0.8s".
const relative = (html, t0) =>
  String(html ?? '').replace(/--at:\s*\+([0-9.]+)s/g, (_, x) => `--at: ${sec(t0 + Number(x))}`);

function words(text, t0, cls = 'mega', tag = 'h2', extra = '') {
  const parts = String(text).split(/\s+/).filter(Boolean);
  const spans = parts
    .map((w, i) => `<span class="mask"><span class="word" style="${at(t0 + i * 0.07)}">${esc(w)}</span></span>`)
    .join(' ');
  return `<${tag} class="${cls}"${extra}>${spans}</${tag}>`;
}

function headlineClass(text, preferred = 'mega') {
  const length = String(text).length;
  if (preferred === 'mega' && length > 34)
    warnings.push(`Headline "${text}" is ${length} characters; aim for 34 or fewer so it reads in one glance.`);
  return preferred;
}

function codeblock(code, language = 'html', extra = '') {
  // nve-codeblock reads <template> content as text, so markup must be entity-escaped.
  return `<nve-codeblock language="${esc(language)}"${extra}><template>${esc(code.trim())}</template></nve-codeblock>`;
}

function checkCodeWidth(source, limit, where) {
  const longest = Math.max(
    ...String(source)
      .split('\n')
      .map(l => l.length)
  );
  if (longest > limit)
    warnings.push(
      `Code in "${where}" has a ${longest}-character line; wrap attributes onto new lines to stay within ${limit} so nothing scrolls out of view.`
    );
}

function highlightHtml(raw) {
  const pattern = /(<\/?)([\w-]+)|([\w-]+)(=)("[^"]*")|("[^"]*")/g;
  let out = '';
  let last = 0;
  for (const m of raw.matchAll(pattern)) {
    out += esc(raw.slice(last, m.index));
    if (m[2]) out += `${esc(m[1])}<span class="tk-t">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tk-a">${esc(m[3])}</span>=<span class="tk-s">${esc(m[5])}</span>`;
    else out += `<span class="tk-s">${esc(m[6])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(raw.slice(last));
}

function addCues(scene, t0) {
  for (const cue of scene.cues ?? []) {
    if (cue.at === undefined || !cue.target) {
      warnings.push(`Cue ${JSON.stringify(cue)} needs "at" and "target".`);
      continue;
    }
    const kind = 'attr' in cue ? 'attr' : 'prop' in cue ? 'prop' : 'style' in cue ? 'style' : 'text';
    const name = cue.attr ?? cue.prop ?? cue.style;
    if (cue.duration !== undefined && (kind === 'text' || !Number.isFinite(Number(cue.value)))) {
      warnings.push(`Cue ${JSON.stringify(cue)} can only ease numeric attr, prop, or style values.`);
    }
    cues.push({
      t: t0 + cue.at,
      target: cue.target,
      kind,
      name,
      value: cue.value,
      duration: cue.duration,
      unit: cue.unit
    });
  }
}

/* ---------- scenes ---------- */
const renderers = {
  hook(s, t0) {
    const lines = (s.lines ?? [])
      .map((line, i) => words(line, t0 + 0.15 + i * 1.0, i === 0 ? 'hero' : 'hero dim', i === 0 ? 'h1' : 'p'))
      .join('\n');
    const chips = (s.chips ?? [])
      .map(
        (chip, i) =>
          `<code class="guess" style="${at(t0 + 1.6 + i * 0.18)}; --r: ${i % 2 ? 1.5 : -1.5}deg">${esc(chip)}</code>`
      )
      .join('\n');
    return `<div nve-layout="column gap:xl align:vertical-center full:height">${lines}${chips ? `<div nve-layout="row gap:md align:wrap">${chips}</div>` : ''}</div>`;
  },

  title(s, t0) {
    return `<div nve-layout="column gap:lg align:center full:height">
      <div class="stamp" style="${at(t0 + 0.1)}"><nve-logo size="lg" color="brand-green" aria-label="NVIDIA">NV</nve-logo></div>
      <p class="big dim" nve-text="center"><span class="mask"><span class="word" style="${at(t0 + 0.2)}">${esc(s.kicker ?? 'What’s new in NVIDIA Elements')}</span></span></p>
      ${words(s.month, t0 + 0.35, 'hero', 'h1', ' nve-text="center"')}
      ${s.line ? `<p class="lede rise" nve-text="center" style="${at(t0 + 0.9)}">${esc(s.line)}</p>` : ''}
    </div>`;
  },

  feature(s, t0) {
    const layout = s.layout ?? (s.code && s.html ? 'split' : s.code ? 'code' : 'demo');
    const tag = s.tag
      ? `<div class="pop" style="${at(t0 + 0.05)}"><nve-tag readonly>${esc(s.tag)}</nve-tag></div>`
      : '';
    const heading = `${tag}${words(s.headline, t0 + 0.1, headlineClass(s.headline))}${s.lede ? `<p class="lede rise" style="${at(t0 + 0.45)}">${esc(s.lede)}</p>` : ''}`;
    const zoom = s.zoom ? ` style="zoom: ${Number(s.zoom)}"` : '';
    const demo = s.html
      ? `<div class="demo${s.surface === false ? ' bare' : ''} rise" style="${at(t0 + 0.6)}"><div${zoom}>${relative(s.html, t0)}</div></div>`
      : '';
    if (s.code) checkCodeWidth(s.code.source, layout === 'split' ? 52 : 64, s.headline);
    const code = s.code
      ? `<div class="rise" style="${at(t0 + 0.4)}" nve-layout="column gap:xs full:width">${codeblock(s.code.source, s.code.language)}</div>`
      : '';
    addCues(s, t0);
    if (layout === 'split') {
      return `<div nve-layout="column gap:xl full:height">
        <div nve-layout="column gap:md">${heading}</div>
        <div nve-layout="grid gap:xl align:vertical-center"><div class="cell" nve-layout="span:6">${code}</div><div class="cell" nve-layout="span:6">${demo}</div></div>
      </div>`;
    }
    return `<div nve-layout="grid gap:xxl align:vertical-center full:height">
      <div class="cell" nve-layout="column gap:lg span:5">${heading}</div>
      <div class="cell" nve-layout="span:7">${layout === 'code' ? code : demo}</div>
    </div>`;
  },

  terminal(s, t0) {
    let t = t0 + 0.6;
    const lines = [];
    for (const c of s.commands ?? []) {
      const typeDur = Math.max(0.35, Math.min(0.9, c.cmd.length * 0.028));
      lines.push(
        `<span class="rise" style="${at(t)}"><span class="prompt">$ </span><span class="cmd type" style="${at(t)}; --dur: ${sec(typeDur)}; --steps: ${c.cmd.length}">${esc(c.cmd)}</span></span>`
      );
      t += typeDur + 0.2;
      for (const line of c.out ?? []) {
        const { text, tone } = typeof line === 'string' ? { text: line } : line;
        lines.push(
          `<span class="out rise" style="${at(t)}">${tone ? `<span class="${esc(tone)}">${esc(text)}</span>` : esc(text)}</span>`
        );
        t += 0.12;
      }
      t += 0.35;
    }
    if (t > t0 + (s.duration ?? DEFAULT_DURATIONS.terminal) - 0.6)
      warnings.push(
        `Terminal scene "${s.headline}" finishes typing at +${(t - t0).toFixed(2)}s; lengthen the scene or trim output.`
      );
    lines.push(`<span class="rise" style="${at(t)}"><span class="prompt">$ </span><span class="caret"></span></span>`);
    const counterRow = (s.stats ?? [])
      .map((stat, i) => {
        const id = `count-${++uid}`;
        counters.push({
          target: `#${id}`,
          from: 0,
          to: stat.value,
          t: t0 + 0.8 + i * 0.12,
          duration: 0.9,
          decimals: stat.decimals ?? 0
        });
        return `<div class="rise" style="${at(t0 + 0.8 + i * 0.12)}" nve-layout="column gap:sm"><span class="stat" id="${id}">0</span><span class="stat-label">${esc(stat.label)}</span></div>`;
      })
      .join('');
    return `<div nve-layout="grid gap:xxl align:vertical-center full:height">
      <div class="cell" nve-layout="column gap:lg span:5">${words(s.headline, t0 + 0.1, headlineClass(s.headline))}${s.lede ? `<p class="lede rise" style="${at(t0 + 0.45)}">${esc(s.lede)}</p>` : ''}${counterRow ? `<div nve-layout="row gap:xl">${counterRow}</div>` : ''}</div>
      <div class="rise cell" style="${at(t0 + 0.3)}" nve-layout="span:7">
        <nve-card>
          <nve-card-header><div nve-layout="row gap:xs align:vertical-center"><nve-dot status="danger" size="sm"></nve-dot><nve-dot status="warning" size="sm"></nve-dot><nve-dot status="success" size="sm"></nve-dot><span nve-text="label sm muted">${esc(s.title ?? 'terminal')}</span></div></nve-card-header>
          <nve-card-content><div class="term">${lines.join('\n')}</div></nve-card-content>
        </nve-card>
      </div>
    </div>`;
  },

  fix(s, t0) {
    const dur = s.duration ?? DEFAULT_DURATIONS.fix;
    const swaps = (s.lines ?? []).flat().filter(seg => typeof seg !== 'string').length;
    // swaps fix 0.25s apart; the pass message waits for the last one to finish
    const flagAt = 1.2,
      fixAt = Math.min(dur - 2.2, 3.0),
      passAt = fixAt + Math.max(0, swaps - 1) * 0.25 + 0.9;
    if (passAt > dur - 1)
      warnings.push(
        `Fix scene "${s.headline}" passes validation at +${passAt.toFixed(2)}s, leaving under 1s to read it; lengthen the scene or use fewer swaps.`
      );
    let swapIndex = 0;
    const renderLine = (line, n) => {
      const segments = Array.isArray(line) ? line : [line];
      const html = segments
        .map(seg => {
          if (typeof seg === 'string') return highlightHtml(seg);
          const i = swapIndex++;
          return `<span class="swap" style="${at(t0 + flagAt + i * 0.25)}; --fix: ${sec(t0 + fixAt + i * 0.25)}; --wb: ${seg.bad.length}; --wg: ${seg.good.length}"><span class="bad${seg.level === 'warning' ? ' warn' : ''}">${highlightHtml(seg.bad)}</span><span class="good">${highlightHtml(seg.good)}</span></span>`;
        })
        .join('');
      return `<span class="ln">${n + 1}</span>${html}`;
    };
    const problems = s.problems ?? [];
    const errors = problems.filter(p => p.level !== 'warning').length;
    const warns = problems.length - errors;
    const summary = [
      errors && `${errors} error${errors === 1 ? '' : 's'}`,
      warns && `${warns} warning${warns === 1 ? '' : 's'}`
    ]
      .filter(Boolean)
      .join(', ');
    const alerts = problems
      .map(
        (p, i) =>
          `<div class="rise" style="${at(t0 + flagAt + 0.1 + i * 0.25)}"><nve-alert status="${p.level === 'warning' ? 'warning' : 'danger'}"><span nve-text="label sm">${esc([p.loc, p.rule].filter(Boolean).join(' '))}</span> ${esc(p.message)}</nve-alert></div>`
      )
      .join('');
    return `<div nve-layout="column gap:xl full:height">
      <div nve-layout="row gap:xl align:vertical-center align:space-between">
        <div nve-layout="column gap:md">${words(s.headline, t0 + 0.1, headlineClass(s.headline))}${s.lede ? `<p class="lede rise" style="${at(t0 + 0.45)}">${esc(s.lede)}</p>` : ''}</div>
        <div class="stack">
          <div class="win" style="${at(t0 + flagAt)}; --until: ${sec(t0 + passAt - 0.2)}" nve-layout="column gap:xs align:right"><span class="count bad">${problems.length} problem${problems.length === 1 ? '' : 's'}</span><span class="stat-label">${esc(summary)}</span></div>
          <div class="win" style="${at(t0 + passAt)}" nve-layout="column gap:xs align:right"><span class="count ok">0 problems</span><span class="stat-label">Validation passed</span></div>
        </div>
      </div>
      <div nve-layout="grid gap:xl">
        <div class="rise cell" style="${at(t0 + 0.4)}" nve-layout="span:7">
          <nve-card>
            <nve-card-header><div nve-layout="row gap:sm align:vertical-center align:space-between"><span nve-text="label muted">${esc(s.file ?? 'index.html')}</span><code nve-text="code">${esc(s.command ?? `nve api.validate ${s.file ?? 'index.html'}`)}</code></div></nve-card-header>
            <nve-card-content><div class="editor"><div class="scan" style="${at(t0 + 0.9)}"></div>${(s.lines ?? []).map(renderLine).join('\n')}</div></nve-card-content>
          </nve-card>
        </div>
        <div class="stack cell" nve-layout="span:5">
          <div class="win" style="${at(t0 + flagAt)}; --until: ${sec(t0 + passAt - 0.2)}" nve-layout="column gap:sm">${alerts}</div>
          <div class="win" style="${at(t0 + passAt)}" nve-layout="column gap:md"><nve-alert status="success">${esc(s.pass ?? 'Validation passed.')}</nve-alert>${s.html ? `<div class="rise" style="${at(t0 + passAt + 0.3)}">${relative(s.html, t0)}</div>` : ''}</div>
        </div>
      </div>
    </div>`;
  },

  list(s, t0) {
    const items = (s.items ?? [])
      .map((item, i) => {
        const t = t0 + 0.5 + i * 0.18;
        let stat = '';
        if (item.stat) {
          const id = `count-${++uid}`;
          counters.push({
            target: `#${id}`,
            from: 0,
            to: item.stat.value,
            t,
            duration: 0.8,
            decimals: item.stat.decimals ?? 0
          });
          stat = `<span class="stat">${esc(item.stat.prefix ?? '')}<span id="${id}">0</span>${esc(item.stat.suffix ?? '')}</span>`;
        }
        return `<div class="stamp" style="${at(t)}" nve-layout="column align:stretch"><nve-card><nve-card-content><div nve-layout="column gap:md">${item.icon ? `<nve-icon name="${esc(item.icon)}" size="lg"></nve-icon>` : ''}${stat}<span nve-text="label lg">${esc(item.text)}</span></div></nve-card-content></nve-card></div>`;
      })
      .join('');
    const span = Math.max(3, Math.floor(12 / Math.max(1, (s.items ?? []).length)));
    return `<div nve-layout="column gap:xl align:vertical-center full:height">
      ${words(s.headline, t0 + 0.1, headlineClass(s.headline))}
      <div nve-layout="grid gap:lg span-items:${span} align:vertical-stretch">${items}</div>
    </div>`;
  },

  end(s, t0) {
    const packages = (s.packages ?? [])
      .map((p, i) => `<div class="pop" style="${at(t0 + 1.3 + i * 0.05)}"><nve-tag readonly>${esc(p)}</nve-tag></div>`)
      .join('');
    return `<div nve-layout="column gap:lg align:center full:height">
      <div class="stamp" style="${at(t0 + 0.1)}"><nve-logo size="lg" color="brand-green" aria-label="NVIDIA">NV</nve-logo></div>
      ${words(s.headline ?? 'NVIDIA Elements', t0 + 0.2, 'hero', 'h2', ' nve-text="center"')}
      ${s.line ? `<p class="big dim" nve-text="center"><span class="mask"><span class="word" style="${at(t0 + 0.55)}">${esc(s.line)}</span></span></p>` : ''}
      ${s.command ? `<div class="rise" style="${at(t0 + 0.9)}"><span class="chip">${esc(s.command)}</span></div>` : ''}
      ${s.url ? `<span class="url rise" style="${at(t0 + 1.1)}">${esc(s.url)}</span>` : ''}
      ${packages ? `<div nve-layout="row gap:xs align:wrap align:horizontal-center">${packages}</div>` : ''}
    </div>`;
  }
};

/* ---------- timeline ---------- */
let t = 0;
const scenes = (board.scenes ?? []).map((scene, i) => {
  if (!renderers[scene.type])
    fail(`Scene ${i} has unknown type "${scene.type}". Use one of: ${Object.keys(renderers).join(', ')}.`);
  const duration = scene.duration ?? DEFAULT_DURATIONS[scene.type];
  const entry = { scene, start: t, duration };
  t += duration;
  return entry;
});
const total = Math.round(t * 1000) / 1000;
if (!values['allow-duration'] && (total < MIN_DURATION || total > MAX_DURATION)) {
  fail(
    `Storyboard runs ${total}s. Keep it between ${MIN_DURATION} and ${MAX_DURATION} seconds by adjusting scene durations or cutting a scene.`
  );
}

const sceneHtml = scenes
  .map(({ scene, start, duration }, i) => {
    const last = i === scenes.length - 1;
    const style = `--in: ${sec(start)}${last ? '' : `; --out: ${sec(start + duration)}`}`;
    return `          <!-- ${i + 1}. ${scene.type}: ${start.toFixed(2)}s to ${(start + duration).toFixed(2)}s -->\n          <section class="scene" style="${style}">\n${renderers[scene.type](scene, start)}\n          </section>`;
  })
  .join('\n\n');

const titleScene = scenes.find(s => s.scene.type === 'title');
const poster = board.poster ?? (titleScene ? titleScene.start + 1.6 : 1.5);
if (!Number.isFinite(poster) || poster < 0 || poster >= total) {
  fail(`Poster time must be between 0 and ${total} seconds (exclusive).`);
}
// one module script per import, so a failed import cannot stop the core bundle from loading
const imports = (board.imports ?? []).map(url => `    <script type="module">import '${url}';</script>`).join('\n');
// callbacks insert values literally; a string replacement would expand $&, $', and similar patterns
const literal = value => () => value;
const html = readFileSync(SHELL, 'utf8')
  .replaceAll('{{TITLE}}', literal(esc(board.title ?? 'NVIDIA Elements release video')))
  .replace('{{DURATION}}', literal(String(total)))
  .replaceAll('{{CORE_VERSION}}', literal(board.versions.core))
  .replaceAll('{{CODE_VERSION}}', literal(board.versions.code))
  .replaceAll('{{STYLES_VERSION}}', literal(board.versions.styles))
  .replaceAll('{{THEMES_VERSION}}', literal(board.versions.themes))
  .replace('{{IMPORTS}}', literal(imports))
  .replace(
    '{{EXTRA_CSS}}',
    literal(board.css ? `      /* storyboard-specific motion, tokens only */\n${board.css}` : '')
  )
  .replace('{{SCENES}}', literal(sceneHtml))
  .replace(
    '{{TIMELINE_JSON}}',
    literal(JSON.stringify({ duration: total, cues, counters, poster }).replace(/</g, '\\u003c'))
  );

mkdirSync(dirname(resolve(values.out)), { recursive: true });
writeFileSync(resolve(values.out), html);

process.stdout.write(
  `${JSON.stringify(
    {
      out: values.out,
      duration: total,
      poster,
      scenes: scenes.map(({ scene, start, duration }) => ({
        type: scene.type,
        headline: scene.headline ?? scene.month ?? scene.lines?.[0] ?? scene.line,
        start,
        end: start + duration
      })),
      warnings
    },
    null,
    2
  )}\n`
);

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
