import { css, html, LitElement, nothing, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';
import type { IconName} from '@nvidia-elements/core/icon';
import { ICON_NAMES } from '@nvidia-elements/core/icon';
import type { Size  as IconSize} from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/notification/define.js';

export default {
  title: 'Elements/Icon/Examples',
  component: 'nve-icon'
};

export const Default = {
  render: () => html`<nve-icon name="person"></nve-icon>`
};

export const IconCatalog = {
  render: () => html`
    <icon-demo></icon-demo>

    <nve-notification-group position="bottom" alignment="end"></nve-notification-group>
  `
};


class IconDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @state() private iconSearchKey = '';

  render() {
    return html`
    <style>
      :host {
        contain: initial;
      }

      nve-button {
        --border-radius: var(--nve-ref-border-radius-sm);
        --height: 100px;
      }
    </style>

    <nve-card>
      <nve-card-content nve-layout="column gap:lg">
        <form @submit=${e => e.preventDefault()} @input=${this.#input} nve-layout="row gap:md align:vertical-center full">
          <nve-search style="width: 350px">
            <input type="search" @input=${e => this.iconSearchKey = e.target.value} aria-label="Search the Icon Catalog" placeholder="Search the Icon Catalog" />
          </nve-search>
          <nve-select style="--width: 90px; --text-transform: none">
            <select aria-label="size" .value=${this.values.size} name="size">
              <option value="xs">xs</option>
              <option value="sm">sm</option>
              <option value="">md</option>
              <option value="lg">lg</option>
              <option value="xl">xl</option>
            </select>
          </nve-select>
          <nve-select style="--width: 90px; --text-transform: none">
            <select aria-label="direction" .value=${this.values.direction} name="direction">
              <option value="">up</option>
              <option value="down">down</option>
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </nve-select>
          <nve-checkbox style="min-width: 200px">
            <label>bounding box</label>
            <input type="checkbox" .checked=${this.values.outline} name="outline" />
          </nve-checkbox>
        </form>          

        <div nve-layout="grid gap:md span-items:2">
          ${ICON_NAMES.filter((iconName) => iconName.includes(this.iconSearchKey)).map((iconName) => html`
            <nve-button @click=${() => this.#copyIcon(iconName)} title="Copy '${iconName}' to clipboard." container="flat">
              <div nve-layout="column align:center gap:md">
                <nve-icon ?outline=${this.values.outline} .size=${this.values.size as IconSize} .name=${iconName as IconName} .direction=${this.#getRotation(iconName, this.values.direction)}></nve-icon>
                <h3 nve-text="label sm light muted">${iconName}</h3>
              </div>
            </nve-button>`
    )}
        </div>
      </nve-card-content>
    </nve-card>
  `;
  }

  @state() values = { size: 'xl', outline: false, direction: '' };

  get #form() {
    return this.shadowRoot.querySelector('form');
  }

  #getRotation(iconName, direction) {
    return iconName.includes('arrow') || iconName.includes('chevron') || iconName.includes('caret') || iconName.includes('thumb') ? direction : '';
  }

  #input() {
    this.values = Object.fromEntries(new FormData(this.#form)) as any;
  }

  async #copyIcon(iconName: string) {
    const iconCode = `<nve-icon name="${iconName}"></nve-icon>`;
    await navigator.clipboard.writeText(iconCode);

    const notification = document.createElement('nve-notification');
    notification.closable = true;
    notification.closeTimeout = 2000;
    notification.innerHTML = `<h3 nve-text="label">Copied!</h3><p nve-text="body">${iconCode} icon code copied to clipboard.</p>`;
    notification.addEventListener('close', () => notification.remove(), { once: true });
    document.querySelector('nve-notification-group').prepend(notification);
  }
}

customElements.get('icon-demo') || customElements.define('icon-demo', IconDemo);

export const PreviewAllIcons = {
  render: () => html`
    ${ICON_NAMES.map((iconName) => html`<nve-icon name=${iconName as IconName}></nve-icon>\n`
  )}
  `,
  args: { name: 'person' }
};

export const Statuses = {
  render: () => html`
    <nve-icon name="person"></nve-icon>
    <nve-icon name="person" status="accent"></nve-icon>
    <nve-icon name="person" status="success"></nve-icon>
    <nve-icon name="person" status="warning"></nve-icon>
    <nve-icon name="person" status="danger"></nve-icon>
  `
}

export const Size = {
  render: () => html`
    <nve-icon name="person" size="sm"></nve-icon>
    <nve-icon name="person"></nve-icon>
    <nve-icon name="person" size="lg"></nve-icon>
  `
}

