import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { optimize } from 'svgo';

const scriptPath = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(scriptPath, '../src/icon/icons/');
const outputPath = path.join(scriptPath, '../src/icon/');
const svgoOptions = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false
        }
      }
    }
  ]
};

const icons = { };
fs.readdirSync(inputPath).filter(file => file.endsWith('.svg')).sort().forEach(file => {
  const svgText = fs.readFileSync(path.join(inputPath, file), { encoding: 'utf-8' });
  const id = file.substring(0, file.length - 4);
  icons[id] = optimize(svgText, svgoOptions).data;
});

fs.writeFileSync(`${outputPath}/icons.ts`, `
// This is an auto-generated file. DO NOT EDIT
export const ICON_IMPORTS = {\n${Object.keys(icons).map(i => `  '${i}': {\n    svg: () => import('./icons/${i}.svg?raw')\n  },`).join('\n')}\n};

export type IconName = ${Object.keys(icons).map(i => `'${i}'`).join(' | ')};

/** @deprecated */
export type IconNames = IconName;

export const ICON_NAMES = Object.keys(ICON_IMPORTS) as IconName[];
`);
