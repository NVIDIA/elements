import type { CustomElements } from '@nvidia-elements/core/custom-elements-jsx';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
