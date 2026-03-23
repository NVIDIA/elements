import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { ChatMessage } from '@nvidia-elements/core/chat-message';
import '@nvidia-elements/core/chat-message/define.js';

describe(ChatMessage.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ChatMessage;

  beforeEach(async () => {
    fixture = await createFixture(html`
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
    `);
    element = fixture.querySelector(ChatMessage.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ChatMessage.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
