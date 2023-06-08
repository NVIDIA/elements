import { ElementPart, Directive, directive, DirectiveParameters } from 'lit/directive.js';

export const excludePrivateFields = (manifest: any) => {
  return {
    ...manifest,
    ...(manifest.modules && {
      modules: manifest.modules?.map((module) => ({
        ...module,
        ...(module.declarations && {
          declarations: module.declarations?.map((declaration) => ({
            ...declaration,
            ...(declaration.members && {
              members: declaration.members?.filter((members) => members.privacy !== 'private' && !members.static && members.name !== 'i18n' && members.name !== '_internals')
            })
          }))
        })
      }))
    })
  };
};

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
      .forEach(([k, v]) => part.element[k] = v);
  }
}

export const spread: any = directive(Spread);
