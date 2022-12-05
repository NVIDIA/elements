
export type Interaction = 'emphasize' | 'destructive';

export type GhostInteraction = 'ghost' | `${'ghost'}-${Interaction}`;

export type Inverse = 'inverse';

export type InlinePosition = 'start' | 'center' | 'end';

export type BlockPosition = 'start' | 'center' | 'end';

export type Position = 'center' | `block-${BlockPosition}` | `inline-${InlinePosition}`;

export type Status = 'accent' | 'warning' | 'success' | 'danger';

export const statusIcons = {
  default: 'information',
  accent: 'information',
  warning: 'warning',
  success: 'passed-or-success',
  danger: 'warning'
};
