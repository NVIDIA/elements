import { unsafeCSS } from 'lit';
import base from '../styles/base.css?inline';
import state from '../styles/interaction-state.css?inline';

export function useStyles(styles: unknown[]) {
  return [unsafeCSS(base), unsafeCSS(state), ...styles.map(s => unsafeCSS(s))];
}
