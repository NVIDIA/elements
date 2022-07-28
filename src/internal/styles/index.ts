import { unsafeCSS } from 'lit';
import base from '../styles/base.css?inline';

export function useStyles(styles: unknown[]) {
  return [unsafeCSS(base), ...styles.map(s => unsafeCSS(s))];
}
