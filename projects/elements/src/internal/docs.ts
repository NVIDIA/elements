import type { ElementPart, DirectiveParameters } from 'lit/directive.js';
import { Directive, directive } from 'lit/directive.js';

/**
 * @experimental
 * Only use for storybook demos. Not for production components.
 * Waiting for stable release of https://github.com/lit/lit/pull/1960
 */
export class Spread extends Directive {
  render() {
    return '';
  }

  update(part: ElementPart, params: DirectiveParameters<this>) {
    Object.entries((params as any)[0])
      .filter(([k, v]: [string, any]) => v !== part.element[k] && k !== 'textContent' && k !== 'innerHTML')
      .forEach(([k, v]) => (part.element[k] = v));
  }
}

export const spread: any = directive(Spread);
