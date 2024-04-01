import styles from '@nvidia-elements/core/index.css?inline';

const sheet = new CSSStyleSheet();
sheet.replaceSync(`${styles}`);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
document.documentElement.setAttribute('mlv-theme', '');
