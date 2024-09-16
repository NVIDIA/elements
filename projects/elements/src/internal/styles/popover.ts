import { supportsCSSPositionArea, supportsCSSLegacyInsetArea } from '../utils/supports.js';
import _popoverStyles from './popover.css?inline';

const styles =
  !supportsCSSPositionArea() && supportsCSSLegacyInsetArea()
    ? _popoverStyles.replaceAll('position-area', 'inset-area')
    : _popoverStyles;

// vite/esbuild minifier does not understand this syntax
const anchor = /* css */ `
[internal-host] { anchor-name: --internal-host }
.arrow { position-anchor: --internal-host }
`;

export const popoverStyles = styles + anchor;
