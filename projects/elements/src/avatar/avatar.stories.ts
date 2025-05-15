import { html } from 'lit';
import '@nvidia-elements/core/avatar/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Avatar',
  component: 'nve-avatar',
};

export const Default = {
  render: () => html`
    <nve-avatar>AV</nve-avatar>
`};

export const Image = {
  render: () => html`
    <nve-avatar>
      <img src="static/images/stock-profile-photo.jpg" alt="User Avatar" className="full-width"/>
    </nve-avatar>
`};

export const Icon = {
  render: () => html`
    <div nve-layout="row gap:sm align:wrap">
      <nve-avatar>
        <nve-icon name="star"></nve-icon>
      </nve-avatar>
        <nve-avatar>
        <nve-icon name="person"></nve-icon>
      </nve-avatar>
    </div>
`};

export const Size = {
  render: () => html`
    <div nve-layout="row gap:sm align:wrap">
      <nve-avatar size="sm">AV</nve-avatar>
      <nve-avatar>AV</nve-avatar>
      <nve-avatar size="lg">AV</nve-avatar>
    </div>
`};

export const AvatarGroup = {
  render: () => html`
    <nve-avatar-group>
      <nve-avatar color="red-cardinal">AV</nve-avatar>
      <nve-avatar color="blue-cobalt">AV</nve-avatar>
      <nve-avatar color="green-grass">AV</nve-avatar>
      <nve-avatar>+3</nve-avatar>
    </nve-avatar-group>
`};

export const Color = {
  render: () => html`
  <div nve-layout="row gap:sm align:wrap">
    <nve-avatar color="red-cardinal">AV</nve-avatar>
    <nve-avatar color="gray-slate">AV</nve-avatar>
    <nve-avatar color="gray-denim">AV</nve-avatar>
    <nve-avatar color="blue-indigo">AV</nve-avatar>
    <nve-avatar color="blue-cobalt">AV</nve-avatar>
    <nve-avatar color="blue-sky">AV</nve-avatar>
    <nve-avatar color="teal-cyan">AV</nve-avatar>
    <nve-avatar color="green-mint">AV</nve-avatar>
    <nve-avatar color="teal-seafoam">AV</nve-avatar>
    <nve-avatar color="green-grass">AV</nve-avatar>
    <nve-avatar color="yellow-amber">AV</nve-avatar>
    <nve-avatar color="orange-pumpkin">AV</nve-avatar>
    <nve-avatar color="red-tomato">AV</nve-avatar>
    <nve-avatar color="pink-magenta">AV</nve-avatar>
    <nve-avatar color="purple-plum">AV</nve-avatar>
    <nve-avatar color="purple-violet">AV</nve-avatar>
    <nve-avatar color="purple-lavender">AV</nve-avatar>
    <nve-avatar color="pink-rose">AV</nve-avatar>
    <nve-avatar color="green-jade">AV</nve-avatar>
    <nve-avatar color="lime-pear">AV</nve-avatar>
    <nve-avatar color="yellow-nova">AV</nve-avatar>
    <nve-avatar color="brand-green">AV</nve-avatar>
   </div>
  `
}