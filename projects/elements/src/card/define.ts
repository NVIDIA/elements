import { define } from '@nvidia-elements/core/internal';
import { Card, CardHeader, CardContent, CardFooter } from '@nvidia-elements/core/card';

define(Card);
define(CardHeader);
define(CardContent);
define(CardFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-card': Card;
    'nve-card-header': CardHeader;
    'nve-card-content': CardContent;
    'nve-card-footer': CardFooter;
  }
}
