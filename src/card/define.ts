import { Card, CardHeader, CardContent, CardFooter } from '@elements/elements/card';

customElements.get('mlv-card') || customElements.define('mlv-card', Card);
customElements.get('mlv-card-header') || customElements.define('mlv-card-header', CardHeader);
customElements.get('mlv-card-content') || customElements.define('mlv-card-content', CardContent);
customElements.get('mlv-card-footer') || customElements.define('mlv-card-footer', CardFooter);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-card': Card;
    'mlv-card-header': CardHeader;
    'mlv-card-content': CardContent;
    'mlv-card-footer': CardFooter;
  }
}
