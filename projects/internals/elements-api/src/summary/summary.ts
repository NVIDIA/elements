import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import showdown from 'showdown';
import { useStyles } from '@nvidia-elements/core/internal';
import { MetadataService } from '../internal/metadata.service.js';
import { ESM_ELEMENTS_VERSION } from '../internal/version.js';
import styles from './summary.css?inline';

const showdownOptions = { simplifiedAutoLink: true };

const PACKAGE_URL = 'https://artifactory.build.nvidia.com/ui/packages?name=%40elements%2Felements&type=packages';

export class Summary extends LitElement {
  @property({ type: String }) tag = '';

  @state() private element;

  static metadata = {
    tag: 'nve-api-summary',
    version: 'demo'
  };

  static styles = useStyles([styles]);

  render() {
    return this.element
      ? html`
      <section>
        ${this.element.manifest.description ? html`<div .innerHTML=${new showdown.Converter(showdownOptions).makeHtml(this.element.manifest.description).replace('<p>', '<p nve-text="heading muted sm">')}></div>` : nothing}
        <div class="row">
          <div class="group">
            <nve-api-badge-status .value=${this.element.manifest.metadata.status}>${ESM_ELEMENTS_VERSION}</nve-api-badge-status>
            <nve-api-badge-coverage .value=${this.element.tests.unit.coverageTotal}>Coverage:&nbsp;</nve-api-badge-coverage>
            <nve-api-badge-bundle .value=${this.element.tests.lighthouse?.payload?.javascript?.kb?.toFixed(2)}>Bundle:&nbsp;</nve-api-badge-bundle>
            <nve-api-badge-lighthouse .value=${this.element.tests.lighthouse?.scores}>Lighthouse:&nbsp;</nve-api-badge-lighthouse>
            <nve-api-badge-axe .value=${this.element.manifest.metadata.axe}></nve-api-badge-axe>
          </div>
          <div class="group">
            <nve-button size="sm" style="margin-left: auto"><nve-icon name="checklist" size="sm"></nve-icon><a href=${this.element.aria}>API Spec</a></nve-button>
            ${this.element.manifest.metadata.figma ? html`<nve-button size="sm"><nve-icon name="shapes" size="sm"></nve-icon><a href=${this.element.manifest.metadata.figma}>Figma</a></nve-button>` : nothing}
            <nve-button size="sm"><nve-icon name="merge" size="sm"></nve-icon><a href=${PACKAGE_URL}>Released ${this.element.manifest.metadata.since}</a></nve-button>
          </div>
        </div>
      </section>
    `
      : nothing;
  }

  async connectedCallback() {
    super.connectedCallback();
    const metadata = await MetadataService.getMetadata();
    const elements = Object.keys(metadata).flatMap(packageName => metadata[packageName].elements ?? []);
    this.element = elements.find(d => d.name === this.tag);
  }
}
