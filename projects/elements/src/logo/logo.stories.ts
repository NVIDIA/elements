import { html } from 'lit';
import '@nvidia-elements/core/logo/define.js';

export default {
  title: 'Elements/Logo/Examples',
  component: 'nve-logo',
};

export const Default = {
  render: () => html`
  <nve-logo aria-label="NVIDIA"></nve-logo>
  `
};

export const Size = {
  render: () => html`
<div nve-layout="row gap:xs">
  <nve-logo size="sm" aria-label="NVIDIA"></nve-logo>
  <nve-logo aria-label="NVIDIA" ></nve-logo>
  <nve-logo size="lg" aria-label="NVIDIA"></nve-logo>
</div>
<div nve-layout="row gap:xs">
  <nve-logo size="sm" color="green-mint" aria-label="green mint">Gm</nve-logo>
  <nve-logo color="green-mint" aria-label="green mint">Gm</nve-logo>
  <nve-logo size="lg" color="green-mint" aria-label="green mint">Gm</nve-logo>
</div>
  `
};

export const SlottedIcons = {
  render: () => html`
<div nve-layout="row gap:xs">
  <nve-logo color="pink-rose" aria-label="pink rose large" size="lg">
    <nve-icon name="star"></nve-icon>
  </nve-logo>
  <nve-logo color="pink-rose" aria-label="pink rose medium" size="md">
    <nve-icon name="star"></nve-icon>
  </nve-logo>
  <nve-logo color="pink-rose" aria-label="pink rose small" size="sm">
    <nve-icon name="star"></nve-icon>
  </nve-logo>
  <nve-logo color="red-cardinal" aria-label="red cardinal">
    <nve-icon name="star"></nve-icon>
  </nve-logo>
  <nve-logo color="green-grass" aria-label="green grass">
    <nve-icon name="star"></nve-icon>
  </nve-logo>
  <nve-logo color="blue-cobalt" aria-label="blue cobalt">
    <nve-icon name="star"></nve-icon>
  </nve-logo>
</div>
  `
};

