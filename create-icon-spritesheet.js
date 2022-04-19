import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import prettier from 'prettier';
import { optimize } from 'svgo';
import plugin from '@prettier/plugin-xml';

const scriptPath = path.dirname(fileURLToPath(import.meta.url));
const iconsPath = path.join(scriptPath, '/icons');
const resultSvgPath = path.join(scriptPath, '/public/assets/icons.svg');
const resultTypesPath = path.join(scriptPath, '/src/components/icon/icon-names.js');

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

const resultIds = [];
const resultDocument = new DOMParser().parseFromString(
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>`
);
const resultSvgEl = resultDocument.firstChild;

function getChildElements(node) {
  return node.nodeType === 1 ? Array.from(node.childNodes).filter((childNode) => childNode.nodeType === 1) : [];
}

function cleanSvgEl(svgEl, removeOutline) {
  if (svgEl.hasAttribute('fill')) {
    svgEl.setAttribute('fill', 'currentColor');
  }
  if (removeOutline) {
    svgEl.setAttribute('fill', 'none'); // Outline type icons require additional cleaning
  }
  if (svgEl.hasAttribute('stroke')) {
    svgEl.setAttribute('stroke', 'currentColor');
  }
  for (const childNode of getChildElements(svgEl.childNodes)) {
    cleanSvgEl(childNode);
  }
}

const files = fs.readdirSync(iconsPath);
files.sort();
for (const file of files) {
  if (file.endsWith('.svg')) {
    const svgPath = path.join(iconsPath, file);
    const svgText = fs.readFileSync(svgPath, { encoding: 'utf-8' });
    const optimizedSvgText = optimize(svgText, svgoOptions).data;
    const svgDocument = new DOMParser().parseFromString(optimizedSvgText);

    const id = file.substring(0, file.length - 4);
    const svgEl = svgDocument.firstChild;
    const viewBox = svgEl.getAttribute('viewBox');

    resultIds.push(id);

    const resultSymbolEl = resultDocument.createElement('symbol');
    resultSymbolEl.setAttribute('id', id);
    resultSymbolEl.setAttribute('viewBox', viewBox);
    for (const childNode of getChildElements(svgEl)) {
      const resultChildEl = childNode.cloneNode(true);
      cleanSvgEl(resultChildEl, id.includes('outline'));
      resultSymbolEl.appendChild(resultChildEl);
    }
    resultSvgEl.appendChild(resultSymbolEl);
  }
}

const resultSvgText = new XMLSerializer().serializeToString(resultDocument);
const resultPrettierSvgText = prettier.format(resultSvgText, {
  parser: 'xml',
  plugins: plugin,
  xmlWhitespaceSensitivity: 'ignore'
});
fs.writeFileSync(resultSvgPath, resultPrettierSvgText);

const resultTypes = `
// This is an auto-generated file. DO NOT EDIT
export const ICON_NAMES = ${JSON.stringify(resultIds, null, 2)};
`;
fs.writeFileSync(resultTypesPath, resultTypes);
