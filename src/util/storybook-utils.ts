const FIGMA_FILE = 'https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0';

export const generateFigmaEmbed = (figmaNodeId: string) => {
  return {
    design: {
      type: 'figma',
      url: `https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0?node-id=${figmaNodeId}`
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

export const getValuesFromEnum = (enumToTransform) => Object.values(enumToTransform).filter((key: string) => !isNaN(Number(enumToTransform[key])));