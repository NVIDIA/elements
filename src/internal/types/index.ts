
export type Interaction = 'emphasize' | 'destructive' | 'ghost';

export type InlinePosition = 'start' | 'center' | 'end';

export type BlockPosition = 'start' | 'center' | 'end';

export type Position = 'center' | `block-${BlockPosition}` | `inline-${InlinePosition}`;
