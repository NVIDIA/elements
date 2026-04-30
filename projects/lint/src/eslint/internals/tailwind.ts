// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Standalone Tailwind utility tokens that have no `-` suffix. Limited to tokens
 * unambiguous in the Elements context. `container` is deliberately excluded —
 * too common as a custom semantic class.
 */
export const STANDALONE_TAILWIND_CLASSES: ReadonlySet<string> = new Set([
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'block',
  'inline',
  'inline-block',
  'hidden',
  'contents',
  'flow-root',
  'truncate',
  'italic',
  'not-italic',
  'underline',
  'no-underline',
  'uppercase',
  'lowercase',
  'capitalize',
  'sr-only',
  'not-sr-only',
  'pointer-events-none',
  'pointer-events-auto',
  'select-none',
  'select-text',
  'cursor-pointer',
  'cursor-default',
  'cursor-not-allowed',
  'static',
  'fixed',
  'absolute',
  'relative',
  'sticky',
  'visible',
  'invisible',
  'overflow-hidden',
  'overflow-visible',
  'overflow-scroll',
  'overflow-auto',
  'whitespace-nowrap',
  'whitespace-normal',
  'whitespace-pre',
  'break-normal',
  'break-words',
  'break-all',
  'rounded',
  'rounded-full',
  'rounded-none',
  'border',
  'shadow',
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-none',
  'ring',
  'transition',
  'transform',
  'flex-row',
  'flex-col',
  'flex-wrap',
  'flex-nowrap',
  'items-center',
  'items-start',
  'items-end',
  'items-stretch',
  'items-baseline',
  'justify-center',
  'justify-start',
  'justify-end',
  'justify-between',
  'justify-around',
  'justify-evenly',
  'self-auto',
  'self-start',
  'self-end',
  'self-center',
  'self-stretch',
  'text-left',
  'text-center',
  'text-right',
  'text-justify',
  'antialiased',
  'subpixel-antialiased'
]);

const TAILWIND_PREFIXES: ReadonlySet<string> = new Set([
  'underline-offset',
  'place-content',
  'place-items',
  'place-self',
  'translate-x',
  'translate-y',
  'ring-offset',
  'hue-rotate',
  'rounded-tl',
  'rounded-tr',
  'rounded-br',
  'rounded-bl',
  'col-start',
  'col-span',
  'col-end',
  'row-start',
  'row-span',
  'row-end',
  'auto-cols',
  'auto-rows',
  'grid-cols',
  'grid-rows',
  'rounded-t',
  'rounded-r',
  'rounded-b',
  'rounded-l',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-s',
  'border-e',
  'border-x',
  'border-y',
  'inset-x',
  'inset-y',
  'divide-x',
  'divide-y',
  'space-x',
  'space-y',
  'min-w',
  'min-h',
  'max-w',
  'max-h',
  'scale-x',
  'scale-y',
  'skew-x',
  'skew-y',
  'gap-x',
  'gap-y',
  'animate',
  'aspect',
  'basis',
  'cursor',
  'accent',
  'caret',
  'placeholder',
  'decoration',
  'rounded',
  'shadow',
  'border',
  'divide',
  'outline',
  'opacity',
  'leading',
  'tracking',
  'transition',
  'duration',
  'delay',
  'sepia',
  'saturate',
  'contrast',
  'brightness',
  'rotate',
  'scale',
  'content',
  'order',
  'right',
  'left',
  'inset',
  'fill',
  'stroke',
  'gap',
  'top',
  'ring',
  'flex',
  'grow',
  'shrink',
  'font',
  'text',
  'size',
  'ease',
  'blur',
  'from',
  'via',
  'col',
  'row',
  'bg',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'ps',
  'pe',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'ms',
  'me',
  'to',
  'p',
  'm',
  'w',
  'h',
  'z'
]);

/**
 * Matches a Tailwind utility value (the segment after `<prefix>-`). Covers
 * numbers and fractions (`4`, `0.5`, `1/2`), size keywords (`xs`...`9xl`,
 * `full`, `screen`, `auto`), color shades (`red-500`, `blue-700/50`), font and
 * tracking keywords, alignment keywords, and arbitrary values (`[#ff0000]`).
 * Custom kebab-case words (`card`, `custom-class`) deliberately fall through.
 */
const TAILWIND_VALUE_PATTERN = new RegExp(
  '^(?:' +
    [
      String.raw`\d+(?:\.\d+)?(?:\/\d+)?`,
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      String.raw`[2-9]xl`,
      'full',
      'screen',
      'min',
      'max',
      'fit',
      'auto',
      'none',
      'px',
      'inherit',
      'current',
      'transparent',
      'black',
      'white',
      'sans',
      'serif',
      'mono',
      'thin',
      'light',
      'normal',
      'medium',
      'semibold',
      'bold',
      'extrabold',
      'tight',
      'tighter',
      'wide',
      'wider',
      'widest',
      'snug',
      'loose',
      'relaxed',
      'square',
      'video',
      'solid',
      'dashed',
      'dotted',
      'wavy',
      'double',
      'baseline',
      'top',
      'middle',
      'bottom',
      'start',
      'end',
      'center',
      'stretch',
      String.raw`(?:red|blue|green|yellow|orange|purple|pink|gray|grey|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-\d+(?:\/\d+)?`,
      String.raw`\[[^\]]+\]`
    ].join('|') +
    ')$'
);

