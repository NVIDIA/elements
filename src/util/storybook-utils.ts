const FIGMA_FILE = 'https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0';

export const generateFigmaEmbed = (figmaNodeId: string) => {
  return {
    design: {
      type: 'figma',
      url: `https://www.figma.com/file/u92dX33lnPVzC9o4SfgK3R/MagLev-Product-System-2.0?node-id=${figmaNodeId}`
    }
  };
};
