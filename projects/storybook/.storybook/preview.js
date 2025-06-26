import '@nvidia-elements/core/polyfills';
import { themes } from 'storybook/theming';
import fontInter from '@nvidia-elements/themes/fonts/inter.css?inline';
import theme from '@nvidia-elements/themes/index.css?inline';
import dark from '@nvidia-elements/themes/dark.css?inline';
import layoutStyles from '@nvidia-elements/styles/layout.css?inline';
import typographyStyles from '@nvidia-elements/styles/typography.css?inline';
import responsiveStyles from '@nvidia-elements/styles/responsive.css?inline';
import highContrastTheme from '@nvidia-elements/themes/high-contrast.css?inline';
import reducedMotionTheme from '@nvidia-elements/themes/reduced-motion.css?inline';
import compactTheme from '@nvidia-elements/themes/compact.css?inline';
import debugTheme from '@nvidia-elements/themes/debug.css?inline';
import ddbTheme from '@nvidia-elements/themes/ddb-dark.css?inline';
import brandTheme from '@nvidia-elements/brand/index.css?inline';
import brandDarkTheme from '@nvidia-elements/brand/dark.css?inline';
import fontNvidiaSans from '@nvidia-elements/themes/fonts/nvidia-sans.css?inline';
import viewTransitionStyles from '@nvidia-elements/styles/view-transitions.css?inline';

export const parameters = {
  viewMode: 'story',
  docs: {
    theme: themes.dark
  },
  options: {
    storySort: {
      method: 'alphabetical',
      order: [
        'Storybook',
        'Elements',
        'Styles',
        'Themes',
        'Patterns',
        'Monaco',
        'Labs',
        'Internal',
        'Deprecated'
      ]
    }
  }
};

const storedGlobals = JSON.parse(localStorage.getItem('elements-sb-globals')) || {};

export const globalTypes = {
  theme: {
    name: 'Themes',
    description: 'Themes',
    defaultValue: storedGlobals?.theme ?? 'dark',
    toolbar: {
      title: 'Themes',
      showName: true,
      items: [
        { value: '', title: 'Light' },
        { value: 'high-contrast', title: 'High Contrast' },
        { value: 'brand', title: 'Brand (experimental)' },
        { value: 'dark', title: 'Dark' },
        { value: 'brand-dark', title: 'Brand Dark (experimental)' },
        { value: 'ddb-dark', title: 'DBB Dark (experimental)' },
      ]
    },
  },
  font: {
    name: 'Font',
    description: 'Fonts',
    defaultValue: storedGlobals?.font ?? '',
    toolbar: {
      title: 'Font',
      showName: true,
      items: [
        { value: '', title: 'Theme Default' },
        { value: 'inter', title: 'Inter' },
        { value: 'nvidia-sans', title: 'NVIDIA Sans' }
      ]
    },
  },
  scale: {
    name: 'Scale',
    description: 'Scale',
    defaultValue: storedGlobals?.scale ?? '',
    toolbar: {
      title: 'Scale',
      showName: true,
      items: [
        { value: '', title: 'Default' },
        { value: 'compact', title: 'Compact' }
      ],
    },
  },
  debug: {
    name: 'Debug',
    description: 'Debug',
    defaultValue: storedGlobals?.debug ?? '',
    toolbar: {
      title: 'Debug',
      showName: true,
      items: [
        { value: '', title: 'Off' },
        { value: 'debug', title: 'On' }
      ],
    },
  },
  animation: {
    name: 'Animation',
    description: 'Animation',
    defaultValue: storedGlobals?.animation ?? '',
    toolbar: {
      title: 'Animation',
      showName: true,
      items: [
        { value: '', title: 'Default' },
        { value: 'reduced-motion', title: 'Reduced Motion' },
      ],
    },
  }
}

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(theme + dark + fontInter + fontNvidiaSans + highContrastTheme + reducedMotionTheme + compactTheme + debugTheme + brandTheme + brandDarkTheme + ddbTheme + layoutStyles + responsiveStyles + typographyStyles + viewTransitionStyles);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

const parentStyle = document.createElement('style');
parentStyle.innerText = theme + dark + fontInter + fontNvidiaSans + highContrastTheme + reducedMotionTheme + compactTheme + debugTheme + brandTheme + brandDarkTheme + ddbTheme + layoutStyles + responsiveStyles + typographyStyles + viewTransitionStyles;
window.parent.document.head.appendChild(parentStyle);

export const decorators = [(story, { globals }) => {
  const themes = window.parent.document.querySelector('[nve-theme]')?.getAttribute('nve-theme') ?? `${globals.theme} ${globals.font}`;
  window.document.querySelector('html').setAttribute('nve-theme', themes.trim());
  window.NVE_SB_GLOBALS = globals;
  return story();
}];