export const Color = {
  render: () => html`
<div nve-layout="row gap:xs align:wrap">
  <nve-logo aria-label="NVIDIA"></nve-logo>
  <nve-logo color="red-cardinal" aria-label="red cardinal">Rc</nve-logo>
  <nve-logo color="gray-slate" aria-label="gray slate">Gs</nve-logo>
  <nve-logo color="gray-denim" aria-label="gray denim">Gd</nve-logo>
  <nve-logo color="blue-indigo" aria-label="blue indigo">Bi</nve-logo>
  <nve-logo color="blue-cobalt" aria-label="blue cobalt">Bc</nve-logo>
  <nve-logo color="blue-sky" aria-label="blue sky">Bs</nve-logo>
  <nve-logo color="teal-cyan" aria-label="teal cyan">Tc</nve-logo>
  <nve-logo color="green-mint" aria-label="green mint">Gm</nve-logo>
  <nve-logo color="teal-seafoam" aria-label="teal seafoam">Ts</nve-logo>
  <nve-logo color="green-grass" aria-label="green grass">Gg</nve-logo>
  <nve-logo color="yellow-amber" aria-label="yellow amber">Ya</nve-logo>
  <nve-logo color="orange-pumpkin" aria-label="orange pumpkin">Op</nve-logo>
  <nve-logo color="red-tomato" aria-label="red tomato">Rt</nve-logo>
  <nve-logo color="pink-magenta" aria-label="pink magenta">Pm</nve-logo>
  <nve-logo color="purple-plum" aria-label="purple plum">Pp</nve-logo>
  <nve-logo color="purple-violet" aria-label="purple violet">Pv</nve-logo>
  <nve-logo color="purple-lavender" aria-label="purple lavender">Pl</nve-logo>
  <nve-logo color="pink-rose" aria-label="pink rose">Pr</nve-logo>
  <nve-logo color="green-jade" aria-label="green jade">Gj</nve-logo>
  <nve-logo color="lime-pear" aria-label="lime pear">Lp</nve-logo>
  <nve-logo color="yellow-nova" aria-label="yellow nova">Yn</nve-logo>
  <nve-logo color="brand-green" aria-label="brand green">Bg</nve-logo>
</div>
  `
};

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:xs align:wrap pad:sm" style="background: var(--nve-sys-layer-container-background) !important;">
  <nve-logo aria-label="NVIDIA"></nve-logo>
  <nve-logo color="red-cardinal" aria-label="red cardinal">Rc</nve-logo>
  <nve-logo color="gray-slate" aria-label="gray slate">Gs</nve-logo>
  <nve-logo color="gray-denim" aria-label="gray denim">Gd</nve-logo>
  <nve-logo color="blue-indigo" aria-label="blue indigo">Bi</nve-logo>
  <nve-logo color="blue-cobalt" aria-label="blue cobalt">Bc</nve-logo>
  <nve-logo color="blue-sky" aria-label="blue sky">Bs</nve-logo>
  <nve-logo color="teal-cyan" aria-label="teal cyan">Tc</nve-logo>
  <nve-logo color="green-mint" aria-label="green mint">Gm</nve-logo>
  <nve-logo color="teal-seafoam" aria-label="teal seafoam">Ts</nve-logo>
  <nve-logo color="green-grass" aria-label="green grass">Gg</nve-logo>
  <nve-logo color="yellow-amber" aria-label="yellow amber">Ya</nve-logo>
  <nve-logo color="orange-pumpkin" aria-label="orange pumpkin">Op</nve-logo>
  <nve-logo color="red-tomato" aria-label="red tomato">Rt</nve-logo>
  <nve-logo color="pink-magenta" aria-label="pink magenta">Pm</nve-logo>
  <nve-logo color="purple-plum" aria-label="purple plum">Pp</nve-logo>
  <nve-logo color="purple-violet" aria-label="purple violet">Pv</nve-logo>
  <nve-logo color="purple-lavender" aria-label="purple lavender">Pl</nve-logo>
  <nve-logo color="pink-rose" aria-label="pink rose">Pr</nve-logo>
  <nve-logo color="green-jade" aria-label="green jade">Gj</nve-logo>
  <nve-logo color="lime-pear" aria-label="lime pear">Lp</nve-logo>
  <nve-logo color="yellow-nova" aria-label="yellow nova">Yn</nve-logo>
  <nve-logo color="brand-green" aria-label="brand green">Bg</nve-logo>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:xs align:wrap pad:sm">
  <nve-logo aria-label="NVIDIA"></nve-logo>
  <nve-logo color="red-cardinal" aria-label="red cardinal">Rc</nve-logo>
  <nve-logo color="gray-slate" aria-label="gray slate">Gs</nve-logo>
  <nve-logo color="gray-denim" aria-label="gray denim">Gd</nve-logo>
  <nve-logo color="blue-indigo" aria-label="blue indigo">Bi</nve-logo>
  <nve-logo color="blue-cobalt" aria-label="blue cobalt">Bc</nve-logo>
  <nve-logo color="blue-sky" aria-label="blue sky">Bs</nve-logo>
  <nve-logo color="teal-cyan" aria-label="teal cyan">Tc</nve-logo>
  <nve-logo color="green-mint" aria-label="green mint">Gm</nve-logo>
  <nve-logo color="teal-seafoam" aria-label="teal seafoam">Ts</nve-logo>
  <nve-logo color="green-grass" aria-label="green grass">Gg</nve-logo>
  <nve-logo color="yellow-amber" aria-label="yellow amber">Ya</nve-logo>
  <nve-logo color="orange-pumpkin" aria-label="orange pumpkin">Op</nve-logo>
  <nve-logo color="red-tomato" aria-label="red tomato">Rt</nve-logo>
  <nve-logo color="pink-magenta" aria-label="pink magenta">Pm</nve-logo>
  <nve-logo color="purple-plum" aria-label="purple plum">Pp</nve-logo>
  <nve-logo color="purple-violet" aria-label="purple violet">Pv</nve-logo>
  <nve-logo color="purple-lavender" aria-label="purple lavender">Pl</nve-logo>
  <nve-logo color="pink-rose" aria-label="pink rose">Pr</nve-logo>
  <nve-logo color="green-jade" aria-label="green jade">Gj</nve-logo>
  <nve-logo color="lime-pear" aria-label="lime pear">Lp</nve-logo>
  <nve-logo color="yellow-nova" aria-label="yellow nova">Yn</nve-logo>
  <nve-logo color="brand-green" aria-label="brand green">Bg</nve-logo>
</div>
  `
}