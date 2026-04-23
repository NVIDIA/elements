// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/chat-message/define.js';
import '@nvidia-elements/core/avatar/define.js';

export default {
  title: 'Elements/Chat Message',
  component: 'nve-chat-message',
};

/**
 * @summary Basic chat message with default styling and behavior. Use this for simple text-based chat interactions.
 */
export const Default = {
  render: () => html`
<nve-chat-message>
  Your deployment completed successfully. All services are running as expected.
</nve-chat-message>
`};

/**
 * @summary Different arrow positions for chat messages. Useful for creating chat bubbles that point to specific elements or users.
 * @tags test-case
 */
export const ArrowPosition = {
  render: () => html`
<section nve-layout="column gap:lg">
  <nve-chat-message>Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message arrow-position="top-start">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message arrow-position="top-end">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message arrow-position="bottom-start">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message arrow-position="bottom-end">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
</section>
`};

/**
 * @summary Flat container style with avatar integration. Perfect for modern chat interfaces where messages have a cleaner, flatter appearance.
 */
export const Flat = {
  render: () => html`
<section nve-layout="column gap:lg full">
  <nve-chat-message container="flat">
    <nve-avatar slot="prefix" color="green-grass">AI</nve-avatar>
    Your deployment completed successfully. All services are running as expected.
  </nve-chat-message>

  <nve-chat-message container="flat" style="width: 300px">
    <nve-avatar slot="prefix" color="green-grass">AI</nve-avatar>
    The build pipeline finished processing all stages. Tests passed with 98% coverage, and the deployment to staging was successful. Review the detailed logs in the CI dashboard for more information.
  </nve-chat-message>
</section>
`};

/**
 * @summary Chat conversation with prefix and suffix avatars. Ideal for multi-user chat applications where you need to distinguish between different participants.
 */
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

/**
 * @summary Chat messages with code blocks for technical discussions. Perfect for developer chat interfaces or documentation systems.
 */
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
    <code nve-text="code"><nve-chat-message></nve-chat-message></code>
    </nve-codeblock>
  </nve-chat-message>
</section>
  `
}

/**
 * @summary Custom top offset positioning for precise arrow placement. Useful when you need fine-tuned control over the chat bubble positioning.
 * @tags test-case
 */
export const TopOffset = {
  render: () => html`
<nve-chat-message arrow-position="top-start" style="--top-offset: var(--nve-ref-space-sm)">
  <nve-avatar slot="prefix" color="gray-denim">AI</nve-avatar>
  Hello, how may I assist you today?
</nve-chat-message>
  `
}

/**
 * @summary All available color variants for chat messages. Use these to create themed chat interfaces or to differentiate message types and priorities.
 * @tags test-case
 */
export const Color = {
  render: () => html`
<section nve-layout="column gap:md">
  <nve-chat-message>Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="red-cardinal">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="gray-slate">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="gray-denim">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="blue-indigo">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="blue-cobalt">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="blue-sky">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="teal-cyan">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="green-mint">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="teal-seafoam">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="green-grass">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="yellow-amber">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="orange-pumpkin">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="red-tomato">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="pink-magenta">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="purple-plum">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="purple-violet">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="purple-lavender">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="pink-rose">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="green-jade">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="lime-pear">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="yellow-nova">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
  <nve-chat-message color="brand-green">Your deployment completed successfully. All services are running as expected.</nve-chat-message>
</section>`
}