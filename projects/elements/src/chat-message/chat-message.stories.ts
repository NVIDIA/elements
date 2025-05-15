import { html } from 'lit';
import '@nvidia-elements/core/chat-message/define.js';
import '@nvidia-elements/core/avatar/define.js';

export default {
  title: 'Elements/Chat Message',
  component: 'nve-chat-message',
};

export const Default = {
  render: () => html`
  <nve-chat-message>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  </nve-chat-message>`};

export const ArrowPosition = {
  render: () => html`
  <section nve-layout="column gap:lg">
    <nve-chat-message>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
    <nve-chat-message arrow-position="top-start">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
    <nve-chat-message arrow-position="top-end">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
    <nve-chat-message arrow-position="bottom-start">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
    <nve-chat-message arrow-position="bottom-end">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
  </section>
`};

export const Flat = {
  render: () => html`
  <section nve-layout="column gap:lg full">
  <nve-chat-message container="flat">
    <nve-avatar slot="prefix" color="green-grass">AI</nve-avatar>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  </nve-chat-message>

  <nve-chat-message container="flat" style="width: 300px">
    <nve-avatar slot="prefix" color="green-grass">AI</nve-avatar>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  </nve-chat-message>
</section>
`};

export const PrefixSuffix = {
  render: () => html`
  <section nve-layout="column gap:lg full" style="max-width: 600px">
      <nve-chat-message style="max-width: 70%">
        <nve-avatar slot="prefix" color="gray-denim">AI</nve-avatar>
        Hello, how may I assist you today?
      </nve-chat-message>
      <nve-chat-message style="max-width: 70%; margin-left: auto">
        How do I use the chat message component?
        <nve-avatar slot="suffix" color="green-grass">NV</nve-avatar>
      </nve-chat-message>
      <nve-chat-message style="max-width: 70%">
        <nve-avatar slot="prefix" color="gray-denim">AI</nve-avatar>
        <p nve-text="body">To use the <code nve-text="code">nve-chat-message</code> first import the element.</p>
        <nve-codeblock language="typescript">
          import '@nvidia-elements/code/codeblock/define.js';
        </nve-codeblock>
      </nve-chat-message>
    </section>
`};

export const Codeblock = {
  render: () => html`
  <section nve-layout="column gap:lg full">
    <nve-chat-message container="flat" style="margin-left: auto">
      How do I use the chat message component?
    </nve-chat-message>
    <nve-chat-message container="flat">
      Here's the steps you need to do follow to use the chat message component
      <nve-codeblock language="typescript">
      import '@nvidia-elements/core/chat-message/define.js';
      <code><nve-chat-message></nve-chat-message></code>
      </nve-codeblock>
    </nve-chat-message>

  </section>
  `
}

export const TopOffset = {
  render: () => html`
  <nve-chat-message arrow-position="top-start" style="--top-offset: var(--nve-ref-space-sm)">
    <nve-avatar slot="prefix" color="gray-denim">AI</nve-avatar>
    Hello, how may I assist you today?
  </nve-chat-message>
  `
}

export const Color = {
    render: () => html `
    <section nve-layout="column gap:md">
      <nve-chat-message>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="red-cardinal">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="gray-slate">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="gray-denim">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="blue-indigo">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="blue-cobalt">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="blue-sky">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="teal-cyan">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="green-mint">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="teal-seafoam">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="green-grass">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="yellow-amber">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="orange-pumpkin">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="red-tomato">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="pink-magenta">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="purple-plum">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="purple-violet">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="purple-lavender">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="pink-rose">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="green-jade">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="lime-pear">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="yellow-nova">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
      <nve-chat-message color="brand-green">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</nve-chat-message>
    </section>`
}