import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { optimize } from 'svgo';
import { chromium } from 'playwright';

const scriptPath = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(scriptPath, '../src/icon/icons/');
const outputPath = path.join(scriptPath, '../src/icon/');

const frequentIcons = [
  'placeholder',
  'caret',
  'person',
  'menu',
  'cancel',
  'gear',
  'chevron',
  'logout',
  'copy',
  'more-actions',
  'add',
  'arrow',
  'delete',
  'download',
  'search',
  'split-vertical',
  'sparkles',
  'branch',
  'refresh',
  'double-chevron'
];

let icons = readIconFiles();
icons = await repairViewBoxScales(icons);
icons = Object.entries(icons)
  .map(([name, svg]) => [name, repairSVGColors(svg)])
  .map(([name, svg]) => [name, optimizeSVG(svg)])
  .reduce((prev, [name, svg]) => ({ ...prev, [name]: svg }), {});

await writeIconFiles(icons);
await writeIconRegistry(icons);
await writeSSRIconRegistry(icons);

function readIconFiles() {
  return fs
    .readdirSync(inputPath)
    .filter(file => file.endsWith('.svg'))
    .sort()
    .map(file => [
      file.substring(0, file.length - 4),
      fs.readFileSync(path.join(inputPath, file), { encoding: 'utf-8' })
    ])
    .reduce((prev, [name, svg]) => ({ ...prev, [name]: svg }), {});
}

function writeIconFiles(icons) {
  return Promise.all(
    Object.entries(icons).map(([name, svg]) => {
      return new Promise(r => fs.writeFile(path.join(inputPath, `${name}.svg`), svg, { encoding: 'utf-8' }, r));
    })
  );
}

function writeIconRegistry(icons) {
  return new Promise(r => {
    fs.writeFile(
      `${outputPath}/icons.ts`,
      `
// This is an auto-generated file. DO NOT EDIT
export interface IconSVG {
  svg: () => Promise<string> | string;
}

function iconImport(iconImport: () => Promise<{default: string}>): IconSVG {
  return {
    async svg() {
      return (await iconImport()).default;
    }
  }
}

export const ICON_IMPORTS = {\n${sortIconKeys(Object.keys(icons))
        .map(i => `  '${i}': iconImport(() => import('./icons/${i}.svg?raw')),`)
        .join('\n')}\n};

export type IconName = keyof typeof ICON_IMPORTS;

/** @deprecated */
export type IconNames = IconName;

export const ICON_NAMES = Object.keys(ICON_IMPORTS) as IconName[];
`,
      { encoding: 'utf-8' },
      r
    );
  });
}

function writeSSRIconRegistry(icons) {
  return new Promise(r => {
    fs.writeFile(
      `${outputPath}/server.ts`,
      `
// This is an auto-generated file. DO NOT EDIT
// eslint-disable
// 
// We could use a top level await in icon.js like the following
// const { ICON_IMPORTS } = await (isServer ? import('./icons.server.js') : import('./icons.js'));
// due to downstream consumer tools that use esbuild/iffe modules, top level await is not supported
globalThis._NVE_SSR_ICON_REGISTRY = {\n${sortIconKeys(Object.keys(icons))
        .map(i => `  '${i}': '${icons[i]}',`)
        .join('\n')}\n};
`,
      { encoding: 'utf-8' },
      r
    );
  });
}

function sortIconKeys(keys) {
  const prioritySet = new Set(frequentIcons);
  const priority = keys
    .filter(k => prioritySet.has(k))
    .sort((a, b) => frequentIcons.indexOf(a) - frequentIcons.indexOf(b));
  const rest = keys.filter(k => !prioritySet.has(k)).sort();
  return [...priority, ...rest];
}

function repairSVGColors(svg) {
  return svg
    .replaceAll('fill="black"', 'fill="currentColor"')
    .replaceAll('stroke="black"', 'fill="currentColor"')
    .replaceAll(/fill="#([^"]+)"/g, 'fill="currentColor"')
    .replaceAll(/stroke="#([^"]+)"/g, 'fill="currentColor"');
}

function optimizeSVG(svg) {
  return optimize(svg, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false
          }
        }
      },
      'removeDimensions',
      'removeScriptElement',
      'removeStyleElement',
      'removeElementsByAttr'
    ]
  }).data;
}

async function repairViewBoxScales(svgs) {
  /** repairs broken viewBox scales exported by Figma */
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const result = await page.evaluate(icons => {
    function scaleSVG(svg) {
      // https://typeofnan.dev/how-to-perfectly-fit-an-svg-to-its-contents-using-javascript/
      return [...svg.children]
        .filter(el => el.getBBox)
        .reduce((acc, el) => {
          const { x, y, width, height } = el.getBBox();
          if (!acc.xMin || x < acc.xMin) acc.xMin = x;
          if (!acc.xMax || x + width > acc.xMax) acc.xMax = x + width;
          if (!acc.yMin || y < acc.yMin) acc.yMin = y;
          if (!acc.yMax || y + height > acc.yMax) acc.yMax = y + height;
          return acc;
        }, {});
    }

    return Object.entries(icons).reduce((prev, [name, icon]) => {
      const div = document.createElement('div');
      document.body.append(div);
      div.innerHTML = icon;
      const svg = div.querySelector('svg');

      const { xMin, xMax, yMin, yMax } = scaleSVG(svg);
      const width = (xMax - xMin).toFixed(2);
      const height = (yMax - yMin).toFixed(2);
      const x = xMin.toFixed(2);
      const y = yMin.toFixed(2);
      const viewBox =
        x + width <= 16 && y + height <= 16 ? `${x} ${y} ${+width} ${+height}` : svg.getAttribute('viewBox');

      svg.setAttribute('viewBox', viewBox);
      const result = div.innerHTML;
      div.remove();
      return { ...prev, [name]: result };
    }, {});
  }, svgs);
  await browser.close();
  return result;
}
