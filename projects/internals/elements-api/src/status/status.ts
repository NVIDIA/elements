import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { MetadataService } from '../internals/metadata.service.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './status.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';

export class Status extends LitElement {
  @property({ type: String }) tag = '';

  @state() private metadata;

  static metadata = {
    tag: 'nve-api-status',
    version: '0.0.0'
  };

  static styles = useStyles([styles, typography]);

  openNewTab() {
    const newUrl = new URL(window.parent.location.href);
    newUrl.searchParams.set('anchor', 'element-status');
    window.open(newUrl, '_blank').focus();
  }

  render() {
    return this.metadata
      ? html`
    <div class="status-summary">
      <h2 nve-text="heading xl" class="dynamic-anchor">
        <a @click=${() => this.openNewTab()}><nve-icon name="link"></nve-icon></a>
        Release Status
      </h2>
      <nve-divider></nve-divider>

      <p>All elements and features go through 3 phases of stability, pre-release, beta and stable.</p>
      <div class="status-group">
        <nve-badge .status=${this.metadata.status === 'pre-release' ? 'warning' : 'pending'}>pre-release <nve-icon name="exclamation-triangle"></nve-icon></nve-badge>
        <div class="alerts">
          <nve-alert .status=${this.metadata.figma ? 'finished' : 'pending'}>Published in <a href="http://nv/elements-figma">Figma</a></nve-alert>
          <nve-alert .status=${this.metadata.storybook ? 'finished' : 'pending'}>Storybook Preview</nve-alert>
          <nve-alert .status=${this.metadata.storybook ? 'finished' : 'pending'}>API Documentation</nve-alert>
          <nve-alert .status=${this.metadata.themes ? 'finished' : 'pending'}>Fully Themeable</nve-alert>
        </div>
      </div>
      <div class="status-group">
        <nve-badge .status=${this.metadata.status === 'beta' ? 'running' : 'pending'}>beta <nve-icon name="clock"></nve-icon></nve-badge>
        <div class="alerts">
          <nve-alert .status=${this.metadata.unitTests ? 'finished' : 'pending'}>Robust unit test coverages</nve-alert>
          <nve-alert .status=${this.metadata.apiReview ? 'finished' : 'pending'}>Passed <a href="./?path=/docs/api-design-getting-started--docs">API Review</a></nve-alert>
          <nve-alert .status=${this.metadata.vqa ? 'finished' : 'pending'}>Passed Designer VQA Review</nve-alert>
          <nve-alert .status=${this.metadata.package ? 'finished' : 'pending'}>Included in <a href="http://nv/elements">library package</a></nve-alert>
        </div>
      </div>
      <div class="status-group">
        <nve-badge .status=${this.metadata.status === 'stable' ? 'finished' : 'pending'}>stable <nve-icon name="checkmark-circle"></nve-icon></nve-badge>
        <div class="alerts">
          <nve-alert .status=${this.metadata.aria ? 'finished' : 'pending'}>No known outstanding <a href="https://www.w3.org/WAI/ARIA/apg/">AA WCAG issues</a></nve-alert>
          <nve-alert .status=${this.metadata.performance ? 'finished' : 'pending'}>No known outstanding performance issues</nve-alert>
          <nve-alert .status=${this.metadata.responsive ? 'finished' : 'pending'}>Adapts to different screen/container sizes</nve-alert>
          <nve-alert .status=${this.metadata.stable ? 'finished' : 'pending'}>No breaking API changes for at least 90 days</nve-alert>
        </div>
      </div>
    </div>
    `
      : nothing;
  }

  async connectedCallback() {
    super.connectedCallback();
    this.id = 'element-status';
    const metadata = await MetadataService.getMetadata();
    const elements = Object.keys(metadata).flatMap(packageName => metadata[packageName].elements ?? []);
    this.metadata = elements.find(d => d.name === this.tag)?.manifest?.metadata;
  }
}
