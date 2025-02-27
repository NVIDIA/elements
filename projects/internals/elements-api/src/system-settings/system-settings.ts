import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './system-settings.css?inline';

export class SystemSettings extends LitElement {
  get #globals() {
    return {
      theme: 'dark',
      font: '',
      scale: '',
      debug: '',
      animation: '',
      sourceType: 'html',
      ...(JSON.parse(localStorage.getItem('elements-sb-globals')) ?? {})
    };
  }

  set #globals(globals: Record<string, string>) {
    try {
      localStorage.setItem('elements-sb-globals', JSON.stringify({ ...this.#globals, ...globals }));
    } catch (error) {
      console.error('Could not store globals in local storage:', error);
    }
  }

  static metadata = {
    tag: 'nve-api-system-settings',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  #updatePreferences(event: Event) {
    const preferences = Object.fromEntries((event.target as unknown as { value: FormData }).value);
    console.log(preferences);
    this.#writeGlobals({
      theme: preferences['color-scheme'] as string,
      scale: preferences['scale'] === 'default' ? '' : (preferences['scale'] as string),
      animation: preferences['reduced-motion'] === 'true' ? 'reduced-motion' : ''
    });
  }

  render() {
    return html`
      <form internal-host>
        <nve-preferences-input
          @change=${e => this.#updatePreferences(e)}
          .value=${{
            'color-scheme': this.#globals.theme,
            'reduced-motion': this.#globals.animation === 'reduced-motion',
            scale: this.#globals.scale === '' ? 'default' : this.#globals.scale
          }}></nve-preferences-input>
        <nve-divider></nve-divider>
        <nve-select container="flat" style="--border-bottom: 0; --min-width: 170px">
          <label>Experimental Themes</label>
          <select size="3" .value=${this.#globals.theme} @change=${e => this.#writeGlobals({ theme: e.target.value })}>
            <option ?selected=${this.#globals.theme === 'ddb-dark'} value="ddb-dark">DDB Dark</option>
            <option ?selected=${this.#globals.theme === 'brand'} value="brand">Brand</option>
            <option ?selected=${this.#globals.theme === 'brand-dark'} value="brand-dark">Brand Dark</option>
          </select>
        </nve-select>
        <nve-divider></nve-divider>
        <nve-select container="flat" style="--border-bottom: 0; --min-width: 170px">
          <label>Data</label>
          <nve-icon-button slot="label" popovertarget="demo-data-tooltip" size="sm" container="flat" icon-name="information-circle-stroke" style="--height: 12px"></nve-icon-button>
          <select size="3" @change=${e => this.#writeGlobals({ dataTheme: e.target.value })}>
            <option ?selected=${this.#globals.dataTheme === 'models'} value="models">AI/ML</option>
            <option ?selected=${this.#globals.dataTheme === ''} value="">Infra</option>
            <option ?selected=${this.#globals.dataTheme === 'hardware'} value="hardware">Hardware</option>
          </select>
        </nve-select>
        <nve-divider></nve-divider>
        <nve-select container="flat" style="--border-bottom: 0; --min-width: 170px">
          <label>Font</label>
          <select size="3" @change=${e => this.#writeGlobals({ font: e.target.value })}>
            <option ?selected=${this.#globals.font === ''} value="">Default</option>
            <option ?selected=${this.#globals.font === 'inter'} value="inter">Inter</option>
            <option ?selected=${this.#globals.font === 'nvidia-sans'} value="nvidia-sans">NVIDIA Sans</option>
          </select>
        </nve-select>
        <nve-divider></nve-divider>
        <nve-switch-group>
          <label>Variants</label>
          <nve-switch>
            <label>Debug</label>
            <input type="checkbox" value="debug" .checked=${this.#globals.debug === 'debug'} @change=${e => this.#writeGlobals({ debug: e.target.checked ? 'debug' : '' })} />
          </nve-switch>
        </nve-switch-group>
      </form>
      <nve-tooltip id="demo-data-tooltip">Demo data to be displayed in examples (see datagrid)</nve-tooltip>
    `;
  }

  #writeGlobals(update: Record<string, string>) {
    const globals = { ...this.#globals, ...update };
    const themes = [
      globals.theme === 'auto'
        ? globalThis.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : globals.theme,
      globals.font,
      globals.scale,
      globals.debug,
      globals.animation,
      globals.experimental,
      globals.systemOptions
    ]
      .filter(i => i !== '')
      .join(' ')
      .trim();
    this.requestUpdate();

    this.#globals = globals;
    globalThis.document.documentElement.setAttribute('nve-theme', themes);
    globalThis.document
      .querySelector<HTMLIFrameElement>('#storybook-preview-iframe')
      ?.contentDocument?.querySelector('html')
      ?.setAttribute('nve-theme', themes);
  }
}