export const Direction = {
  render: () => html`
    <nve-icon name="arrow-stop" direction="left"></nve-icon>
    <nve-icon name="arrow-stop" direction="right"></nve-icon>
    <nve-icon name="arrow" direction="up"></nve-icon>
    <nve-icon name="arrow" direction="down"></nve-icon>
    <nve-icon name="arrow" direction="left"></nve-icon>
    <nve-icon name="arrow" direction="right"></nve-icon>
    <nve-icon name="caret" direction="up"></nve-icon>
    <nve-icon name="caret" direction="down"></nve-icon>
    <nve-icon name="caret" direction="left"></nve-icon>
    <nve-icon name="caret" direction="right"></nve-icon>
    <nve-icon name="chevron" direction="up"></nve-icon>
    <nve-icon name="chevron" direction="down"></nve-icon>
    <nve-icon name="chevron" direction="left"></nve-icon>
    <nve-icon name="chevron" direction="right"></nve-icon>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="root light">
      <nve-icon name="person"></nve-icon>
      <nve-icon name="person" status="accent"></nve-icon>
      <nve-icon name="person" status="success"></nve-icon>
      <nve-icon name="person" status="warning"></nve-icon>
      <nve-icon name="person" status="danger"></nve-icon>
    </div>
    <div nve-theme="root dark">
      <nve-icon name="person"></nve-icon>
      <nve-icon name="person" status="accent"></nve-icon>
      <nve-icon name="person" status="success"></nve-icon>
      <nve-icon name="person" status="warning"></nve-icon>
      <nve-icon name="person" status="danger"></nve-icon>
    </div>
  `
}


export const Registration = {
  render: () => html`
    <nve-icon name=${'inference-ai-posters' as any} style="--width: 75px; --height: 75px;"></nve-icon>
    <nve-icon name=${'automotive-vehicles-autonomous-car-side' as any} style="--width: 75px; --height: 75px;"></nve-icon>

    <script type="module">
      customElements.get('nve-icon').add({
        'inference-ai-posters': {
          svg: () => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48"><g clip-path="url(#inference-ai-posters__a)"><path fill="currentColor" d="M40.5 11.5h-33v25h33v-25Zm-1 24h-31v-23h31v23ZM5.5 9.325V38.5h37V9.325h-37Zm36 28.175h-35V10.325h35V37.5Zm-26-10.908a1.477 1.477 0 0 0-1.23.093 1.5 1.5 0 1 0 1.908 2.233L22.5 32.04a1.5 1.5 0 0 0 2.992 0l6.326-3.122a1.506 1.506 0 1 0 .679-2.326l-1.927-2.623 1.853-2.585a1.5 1.5 0 1 0-.5-2.42l-6.432-2.842c0-.041.012-.08.012-.122a1.5 1.5 0 1 0-3 0c0 .042.009.081.012.122l-6.435 2.842a1.5 1.5 0 1 0-.5 2.42l1.853 2.585-1.933 2.623Zm8-9.184a1.4 1.4 0 0 0 1 0l3.246 4.41-2.567 1.265a1.482 1.482 0 0 0-2.356 0l-2.567-1.265 3.244-4.41Zm8 10.552-5.869 2.9 3.035-4.235 2.842 1.255c.002.02-.008.052-.008.08Zm-15.016-.084 2.842-1.255 3.035 4.235L16.5 27.96c0-.028-.01-.06-.012-.084h-.004Zm7.852 2.666a1.4 1.4 0 0 0-.68 0l-3.267-4.39 2.526-1.116a1.492 1.492 0 0 0 2.162 0l2.526 1.116-3.267 4.39ZM24.5 24a.5.5 0 0 1-.038.189v.011a.5.5 0 0 1-.914 0v-.011A.5.5 0 1 1 24.5 24Zm.988.122c0-.027.007-.054.008-.081l2.852-1.4.932 1.259-1.06 1.425-2.732-1.203Zm-2.988-.081c0 .027.006.054.008.081l-2.728 1.207-1.06-1.429.932-1.267 2.848 1.408Zm-3.769 1.75-2.081.919 1.388-1.886.693.967ZM14.5 28a.5.5 0 1 1 .999.002A.5.5 0 0 1 14.5 28Zm9.5 4.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Zm9.5-4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm-2.154-1.29-2.081-.919.693-.967 1.388 1.886Zm-2.087-4.522 2.048-1.008-1.4 1.884-.648-.876ZM33.5 20a.5.5 0 0 1-.692.461l-.172-.123-.011-.017-.1-.206A.492.492 0 0 1 32.5 20a.5.5 0 0 1 .998.007L33.5 20Zm-2-.031-2.846 1.4-3-4.081 5.858 2.588c-.002.032-.012.062-.012.093ZM24 15.5a.5.5 0 0 1 .463.685l-.009.019a.507.507 0 0 1-.1.149h-.006a.495.495 0 0 1-.7 0h-.006a.507.507 0 0 1-.1-.149l-.009-.019A.5.5 0 0 1 24 15.5Zm-1.654 1.789-3 4.081-2.846-1.4c0-.03-.007-.06-.009-.091l5.855-2.59ZM14.5 20a.5.5 0 1 1 1 0 .459.459 0 0 1-.024.117l-.1.2-.013.02-.172.123a.49.49 0 0 1-.545-.106A.5.5 0 0 1 14.5 20Zm2.193 1.18 2.048 1.008-.646.876-1.402-1.884Z"/></g><defs><clipPath id="inference-ai-posters__a"><path fill="currentColor" d="M0 0h48v48H0z"/></clipPath></defs></svg>'
        },
        'automotive-vehicles-autonomous-car-side': {
          svg: () => fetch('https://brand-assets.cne.ngc.nvidia.com/assets/marketing-icons/1.2.0/automotive-vehicles-autonomous-car-side.svg').then(r => r.text())
        }
      });
    </script>
  `
}

