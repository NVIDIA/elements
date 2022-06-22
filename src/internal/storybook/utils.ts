const FIGMA_FILE = 'https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0';

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
