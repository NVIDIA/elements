import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { AlertGroup } from './alert-group.js';
import styles from './alert-banner.css?inline';

/**
 * @alpha
 * @element mlv-alert-banner
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --background
 * @cssprop --border-radius
 */
export class AlertBanner extends AlertGroup {
  static styles: CSSResult[] = useStyles([...AlertGroup.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-alert-banner',
    version: 'PACKAGE_VERSION'
  };
}