export const Alias = {
  render: () => html`
    <nve-icon name="chevron"></nve-icon>
    <nve-icon name=${'chevron-up' as any}></nve-icon>

    <script type="module">
      customElements.get('nve-icon').alias({
        'chevron': 'chevron-up'
      });
    </script>
  `
}

export const Source = {
  render: () => html`
    <nve-icon name=${'https://brand-assets.cne.ngc.nvidia.com/assets/marketing-icons/1.2.0/automotive-vehicles-autonomous-car-side.svg' as any} style="--width: 75px; --height: 75px;"></nve-icon>
  `
}


class IconPerformanceDemo extends LitElement {
  static styles = [unsafeCSS(layout), css`
  :host {
    display: block;
    height: 500px;
    padding: 24px 0;
  }

  div {
    height: 675px;
    width: 675px;
    contain: layout;
    overflow: hidden;
  }
  `];

  #multiplier = 1000;

  @state() private show = false;

  @state() private icons = Array(this.#multiplier).fill('').map(() => html`<nve-icon name="person"></nve-icon>`)

  render() {
    return html`
      <nve-button @click=${() => this.show = !this.show}>show icons</nve-button>
      <p>${this.#multiplier}</p>
      <div>
        ${this.show ? this.icons : nothing}
      </div>
    `
  }
}

customElements.get('icon-performance-demo') || customElements.define('icon-performance-demo', IconPerformanceDemo);

export const Performance = {
  render: () => html`
<div>
  <icon-performance-demo></icon-performance-demo>
</div>
  `
};

const GUI_NAMES = [
  "3d-3d-axis",
  "3d-cloth",
  "3d-cube",
  "3d-dolly",
  "3d-emissive",
  "3d-explode",
  "3d-instance",
  "3d-light-rect",
  "3d-light-rotate",
  "3d-material",
  "3d-move-global",
  "3d-reference",
  "3d-rotate-3d",
  "3d-rotate-global",
  "3d-segment",
  "3d-shader",
  "3d-shader-ball",
  "3d-skeleton",
  "3d-teapot",
  "3d-teleport",
  "3d-texture",
  "av-auto-record",
  "av-auto-record-off",
  "av-broadcast",
  "av-camera",
  "av-camera-off",
  "av-clap-board",
  "av-display-surround",
  "av-eject",
  "av-equalizer",
  "av-faders",
  "av-fast-forward",
  "av-fast-reverse",
  "av-film",
  "av-film-add",
  "av-film-collection",
  "av-fps",
  "av-high-quality",
  "av-hud",
  "av-loop",
  "av-loop-off",
  "av-microphone",
  "av-microphone-off",
  "av-next",
  "av-notes",
  "av-pause",
  "av-picture-in-picture",
  "av-play",
  "av-previous",
  "av-record",
  "av-replay",
  "av-replay-off",
  "av-soundwaves",
  "av-speaker",
  "av-speaker-high",
  "av-speaker-low",
  "av-speaker-medium",
  "av-speaker-mute",
  "av-speaker-off",
  "av-step-forward",
  "av-step-reverse",
  "av-stop",
  "av-videocam",
  "av-videocam-off",
  "common-add",
  "common-add-circle",
  "common-alarm",
  "common-bell",
  "common-bell-off",
  "common-calendar",
  "common-cancel",
  "common-check",
  "common-check-circle",
  "common-clipboard",
  "common-clock",
  "common-close",
  "common-close-circle",
  "common-cog",
  "common-cog-off",
  "common-copy-doc",
  "common-copy-generic",
  "common-error",
  "common-exit",
  "common-eye",
  "common-eye-off",
  "common-filter",
  "common-help-circle",
  "common-history",
  "common-home",
  "common-home-off",
  "common-info-circle",
  "common-link",
  "common-link-break",
  "common-lock-closed",
  "common-lock-open",
  "common-magnifying-glass",
  "common-magnifying-glass-minus",
  "common-magnifying-glass-plus",
  "common-menu",
  "common-more-horiz",
  "common-more-vert",
  "common-paperplane",
  "common-redo",
  "common-refresh",
  "common-reset",
  "common-retry",
  "common-share",
  "common-sort",
  "common-star",
  "common-subtract",
  "common-subtract-circle",
  "common-sync",
  "common-sync-off",
  "common-timer",
  "common-trash",
  "common-undo",
  "common-warning",
  "communication-cloud",
  "communication-cloud-off",
  "communication-data",
  "communication-download",
  "communication-envelope",
  "communication-envelope-off",
  "communication-firewall",
  "communication-firewall-off",
  "communication-forward",
  "communication-isp",
  "communication-isp-off",
  "communication-network-signal",
  "communication-network-signal-off",
  "communication-reply",
  "communication-sync-warning",
  "communication-transfer-horizontal",
  "communication-transfer-vertical",
  "communication-upload",
  "communication-wifi",
  "communication-wifi-off",
  "cursor-arrow",
  "cursor-crosshair",
  "cursor-hand-closed",
  "cursor-hand-open",
  "cursor-hand-pinch",
  "cursor-hand-point",
  "cursor-hourglass",
  "editor-anchor-center",
  "editor-anchor-e",
  "editor-anchor-n",
  "editor-anchor-ne",
  "editor-anchor-nw",
  "editor-anchor-s",
  "editor-anchor-se",
  "editor-anchor-sw",
  "editor-anchor-w",
  "editor-bold",
  "editor-branch",
  "editor-chart",
  "editor-chart-bar",
  "editor-chart-flow",
  "editor-chart-hierarchy",
  "editor-chart-performance",
  "editor-chart-pie",
  "editor-chart-tree",
  "editor-commit",
  "editor-export-to-clipboard",
  "editor-fit",
  "editor-fork",
  "editor-freehand",
  "editor-grid",
  "editor-grid-off",
  "editor-h-align-center",
  "editor-h-align-left",
  "editor-h-align-right",
  "editor-image",
  "editor-italic",
  "editor-iterate",
  "editor-keyframe",
  "editor-layers",
  "editor-layers-off",
  "editor-line-segment",
  "editor-list-bullet",
  "editor-list-checkmark",
  "editor-list-number",
  "editor-merge",
  "editor-move",
  "editor-paperclip",
  "editor-paragraph",
  "editor-pencil",
  "editor-pull",
  "editor-rotate",
  "editor-rotate-90-clockwise",
  "editor-rotate-90-counter",
  "editor-ruler",
  "editor-scale-down",
  "editor-scale-reset",
  "editor-scale-up",
  "editor-section",
  "editor-section-bottom",
  "editor-section-top",
  "editor-select-brush",
  "editor-signature",
  "editor-skip",
  "editor-sliders",
  "editor-sticker",
  "editor-sticker-image",
  "editor-sticker-shape",
  "editor-sticker-text",
  "editor-sticker-zoom",
  "editor-strikethrough",
  "editor-stroke-width",
  "editor-style",
  "editor-swatches",
  "editor-text",
  "editor-text-align-center",
  "editor-text-align-full",
  "editor-text-align-left",
  "editor-text-align-right",
  "editor-text-framed",
  "editor-trash-delete",
  "editor-underline",
  "editor-v-align-bottom",
  "editor-v-align-center",
  "editor-v-align-top",
  "editor-wand",
  "editor-wrench",
  "files-archive",
  "files-db",
  "files-document",
  "files-document-new",
  "files-document-preview",
  "files-export",
  "files-floppy",
  "files-folder-closed",
  "files-folder-open",
  "files-import",
  "hardware-2-b-left-click",
  "hardware-battery-0",
  "hardware-battery-0-off",
  "hardware-battery-100",
  "hardware-battery-25",
  "hardware-battery-50",
  "hardware-battery-75",
  "hardware-battery-boost",
  "hardware-battery-charging",
  "hardware-bluetooth",
  "hardware-bluetooth-off",
  "hardware-calculator",
  "hardware-cpu",
  "hardware-display",
  "hardware-display-collection",
  "hardware-display-off",
  "hardware-drive-cloud",
  "hardware-drive-cloud-off",
  "hardware-drive-network",
  "hardware-drive-network-off",
  "hardware-drive-removable",
  "hardware-drive-removable-off",
  "hardware-drive-usb",
  "hardware-drive-usb-off",
  "hardware-ethernet",
  "hardware-fan",
  "hardware-fan-loud",
  "hardware-fan-quiet",
  "hardware-gamepad",
  "hardware-gamepad-off",
  "hardware-gamepad-start",
  "hardware-gpu",
  "hardware-gpu-card",
  "hardware-gpu-card-multi",
  "hardware-gpu-card-off",
  "hardware-gpu-off",
  "hardware-keyboard",
  "hardware-laptop",
  "hardware-lightning",
  "hardware-mac",
  "hardware-mac-off",
  "hardware-media-optical",
  "hardware-mosaic",
  "hardware-mouse-2-b",
  "hardware-mouse-2-b-right-click",
  "hardware-mouse-3-b",
  "hardware-mouse-scrollwheel",
  "hardware-mouse-scrollwheel-active",
  "hardware-multidrive",
  "hardware-network",
  "hardware-network-connection",
  "hardware-network-pcs",
  "hardware-nvidia-shield",
  "hardware-nvidia-shield-stand",
  "hardware-performance-high",
  "hardware-performance-low",
  "hardware-performance-medium",
  "hardware-plug-recepticle",
  "hardware-plug-usb",
  "hardware-plugin",
  "hardware-power",
  "hardware-ram",
  "hardware-remote",
  "hardware-robot-arm",
  "hardware-sd-card",
  "hardware-smartphone",
  "hardware-smartphone-off",
  "hardware-tablet",
  "hardware-tablet-off",
  "hardware-telephone",
  "hardware-telephone-off",
  "hardware-usb",
  "hardware-vr",
  "hardware-watch",
  "hardware-webcam",
  "hardware-webcam-off",
  "hardware-webcam-settings",
  "hardware-whispermode",
  "hardware-wireless-modem",
  "hardware-wireless-modem-off",
  "hardware-workstation",
  "hardware-workstation-off",
  "hardware-workstation-system",
  "hardware-workstation-system-off",
  "image-brush",
  "image-bucket",
  "image-camera-360",
  "image-camera-linked",
  "image-camera-super",
  "image-collection",
  "image-crop",
  "image-easel",
  "image-eraser",
  "image-eyedropper",
  "image-group",
  "image-import-image",
  "image-mask-inside",
  "image-mask-outside",
  "image-mirror",
  "image-outpainting",
  "image-palette",
  "image-scale",
  "image-scale-relative",
  "image-scale-relative-off",
  "image-select-ellipse",
  "image-select-polygon",
  "image-select-rectangle",
  "image-shapes",
  "image-sun-high",
  "image-sun-low",
  "image-sun-off-high",
  "image-transparency",
  "images-denoise",
  "maps-airplane",
  "maps-briefcase",
  "maps-bush",
  "maps-business",
  "maps-dirt",
  "maps-factory",
  "maps-flag",
  "maps-flower",
  "maps-fog",
  "maps-grass",
  "maps-gravel",
  "maps-hill",
  "maps-location",
  "maps-location-off",
  "maps-map",
  "maps-map-off",
  "maps-mountain",
  "maps-mud",
  "maps-river",
  "maps-rock",
  "maps-sand",
  "maps-sea",
  "maps-sky",
  "maps-snow",
  "maps-stone",
  "maps-straw",
  "maps-suitcase",
  "maps-toolbox",
  "maps-tree",
  "maps-trees",
  "maps-water",
  "maps-world",
  "maps-world-off",
  "misc-bandaid",
  "misc-beaker",
  "misc-blackboard",
  "misc-book",
  "misc-bug",
  "misc-bug-off",
  "misc-code",
  "misc-compass",
  "misc-ekg",
  "misc-function",
  "misc-gift",
  "misc-graduate",
  "misc-graph-node",
  "misc-health",
  "misc-hot-air-balloon",
  "misc-ime",
  "misc-key",
  "misc-library",
  "misc-library-games",
  "misc-lightbulb",
  "misc-magnet",
  "misc-math",
  "misc-microscope",
  "misc-mode-component",
  "misc-moon",
  "misc-moon-off",
  "misc-mug",
  "misc-neural-network",
  "misc-news",
  "misc-package",
  "misc-payment-card",
  "misc-pulse",
  "misc-qrcode",
  "misc-radar",
  "misc-radioactive",
  "misc-rocket",
  "misc-running",
  "misc-scale-balance",
  "misc-school",
  "misc-seed",
  "misc-sensor",
  "misc-shield",
  "misc-shield-off",
  "misc-ship-wheel",
  "misc-shopping-bag",
  "misc-shopping-basket",
  "misc-shopping-cart",
  "misc-shopping-cart-open",
  "misc-tag",
  "misc-tag-label",
  "misc-telescope",
  "misc-thermometer",
  "misc-weight",
  "misc-weight-bar",
  "shape-diamond",
  "shape-diamond-off",
  "shapes-arrow-down",
  "shapes-arrow-down-left",
  "shapes-arrow-down-max",
  "shapes-arrow-down-right",
  "shapes-arrow-left",
  "shapes-arrow-left-max",
  "shapes-arrow-right",
  "shapes-arrow-right-max",
  "shapes-arrow-up",
  "shapes-arrow-up-left",
  "shapes-arrow-up-max",
  "shapes-arrow-up-right",
  "shapes-chevron-double-down",
  "shapes-chevron-double-left",
  "shapes-chevron-double-right",
  "shapes-chevron-double-up",
  "shapes-chevron-down",
  "shapes-chevron-down-left-up-right",
  "shapes-chevron-left",
  "shapes-chevron-left-right",
  "shapes-chevron-right",
  "shapes-chevron-up",
  "shapes-chevron-up-down",
  "shapes-chevron-up-left-down-right",
  "shapes-return",
  "shapes-shape-circle",
  "shapes-shape-circle-off",
  "shapes-shape-hexagon",
  "shapes-shape-octogon",
  "shapes-shape-square",
  "shapes-shape-square-off",
  "shapes-shape-triangle",
  "social-award-ribbon",
  "social-award-trophy",
  "social-bookmark",
  "social-bookmark-off",
  "social-chat-message",
  "social-chat-multi",
  "social-chat-single",
  "social-feeling-happy",
  "social-feeling-neutral",
  "social-feeling-sad",
  "social-feeling-very-happy",
  "social-feeling-very-sad",
  "social-founders",
  "social-founders-tier-1",
  "social-founders-tier-2",
  "social-founders-tier-3",
  "social-heart",
  "social-heart-off",
  "social-pin",
  "social-pin-off",
  "social-profile",
  "social-profile-group",
  "social-profile-off",
  "social-ranking-xp",
  "social-thumb-down",
  "social-thumb-up",
  "view-apps",
  "view-display-share",
  "view-dual",
  "view-feedback",
  "view-fit-to-page",
  "view-fullscreen",
  "view-fullscreen-exit",
  "view-gallery-strip",
  "view-grip-area",
  "view-grip-corner",
  "view-grip-edge-horizontal",
  "view-grip-edge-vertical",
  "view-grip-mini",
  "view-layout-columns",
  "view-layout-detail",
  "view-layout-grid",
  "view-layout-list",
  "view-layout-rows",
  "view-map",
  "view-open-external",
  "view-render",
  "view-window",
  "view-window-code",
  "view-window-grid",
  "view-window-stack",
  "view-window-terminal",
  "view-workspace",
  "view-workspace-group"
];

export const Branding = {
  render: () => html`
    <div nve-layout="column gap:md">
      <div nve-layout="row align:wrap gap:xs">
        ${GUI_NAMES.map(name => html`<nve-icon name=${`https://brand-assets.cne.ngc.nvidia.com/assets/icons/2.1.1/line/${name}.svg` as any} size="xl"></nve-icon>`)}
      </div>
      <nve-divider></nve-divider>
      <div nve-layout="row align:wrap gap:xs">
        ${GUI_NAMES.map(name => html`<nve-icon name=${`https://brand-assets.cne.ngc.nvidia.com/assets/icons/2.1.1/fill/${name}.svg` as any} size="xl"></nve-icon>`)}
      </div>
    </div>
  `
}
