import styles from '@elements/elements/index.css?inline';
import font from '@elements/elements/inter.css?inline';
import '@elements/elements/polyfills';
import '@webcomponents/scoped-custom-element-registry';

export const parameters = {

};

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles + font);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
document.querySelector('html').setAttribute('nve-theme', 'light');