import styles from '@nvidia-elements/core/index.css?inline';

/** @deprecated */
const sheet = new CSSStyleSheet();
sheet.replaceSync(`${styles}`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
document.documentElement.setAttribute('nve-theme', '');
