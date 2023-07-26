/* eslint-disable guard-for-in */
import { html, LitElement, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';
import layout from '@elements/elements/css/module.layout.css?inline';
import typography from '@elements/elements/css/module.typography.css?inline';
import { Icon, IconName, ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/button/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/checkbox/define.js';
import '@elements/elements/divider/define.js';
import '@elements/elements/notification/define.js';

export default {
  title: 'Elements/Icon/Examples',
  component: 'mlv-icon',
  argTypes: {
    name: {
      control: 'inline-radio',
      options: ICON_NAMES
    },
    status: {
      control: 'inline-radio',
      options: ['default', 'success', 'warning', 'danger', 'accent']
    },
  }
};

interface ArgTypes {
  status: Icon['status'];
  name: IconName;
}

export const Default = {
  render: (args: ArgTypes) =>
    html`<mlv-icon
      .name=${args.name}
      .status=${args.status}
    ></mlv-icon>`,
  args: { name: 'user' }
};

export const IconCatalog = {
  render: () => html`
    <icon-demo></icon-demo>

    <mlv-notification-group position="bottom" alignment="end"></mlv-notification-group>
  `
};

@customElement('icon-demo')
class IconDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @state() private iconSearchKey = '';

  render() {
    return html`
    <style>
      :host {
        contain: initial;
      }

      mlv-button {
        --border-radius: var(--mlv-ref-border-radius-sm);
        --height: 100px;
      }
    </style>

    <mlv-card>
      <mlv-card-content mlv-layout="column gap:lg">
        <form @input=${this.#input} mlv-layout="row gap:md align:vertical-center">
          <mlv-search style="--width: 308px">
            <input type="search" @input=${e => this.iconSearchKey = e.target.value} aria-label="Search the Icon Catalog" placeholder="Search the Icon Catalog" />
          </mlv-search>
          <mlv-select style="--width: 90px">
            <select aria-label="size" .value=${this.values.size} name="size">
              <option value="sm">small</option>
              <option value="">medium</option>
              <option value="lg">large</option>
            </select>
          </mlv-select>
          <mlv-select>
            <select aria-label="direction" .value=${this.values.direction} name="direction">
              <option value="">up</option>
              <option value="down">down</option>
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </mlv-select>
          <mlv-checkbox style="min-width: 200px">
            <label>bounding box</label>
            <input type="checkbox" .checked=${this.values.outline} name="outline" />
          </mlv-checkbox>
        </form>          

        <div mlv-layout="grid gap:md span-items:2">
          ${ICON_NAMES.filter((iconName) => iconName.includes(this.iconSearchKey)).map((iconName) => html`
            <mlv-button @click=${() => this.#copyIcon(iconName)} title="Copy '${iconName}' to clipboard.">
              <div mlv-layout="column align:center gap:md">
                <mlv-icon ?outline=${this.values.outline} .size=${this.values.size} .name=${iconName as IconName} .direction=${this.#getRotation(iconName, this.values.direction)}></mlv-icon>
                <h3 mlv-text="label sm">${iconName}</h3>
              </div>
            </mlv-button>`
          )}
        </div>
      </mlv-card-content>
    </mlv-card>
  `;
  }

  @state() values = { size: 'lg', outline: false, direction: '' };

  get #form() {
    return this.shadowRoot.querySelector('form');
  }

  #getRotation(iconName, direction) {
    return iconName.includes('arrow') || iconName.includes('chevron') || iconName.includes('caret') || iconName.includes('thumb') ? direction : '';
  }

  #input() {
    this.values = Object.fromEntries(new FormData(this.#form)) as any;
  }

  #copyIcon(iconName: string) {
    const iconCode = `<mlv-icon name="${iconName}"></mlv-icon>`;
    navigator.clipboard.writeText(iconCode);

    const notification = document.createElement('mlv-notification');
    notification.closable = true;
    notification.closeTimeout = 2000;
    notification.innerHTML = `<h3 mlv-text="label">Copied!</h3><p mlv-text="body">${iconCode} icon code copied to clipboard.</p>`;
    notification.addEventListener('close', () => notification.remove(), { once: true });
    document.querySelector('mlv-notification-group').prepend(notification);
  }
}

export const PreviewAllIcons = {
  render: () => html`
    ${ICON_NAMES.map((iconName) => html`<mlv-icon name=${iconName as IconName}></mlv-icon>\n`
    )}
  `,
  args: { name: 'person' }
};

export const Statuses = {
  render: () => html`
    <mlv-icon name="person"></mlv-icon>
    <mlv-icon name="person" status="accent"></mlv-icon>
    <mlv-icon name="person" status="success"></mlv-icon>
    <mlv-icon name="person" status="warning"></mlv-icon>
    <mlv-icon name="person" status="danger"></mlv-icon>
  `
}

export const Size = {
  render: () => html`
    <mlv-icon name="person" size="sm"></mlv-icon>
    <mlv-icon name="person"></mlv-icon>
    <mlv-icon name="person" size="lg"></mlv-icon>
  `
}

export const Direction = {
  render: () => html`
    <mlv-icon name="arrow-stop" direction="left"></mlv-icon>
    <mlv-icon name="arrow-stop" direction="right"></mlv-icon>
    <mlv-icon name="arrow" direction="up"></mlv-icon>
    <mlv-icon name="arrow" direction="down"></mlv-icon>
    <mlv-icon name="arrow" direction="left"></mlv-icon>
    <mlv-icon name="arrow" direction="right"></mlv-icon>
    <mlv-icon name="caret" direction="up"></mlv-icon>
    <mlv-icon name="caret" direction="down"></mlv-icon>
    <mlv-icon name="caret" direction="left"></mlv-icon>
    <mlv-icon name="caret" direction="right"></mlv-icon>
    <mlv-icon name="chevron" direction="up"></mlv-icon>
    <mlv-icon name="chevron" direction="down"></mlv-icon>
    <mlv-icon name="chevron" direction="left"></mlv-icon>
    <mlv-icon name="chevron" direction="right"></mlv-icon>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="root light">
      <mlv-icon name="person"></mlv-icon>
      <mlv-icon name="person" status="accent"></mlv-icon>
      <mlv-icon name="person" status="success"></mlv-icon>
      <mlv-icon name="person" status="warning"></mlv-icon>
      <mlv-icon name="person" status="danger"></mlv-icon>
    </div>
    <div mlv-theme="root dark">
      <mlv-icon name="person"></mlv-icon>
      <mlv-icon name="person" status="accent"></mlv-icon>
      <mlv-icon name="person" status="success"></mlv-icon>
      <mlv-icon name="person" status="warning"></mlv-icon>
      <mlv-icon name="person" status="danger"></mlv-icon>
    </div>
  `
}


export const Registration = {
  render: () => html`
    <mlv-icon name="inference-ai-posters" style="--width: 75px; --height: 75px;"></mlv-icon>
    <mlv-icon name="automotive-vehicles-autonomous-car-side" style="--width: 75px; --height: 75px;"></mlv-icon>

    <script type="module">
      customElements.get('mlv-icon').add({
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
    <mlv-icon name="chevron"></mlv-icon>
    <mlv-icon name="chevron-up"></mlv-icon>

    <script type="module">
      customElements.get('mlv-icon').alias({
        'chevron': 'chevron-up'
      });
    </script>
  `
}

export const Source = {
  render: () => html`
    <mlv-icon name="https://brand-assets.cne.ngc.nvidia.com/assets/marketing-icons/1.2.0/automotive-vehicles-autonomous-car-side.svg" style="--width: 75px; --height: 75px;"></mlv-icon>
  `
}

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
  "common-calendar",
  "common-cancel",
  "common-check",
  "common-check-circle",
  "common-clipboard",
  "common-clock",
  "common-close",
  "common-close-circle",
  "common-cog",
  "common-copy-doc",
  "common-copy-generic",
  "common-exit",
  "common-eye",
  "common-eye-off",
  "common-filter",
  "common-help-circle",
  "common-history",
  "common-home",
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
  "communication-firewall",
  "communication-forward",
  "communication-isp",
  "communication-network-signal",
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
  "editor-chart",
  "editor-chart-bar",
  "editor-chart-flow",
  "editor-chart-hierarchy",
  "editor-chart-performance",
  "editor-chart-pie",
  "editor-chart-tree",
  "editor-export-to-clipboard",
  "editor-fit",
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
  "editor-move",
  "editor-paperclip",
  "editor-paragraph",
  "editor-pencil",
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
  "hardware-battery-100",
  "hardware-battery-25",
  "hardware-battery-50",
  "hardware-battery-75",
  "hardware-battery-boost",
  "hardware-battery-charging",
  "hardware-bluetooth",
  "hardware-calculator",
  "hardware-cpu",
  "hardware-display",
  "hardware-display-collection",
  "hardware-drive-cloud",
  "hardware-drive-network",
  "hardware-drive-removable",
  "hardware-drive-usb",
  "hardware-ethernet",
  "hardware-fan",
  "hardware-fan-loud",
  "hardware-fan-quiet",
  "hardware-gamepad",
  "hardware-gamepad-off",
  "hardware-gamepad-start",
  "hardware-gpu",
  "hardware-gpu-card",
  "hardware-keyboard",
  "hardware-laptop",
  "hardware-lightning",
  "hardware-mac",
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
  "hardware-tablet",
  "hardware-telephone",
  "hardware-usb",
  "hardware-vr",
  "hardware-watch",
  "hardware-webcam",
  "hardware-webcam-settings",
  "hardware-whispermode",
  "hardware-wireless-modem",
  "hardware-workstation",
  "hardware-workstation-system",
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
  "image-mirror",
  "image-outpainting",
  "image-palette",
  "image-scale",
  "image-scale-relative",
  "image-scale-relative-off",
  "image-shapes",
  "image-sun-high",
  "image-sun-low",
  "image-transparency",
  "maps-airplane",
  "maps-briefcase",
  "maps-bush",
  "maps-dirt",
  "maps-flag",
  "maps-flower",
  "maps-fog",
  "maps-grass",
  "maps-gravel",
  "maps-hill",
  "maps-location",
  "maps-map",
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
  "misc-bandaid",
  "misc-beaker",
  "misc-blackboard",
  "misc-book",
  "misc-bug",
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
  "misc-mug",
  "misc-neural-network",
  "misc-news",
  "misc-package",
  "misc-payment-card",
  "misc-pulse",
  "misc-radar",
  "misc-radioactive",
  "misc-rocket",
  "misc-running",
  "misc-scale-balance",
  "misc-school",
  "misc-seed",
  "misc-sensor",
  "misc-shield",
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
  "view-workspace-group",
];

export const Branding = {
  render: () => html`
    <div mlv-layout="column gap:md">
      <div mlv-layout="row align:wrap gap:xs">
        ${GUI_NAMES.map(name => html`<mlv-icon name="${`https://brand-assets.cne.ngc.nvidia.com/assets/icons/2.0.1/line/${name}.svg`}" size="lg"></mlv-icon>`)}
      </div>
      <mlv-divider></mlv-divider>
      <div mlv-layout="row align:wrap gap:xs">
        ${GUI_NAMES.map(name => html`<mlv-icon name="${`https://brand-assets.cne.ngc.nvidia.com/assets/icons/2.0.1/fill/${name}.svg`}" size="lg"></mlv-icon>`)}
      </div>
    </div>
  `
}
