import type { CustomElements } from '@nvidia-elements/core/custom-elements-jsx';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
