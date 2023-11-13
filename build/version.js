import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as url from 'url';

/**
 * Temporary until https://github.com/semantic-release/semantic-release is setup.
 * This script will sync all published packaged to the same version number defined in the design-system/package.json
 */

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const elementsPath = resolve(__dirname, '../elements/package.json');
const elementsReactPath = resolve(__dirname, '../elements-react/package.json');
const workspacePath = resolve(__dirname, '../package.json');

const workspace = JSON.parse(readFileSync(workspacePath));
const elements = JSON.parse(readFileSync(elementsPath));
const elementsReact = JSON.parse(readFileSync(elementsReactPath));

writeFileSync(elementsPath, JSON.stringify({ ...elements, version: workspace.version }, null, 2));
writeFileSync(elementsReactPath, JSON.stringify({
  ...elementsReact,
  version: workspace.version,
  peerDependencies: {
    ...elementsReact.peerDependencies,
    '@elements/elements': workspace.version
  }
}, null, 2));