/**
 * Mapping from common Tailwind tokens to their Elements counterpart. Enriches
 * diagnostic messages when the bare token matches a key. The table stays small
 * and curated; tokens outside the map fall back to a generic message.
 */
export const HINTS: Record<string, string> = {
  flex: 'nve-layout="row"',
  'inline-flex': 'nve-layout="row"',
  grid: 'nve-layout="grid"',
  hidden: 'nve-display="hide"',
  block: 'nve-display="block"',
  'flex-row': 'nve-layout="row"',
  'flex-col': 'nve-layout="column"',
  'items-center': 'nve-layout="align:center"',
  'items-start': 'nve-layout="align:top"',
  'items-end': 'nve-layout="align:bottom"',
  'justify-center': 'nve-layout="align:center"',
  'justify-between': 'nve-layout="align:space-between"',
  'text-xs': 'nve-text="xs"',
  'text-sm': 'nve-text="sm"',
  'text-base': 'nve-text="body"',
  'text-lg': 'nve-text="lg"',
  'text-xl': 'nve-text="xl"',
  'text-2xl': 'nve-text="heading"'
};

/**
 * Tailwind utilities that are safe on `nve-*` host elements because they affect
 * element placement or visibility instead of trying to style shadow DOM content.
 */
const NVE_HOST_STANDALONE_TAILWIND_CLASSES: ReadonlySet<string> = new Set([
  'hidden',
  'visible',
  'invisible',
  'sr-only',
  'not-sr-only',
  'static',
  'fixed',
  'absolute',
  'relative',
  'sticky',
  'grow',
  'shrink'
]);

const NVE_HOST_TAILWIND_PREFIXES: ReadonlySet<string> = new Set([
  'inset-x',
  'inset-y',
  'basis',
  'order',
  'right',
  'bottom',
  'left',
  'inset',
  'self',
  'grow',
  'shrink',
  'top',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'ms',
  'me',
  'm',
  'z'
]);

/**
 * Strip Tailwind variant prefixes (`hover:`, `md:`, `dark:`, `[&:hover]:`),
 * the `!` important modifier, and a leading `-` for negative utilities. Returns
 * the bare utility name suitable for matching against the detector.
 */
export function stripVariantsAndModifiers(token: string): string {
  let depth = 0;
  let lastColon = -1;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === '[') depth++;
    else if (c === ']') depth--;
    else if (c === ':' && depth === 0) lastColon = i;
  }
  let bare = lastColon >= 0 ? token.slice(lastColon + 1) : token;
  if (bare.startsWith('!')) bare = bare.slice(1);
  if (bare.startsWith('-')) bare = bare.slice(1);
  return bare;
}

export function isAllowedNveHostTailwindToken(bare: string): boolean {
  if (!bare) return false;
  if (NVE_HOST_STANDALONE_TAILWIND_CLASSES.has(bare)) return true;

  const bracketIdx = bare.indexOf('[');
  if (bracketIdx > 0 && bare.endsWith(']')) {
    const prefixPart = bare.slice(0, bracketIdx).replace(/-$/, '');
    return NVE_HOST_TAILWIND_PREFIXES.has(prefixPart);
  }

  let dashIdx = bare.indexOf('-');
  while (dashIdx > 0) {
    const prefix = bare.slice(0, dashIdx);
    if (NVE_HOST_TAILWIND_PREFIXES.has(prefix)) {
      return true;
    }
    dashIdx = bare.indexOf('-', dashIdx + 1);
  }

  return false;
}

const CSS_PROPERTY_NAME_PATTERN = /^(?:-?[a-z][\w-]*|--[\w-]+)$/i;

function isBracketedArbitraryProperty(bare: string): boolean {
  if (!bare.startsWith('[') || !bare.endsWith(']')) return false;

  const arbitraryProperty = bare.slice(1, -1);
  const colonIdx = arbitraryProperty.indexOf(':');
  if (colonIdx <= 0 || colonIdx >= arbitraryProperty.length - 1) return false;

  const propertyName = arbitraryProperty.slice(0, colonIdx);
  return CSS_PROPERTY_NAME_PATTERN.test(propertyName);
}

/**
 * Returns true when the bare token is a standalone Tailwind keyword, a
 * bracketed arbitrary property, or splits into a known Tailwind prefix and a
 * Tailwind-shaped value.
 */
export function isTailwindToken(bare: string): boolean {
  if (!bare) return false;
  if (STANDALONE_TAILWIND_CLASSES.has(bare)) return true;
  if (isBracketedArbitraryProperty(bare)) return true;

  const bracketIdx = bare.indexOf('[');
  if (bracketIdx > 0 && bare.endsWith(']')) {
    const prefixPart = bare.slice(0, bracketIdx).replace(/-$/, '');
    if (TAILWIND_PREFIXES.has(prefixPart)) return true;
  }

  let dashIdx = bare.indexOf('-');
  while (dashIdx > 0) {
    const prefix = bare.slice(0, dashIdx);
    const value = bare.slice(dashIdx + 1);
    if (TAILWIND_PREFIXES.has(prefix) && TAILWIND_VALUE_PATTERN.test(value)) {
      return true;
    }
    dashIdx = bare.indexOf('-', dashIdx + 1);
  }

  return false;
}
