import elements from "../../../elements/coverage/size/index.html?raw";

export default { title: "Internal/Bundle Sizes" };

export const Elements = () => elements.replace('</style>', `
  main, body {
    padding: 0 !important;
  }

  svg > g:first-child {
    display: none;
  }

  .sidebar {
    margin: 0 50px 12px 50px !important;
    display: none;
  }

  [fill="rgb(230, 230, 230)"] {
    fill: transparent;
  }

  /* red */
  [fill="rgb(219, 189, 189)"] {
    fill: var(--nve-ref-color-green-grass-1100);
  }

  [fill="rgb(183, 123, 123)"] {
    fill: var(--nve-ref-color-green-grass-1000);
  }

  [fill="rgb(201, 156, 156)"] {
    fill: var(--nve-ref-color-green-grass-900);
  }

  [fill="rgb(166, 89, 89)"] {
    fill: var(--nve-ref-color-green-grass-800);
  }

  [fill="rgb(132, 72, 72)"] {
    fill: var(--nve-ref-color-green-grass-700);
  }

  [fill="rgb(99, 54, 54)"] {
    fill: var(--nve-ref-color-green-grass-700) !important;
  }

  [fill="rgb(99, 54, 54)"] + text,
  [fill="rgb(132, 72, 72)"] + text {
    fill: var(--nve-sys-interaction-selected-color);
  }

  /* purple/blue */
  [fill="rgb(205, 189, 219)"],
  [fill="rgb(189, 189, 219)"] {
    fill: var(--nve-ref-color-purple-lavender-1100);
  }

  [fill="rgb(179, 156, 201)"],
  [fill="rgb(156, 156, 201)"] {
    fill: var(--nve-ref-color-purple-lavender-1000);
  }

  [fill="rgb(154, 123, 183)"],
  [fill="rgb(123, 123, 183)"] {
    fill: var(--nve-ref-color-purple-lavender-800);
  }

  [fill="rgb(123, 123, 183)"] + text {
    fill: var(--nve-sys-interaction-selected-color);
  }

  [fill="rgb(129, 89, 166)"],
  [fill="rgb(89, 89, 166)"] {
    fill: var(--nve-ref-color-purple-lavender-700);
  }

  [fill="rgb(89, 89, 166)"] + text {
    fill: var(--nve-sys-interaction-selected-color);
  }

  /* green */
  [fill="rgb(205, 219, 189)"],
  [fill="rgb(189, 219, 189)"] {
    fill: var(--nve-ref-color-gray-denim-1100);
  }

  [fill="rgb(179, 201, 156)"],
  [fill="rgb(156, 201, 156)"] {
    fill: var(--nve-ref-color-gray-denim-1000);
  }

  [fill="rgb(154, 183, 123)"],
  [fill="rgb(123, 183, 123)"] {
    fill: var(--nve-ref-color-gray-denim-900);
  }

  [fill="rgb(129, 166, 89)"],
  [fill="rgb(89, 166, 89)"] {
    fill: var(--nve-ref-color-gray-denim-800);
  }

  [fill="rgb(129, 166, 89)"] + text,
  [fill="rgb(154, 183, 123)"] + text,
  [fill="rgb(89, 166, 89)"] + text {
    fill: var(--nve-sys-interaction-selected-color);
  }

  /* teal */
  [fill="rgb(189, 219, 219)"] {
    fill: var(--nve-ref-color-purple-plum-1000);
  }

  [fill="rgb(156, 201, 201)"] {
    fill: var(--nve-ref-color-purple-plum-900);
  }

  [fill="rgb(123, 183, 183)"] {
    fill: var(--nve-ref-color-purple-plum-800);
  }

  [fill="rgb(123, 183, 183)"] + text {
    fill: var(--nve-sys-interaction-selected-color);
  }
</style>`);
