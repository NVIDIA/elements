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
validateIconSVGs(icons);
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

function validateIconSVGs(icons) {
  const ariaHiddenIcons = [];
  const invalidColorIcons = [];
  const invalidLucideClassIcons = [];
  const missingLucideClassIcons = [];
  const lucideFilledIcons = [];

  for (const [name, svg] of Object.entries(icons)) {
    const file = `${name}.svg`;
    const svgTag = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
    const svgClasses = [...svgTag.matchAll(/\sclass\s*=\s*(["'])([^"']*)\1/g)].flatMap(([, , value]) =>
      value.trim().split(/\s+/)
    );
    const classes = [...svg.matchAll(/\sclass\s*=\s*(["'])([^"']*)\1/g)].flatMap(([, , value]) =>
      value.trim().split(/\s+/)
    );
    const lucideIconClasses = classes.filter(
      className => /^lucide-.+/.test(className) && className !== 'lucide-filled'
    );
    const svgWithoutMasks = svg.replaceAll(/<mask\b[\s\S]*?<\/mask>/g, '');
    const colors = [...svgWithoutMasks.matchAll(/\s(?:fill|stroke)\s*=\s*(["'])([^"']*)\1/g)].map(([, , value]) =>
      value.trim()
    );

    if (/\baria-hidden\s*=/.test(svg)) ariaHiddenIcons.push(file);
    if (
      !colors.some(color => color.includes('currentColor')) ||
      colors.some(color => color !== 'none' && !color.includes('currentColor'))
    )
      invalidColorIcons.push(file);
    if (lucideIconClasses.length === 0) missingLucideClassIcons.push(file);
    else if (
      svgClasses.length !== 1 ||
      lucideIconClasses.length !== 1 ||
      svgClasses[0] !== lucideIconClasses[0] ||
      lucideIconClasses[0].endsWith('-icon')
    )
      invalidLucideClassIcons.push(file);
    if (classes.includes('lucide-filled')) lucideFilledIcons.push(file);
  }

  const errors = [
    ariaHiddenIcons.length > 0
      ? `Icon SVG source must not contain aria-hidden. Remove it from:\n${ariaHiddenIcons.map(file => `- ${file}`).join('\n')}`
      : '',
    invalidColorIcons.length > 0
      ? `Icon SVG source colors must use currentColor. Update:\n${invalidColorIcons.map(file => `- ${file}`).join('\n')}`
      : '',
    missingLucideClassIcons.length > 0
      ? `Icon SVG source must contain a lucide-* class. Add one to:\n${missingLucideClassIcons.map(file => `- ${file}`).join('\n')}`
      : '',
    invalidLucideClassIcons.length > 0
      ? `Icon SVG source must contain only one lucide-* class on the svg element. Update:\n${invalidLucideClassIcons.map(file => `- ${file}`).join('\n')}`
      : '',
    lucideFilledIcons.length > 0
      ? `Icon SVG source must not contain lucide-filled but the svg lucide-* class name. Remove it from:\n${lucideFilledIcons.map(file => `- ${file}`).join('\n')}`
      : ''
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors.join('\n\n'));
  }
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
      `// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// This is an auto-generated file. DO NOT EDIT
export interface IconSVG {
  svg: () => Promise<string> | string;
}

function iconImport(importer: () => Promise<{default: string}>): IconSVG {
  return {
    async svg() {
      return (await importer()).default;
    }
  }
}

export const ICON_IMPORTS = {\n${sortIconKeys(Object.keys(icons))
        .map(i => `  '${i}': iconImport(() => import('./icons/${i}.svg?raw')),`)
        .join('\n')}\n};

export type IconName =
${sortIconKeys(Object.keys(icons))
  .filter(i => !i.endsWith('-outline') && !i.endsWith('-filled') && !i.endsWith('-solid'))
  .map(i => `  | '${i}'`)
  .join('\n')};

export type IconNameSolid =
${sortIconKeys(Object.keys(icons))
  .filter(i => i.endsWith('-solid'))
  .map(i => `  | '${i.slice(0, -'-solid'.length)}'`)
  .join('\n')};

export const ICON_NAMES_SOLID = Object.keys(ICON_IMPORTS)
  .filter((name): name is IconNameSolid => name.endsWith('-solid'))
  .map(name => name.slice(0, -'-solid'.length)) as readonly IconNameSolid[];

export const ICON_NAMES = Object.keys(ICON_IMPORTS).filter((name): name is IconName => !name.endsWith('-solid'));
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
      `// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
  const masks = [];
  const unmaskedSVG = svg.replaceAll(/<mask\b[\s\S]*?<\/mask>/g, mask => {
    masks.push(mask);
    return `__NVE_ICON_MASK_${masks.length - 1}__`;
  });
  return unmaskedSVG.replaceAll(/__NVE_ICON_MASK_(\d+)__/g, (_, index) => masks[Number(index)]);
}

function optimizeSVG(svg) {
  return optimize(svg, {
    multipass: true,
    plugins: ['preset-default', 'removeDimensions', 'removeScripts', 'removeStyleElement', 'removeElementsByAttr']
  }).data;
}

/**
 * repairs viewBoxes with whitespace introduced by SVG authoring tools
 * https://typeofnan.dev/how-to-perfectly-fit-an-svg-to-its-contents-using-javascript/
 */
async function repairViewBoxScales(svgs) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const result = await page.evaluate(async icons => {
    const graphicsSelector = 'circle, ellipse, image, line, path, polygon, polyline, rect, text, use';
    const maxRasterSize = 4096;
    const rasterScale = 64;

    function getGeometryBounds(svg) {
      const { x, y, width, height } = svg.getBBox();
      return { x, y, width, height };
    }

    function getSourceViewBox(svg, geometryBounds) {
      const { x, y, width, height } = svg.viewBox.baseVal;
      if (width > 0 && height > 0) return { x, y, width, height };

      const sourceWidth = Number.parseFloat(svg.getAttribute('width'));
      const sourceHeight = Number.parseFloat(svg.getAttribute('height'));
      return sourceWidth > 0 && sourceHeight > 0
        ? { x: 0, y: 0, width: sourceWidth, height: sourceHeight }
        : geometryBounds;
    }

    function hasVisibleStroke(svg) {
      return [...svg.querySelectorAll(graphicsSelector)].some(element => {
        const style = getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.stroke !== 'none' &&
          Number.parseFloat(style.strokeWidth) > 0 &&
          Number.parseFloat(style.strokeOpacity) > 0
        );
      });
    }

    async function getPaintedBounds(svg, sourceViewBox) {
      const scale = Math.min(rasterScale, maxRasterSize / Math.max(sourceViewBox.width, sourceViewBox.height));
      const width = Math.max(1, Math.ceil(sourceViewBox.width * scale));
      const height = Math.max(1, Math.ceil(sourceViewBox.height * scale));
      const scaleX = width / sourceViewBox.width;
      const scaleY = height / sourceViewBox.height;
      const clone = svg.cloneNode(true);

      clone.setAttribute('width', width);
      clone.setAttribute('height', height);
      clone.setAttribute('preserveAspectRatio', 'none');
      clone.style.setProperty('color', '#000');

      const url = URL.createObjectURL(new Blob([clone.outerHTML], { type: 'image/svg+xml' }));
      const image = new Image();
      image.src = url;

      try {
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, width, height);
        const pixels = context.getImageData(0, 0, width, height).data;
        let maxAlpha = 0;
        for (let pixel = 0; pixel < width * height; pixel++) {
          maxAlpha = Math.max(maxAlpha, pixels[pixel * 4 + 3]);
        }
        if (maxAlpha === 0) return null;

        // Ignore low-alpha antialiasing fringes while retaining relative opacity for faint icons.
        const alphaThreshold = maxAlpha * 0.25;
        let xMin = width;
        let xMax = -1;
        let yMin = height;
        let yMax = -1;

        for (let pixel = 0; pixel < width * height; pixel++) {
          if (pixels[pixel * 4 + 3] < alphaThreshold) continue;
          const x = pixel % width;
          const y = Math.floor(pixel / width);
          xMin = Math.min(xMin, x);
          xMax = Math.max(xMax, x);
          yMin = Math.min(yMin, y);
          yMax = Math.max(yMax, y);
        }

        return xMax < xMin || yMax < yMin
          ? null
          : {
              x: sourceViewBox.x + xMin / scaleX,
              y: sourceViewBox.y + yMin / scaleY,
              width: (xMax - xMin + 1) / scaleX,
              height: (yMax - yMin + 1) / scaleY
            };
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    function formatViewBox(bounds) {
      const precision = 100;
      const x = Math.floor(bounds.x * precision) / precision;
      const y = Math.floor(bounds.y * precision) / precision;
      const xMax = Math.ceil((bounds.x + bounds.width) * precision) / precision;
      const yMax = Math.ceil((bounds.y + bounds.height) * precision) / precision;
      return [x, y, xMax - x, yMax - y].map(value => +value.toFixed(2)).join(' ');
    }

    function fitBoundsToAspectRatio(bounds, source) {
      const sourceAspectRatio = source.width / source.height;
      const boundsAspectRatio = bounds.width / bounds.height;
      let { x, y, width, height } = bounds;

      if (boundsAspectRatio > sourceAspectRatio) {
        const fittedHeight = width / sourceAspectRatio;
        y -= (fittedHeight - height) / 2;
        height = fittedHeight;
      } else {
        const fittedWidth = height * sourceAspectRatio;
        x -= (fittedWidth - width) / 2;
        width = fittedWidth;
      }

      // Keep the fitted bounds inside the source canvas while retaining all painted pixels.
      x = Math.min(Math.max(x, source.x), source.x + source.width - width);
      y = Math.min(Math.max(y, source.y), source.y + source.height - height);
      return { x, y, width, height };
    }

    function viewBoxesDiffer(source, target) {
      const tolerance = 0.025;
      return [
        source.x - target.x,
        source.y - target.y,
        source.x + source.width - (target.x + target.width),
        source.y + source.height - (target.y + target.height)
      ].some(difference => Math.abs(difference) > tolerance);
    }

    const result = {};
    for (const [name, icon] of Object.entries(icons)) {
      const div = document.createElement('div');
      document.body.append(div);
      try {
        div.innerHTML = icon;
        const svg = div.querySelector('svg');
        const geometryBounds = getGeometryBounds(svg);
        const sourceViewBox = getSourceViewBox(svg, geometryBounds);
        const requiresPaintedBounds = hasVisibleStroke(svg) || svg.querySelector('mask') !== null;
        const paintedBounds = requiresPaintedBounds ? await getPaintedBounds(svg, sourceViewBox) : null;
        const targetViewBox = fitBoundsToAspectRatio(paintedBounds ?? geometryBounds, sourceViewBox);
        // Keep intrinsic SVG bounds tight without changing the source canvas ratio. Intentional optical spacing
        // belongs in the icon's presentation styles.
        if (!svg.hasAttribute('viewBox') || viewBoxesDiffer(sourceViewBox, targetViewBox)) {
          svg.setAttribute('viewBox', formatViewBox(targetViewBox));
        }
        result[name] = div.innerHTML;
      } catch (error) {
        throw new Error(`Failed to repair viewBox for icon "${name}"`, { cause: error });
      } finally {
        div.remove();
      }
    }
    return result;
  }, svgs);
  await browser.close();
  return result;
}
