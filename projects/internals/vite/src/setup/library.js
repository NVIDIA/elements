import fontInter from '@nvidia-elements/themes/fonts/inter.css?inline';
import theme from '@nvidia-elements/themes/index.css?inline';

// setup base theme/tokens
const sheet = new CSSStyleSheet();
sheet.replaceSync(`${fontInter}${theme}`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
document.documentElement.setAttribute('nve-theme', '');
