import { ElementPart, Directive, directive, DirectiveParameters } from 'lit/directive.js';

export const generateFigmaEmbed = (figmaNodeId: string) => {
  return {
    design: {
      type: 'figma',
      url: `https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0?node-id=${figmaNodeId}`
    }
  };
};

export type ComponentStatuses = 'alpha' | 'beta' | 'stable' | 'deprecated';

export const generateDefaultStoryParameters = (
  status: ComponentStatuses,
  reviewDocBookmark: string,
  description: string,
  actions?: string[]
) => {
  return {
    status: {
      type: status,
      url: `https://docs.google.com/document/d/1Q99AFsqDdQwtCTCxoCPOfdXS46KFWBBGVAzOruG28A4/edit#bookmark=${reviewDocBookmark}`
    },
    docs: {
      description: {
        component: description
      }
    },
    actions: {
      handles: actions
    }
  };
};

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
              members: declaration.members?.filter((members) => members.privacy !== 'private')
            })
          }))
        })
      }))
    })
  };
};

export const awaitTimeout = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export const getValuesFromEnum = (enumToTransform): string[] => Object.values(enumToTransform);

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
