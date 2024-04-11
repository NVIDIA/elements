import { html } from 'lit';
import '@nvidia-elements/core/logo/define.js';

export default {
  title: 'Elements/Logo/Examples',
  component: 'mlv-logo',
};

export const Default = {
  render: () => html`
  <mlv-logo aria-label="NVIDIA"></mlv-logo>
  `
};

export const Size = {
  render: () => html`
<div mlv-layout="row gap:xs">
  <mlv-logo size="sm" aria-label="NVIDIA"></mlv-logo>
  <mlv-logo aria-label="NVIDIA" ></mlv-logo>
  <mlv-logo size="lg" aria-label="NVIDIA"></mlv-logo>
</div>
<div mlv-layout="row gap:xs">
  <mlv-logo size="sm" color="green-mint" aria-label="green mint">Gm</mlv-logo>
  <mlv-logo color="green-mint" aria-label="green mint">Gm</mlv-logo>
  <mlv-logo size="lg" color="green-mint" aria-label="green mint">Gm</mlv-logo>
</div>
  `
};

export const Color = {
  render: () => html`
<div mlv-layout="row gap:xs align:wrap">
  <mlv-logo aria-label="NVIDIA"></mlv-logo>
  <mlv-logo color="red-cardinal" aria-label="red cardinal">Rc</mlv-logo>
  <mlv-logo color="gray-slate" aria-label="gray slate">Gs</mlv-logo>
  <mlv-logo color="gray-denim" aria-label="gray denim">Gd</mlv-logo>
  <mlv-logo color="blue-indigo" aria-label="blue indigo">Bi</mlv-logo>
  <mlv-logo color="blue-cobalt" aria-label="blue cobalt">Bc</mlv-logo>
  <mlv-logo color="blue-sky" aria-label="blue sky">Bs</mlv-logo>
  <mlv-logo color="teal-cyan" aria-label="teal cyan">Tc</mlv-logo>
  <mlv-logo color="green-mint" aria-label="green mint">Gm</mlv-logo>
  <mlv-logo color="teal-seafoam" aria-label="teal seafoam">Ts</mlv-logo>
  <mlv-logo color="green-grass" aria-label="green grass">Gg</mlv-logo>
  <mlv-logo color="yellow-amber" aria-label="yellow amber">Ya</mlv-logo>
  <mlv-logo color="orange-pumpkin" aria-label="orange pumpkin">Op</mlv-logo>
  <mlv-logo color="red-tomato" aria-label="red tomato">Rt</mlv-logo>
  <mlv-logo color="pink-magenta" aria-label="pink magenta">Pm</mlv-logo>
  <mlv-logo color="purple-plum" aria-label="purple plum">Pp</mlv-logo>
  <mlv-logo color="purple-violet" aria-label="purple violet">Pv</mlv-logo>
  <mlv-logo color="purple-lavender" aria-label="purple lavender">Pl</mlv-logo>
  <mlv-logo color="pink-rose" aria-label="pink rose">Pr</mlv-logo>
  <mlv-logo color="green-jade" aria-label="green jade">Gj</mlv-logo>
  <mlv-logo color="lime-pear" aria-label="lime pear">Lp</mlv-logo>
  <mlv-logo color="yellow-nova" aria-label="yellow nova">Yn</mlv-logo>
  <mlv-logo color="brand-green" aria-label="brand green">Bg</mlv-logo>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:xs align:wrap pad:sm" style="background: var(--mlv-sys-layer-container-background) !important;">
  <mlv-logo aria-label="NVIDIA"></mlv-logo>
  <mlv-logo color="red-cardinal" aria-label="red cardinal">Rc</mlv-logo>
  <mlv-logo color="gray-slate" aria-label="gray slate">Gs</mlv-logo>
  <mlv-logo color="gray-denim" aria-label="gray denim">Gd</mlv-logo>
  <mlv-logo color="blue-indigo" aria-label="blue indigo">Bi</mlv-logo>
  <mlv-logo color="blue-cobalt" aria-label="blue cobalt">Bc</mlv-logo>
  <mlv-logo color="blue-sky" aria-label="blue sky">Bs</mlv-logo>
  <mlv-logo color="teal-cyan" aria-label="teal cyan">Tc</mlv-logo>
  <mlv-logo color="green-mint" aria-label="green mint">Gm</mlv-logo>
  <mlv-logo color="teal-seafoam" aria-label="teal seafoam">Ts</mlv-logo>
  <mlv-logo color="green-grass" aria-label="green grass">Gg</mlv-logo>
  <mlv-logo color="yellow-amber" aria-label="yellow amber">Ya</mlv-logo>
  <mlv-logo color="orange-pumpkin" aria-label="orange pumpkin">Op</mlv-logo>
  <mlv-logo color="red-tomato" aria-label="red tomato">Rt</mlv-logo>
  <mlv-logo color="pink-magenta" aria-label="pink magenta">Pm</mlv-logo>
  <mlv-logo color="purple-plum" aria-label="purple plum">Pp</mlv-logo>
  <mlv-logo color="purple-violet" aria-label="purple violet">Pv</mlv-logo>
  <mlv-logo color="purple-lavender" aria-label="purple lavender">Pl</mlv-logo>
  <mlv-logo color="pink-rose" aria-label="pink rose">Pr</mlv-logo>
  <mlv-logo color="green-jade" aria-label="green jade">Gj</mlv-logo>
  <mlv-logo color="lime-pear" aria-label="lime pear">Lp</mlv-logo>
  <mlv-logo color="yellow-nova" aria-label="yellow nova">Yn</mlv-logo>
  <mlv-logo color="brand-green" aria-label="brand green">Bg</mlv-logo>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:xs align:wrap pad:sm">
  <mlv-logo aria-label="NVIDIA"></mlv-logo>
  <mlv-logo color="red-cardinal" aria-label="red cardinal">Rc</mlv-logo>
  <mlv-logo color="gray-slate" aria-label="gray slate">Gs</mlv-logo>
  <mlv-logo color="gray-denim" aria-label="gray denim">Gd</mlv-logo>
  <mlv-logo color="blue-indigo" aria-label="blue indigo">Bi</mlv-logo>
  <mlv-logo color="blue-cobalt" aria-label="blue cobalt">Bc</mlv-logo>
  <mlv-logo color="blue-sky" aria-label="blue sky">Bs</mlv-logo>
  <mlv-logo color="teal-cyan" aria-label="teal cyan">Tc</mlv-logo>
  <mlv-logo color="green-mint" aria-label="green mint">Gm</mlv-logo>
  <mlv-logo color="teal-seafoam" aria-label="teal seafoam">Ts</mlv-logo>
  <mlv-logo color="green-grass" aria-label="green grass">Gg</mlv-logo>
  <mlv-logo color="yellow-amber" aria-label="yellow amber">Ya</mlv-logo>
  <mlv-logo color="orange-pumpkin" aria-label="orange pumpkin">Op</mlv-logo>
  <mlv-logo color="red-tomato" aria-label="red tomato">Rt</mlv-logo>
  <mlv-logo color="pink-magenta" aria-label="pink magenta">Pm</mlv-logo>
  <mlv-logo color="purple-plum" aria-label="purple plum">Pp</mlv-logo>
  <mlv-logo color="purple-violet" aria-label="purple violet">Pv</mlv-logo>
  <mlv-logo color="purple-lavender" aria-label="purple lavender">Pl</mlv-logo>
  <mlv-logo color="pink-rose" aria-label="pink rose">Pr</mlv-logo>
  <mlv-logo color="green-jade" aria-label="green jade">Gj</mlv-logo>
  <mlv-logo color="lime-pear" aria-label="lime pear">Lp</mlv-logo>
  <mlv-logo color="yellow-nova" aria-label="yellow nova">Yn</mlv-logo>
  <mlv-logo color="brand-green" aria-label="brand green">Bg</mlv-logo>
</div>
  `
}