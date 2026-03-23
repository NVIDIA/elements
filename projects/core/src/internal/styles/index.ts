import { unsafeCSS } from 'lit';
import base from './base.css?inline';
import state from './interaction-state.css?inline';
import _colorStateStyles from './color.state.css?inline';
import _statusStateStyles from './status.state.css?inline';
import _supportStateStyles from './support.state.css?inline';

export const colorStateStyles = _colorStateStyles;

export const statusStateStyles = _statusStateStyles;

export const supportStateStyles = _supportStateStyles;

export function useStyles(styles: unknown[]) {
  return [unsafeCSS(base), unsafeCSS(state), ...styles.map(s => unsafeCSS(s))];
}
