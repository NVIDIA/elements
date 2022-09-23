import { Card, CardHeader, CardContent, CardFooter } from '@elements/elements/card';

customElements.get('nve-card') || customElements.define('nve-card', Card);
customElements.get('nve-card-header') || customElements.define('nve-card-header', CardHeader);
customElements.get('nve-card-content') || customElements.define('nve-card-content', CardContent);
customElements.get('nve-card-footer') || customElements.define('nve-card-footer', CardFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-card': Card;
    'nve-card-header': CardHeader;
    'nve-card-content': CardContent;
    'nve-card-footer': CardFooter;
  }
}
