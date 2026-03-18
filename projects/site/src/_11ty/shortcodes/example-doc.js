import markdownIt from 'markdown-it';
import { siteData } from '../../index.11tydata.js';
import { exampleShortcode } from './example.js';
import { exampleTagsShortcode } from './example.js';
import { apiShortcode } from './api.js';

const { elements, examples } = siteData;

const md = markdownIt();

/**
 * The `example-doc` shortcode is similar to the `example` shortcode but will
 * automatically render the best match documentation available for the example.
 * The shortcode will attempt automatically match/prioritize the most detailed
 * content available first such as the component API, component description and
 * example summary.
 */
export async function exampleDocShortcode(entrypoint, exampleName, config = {}) {
  const example = findExample(entrypoint, exampleName);
  const element = findElement(example.element);
  const content = await getBestAvailableContent(example, element);
  const largeLayout = isLargeLayout(example);
  const isPopover = isPopoverType(element);

  return /* html */ `
  <div class="example-doc" nve-layout="column gap:sm" style="width: 100%;">
    <div nve-layout="row gap:sm align:wrap align:space-between" style="width: 100%;">
      <h3 nve-text="heading lg emphasis" id="${example.id}">${example.name.split(/(?=[A-Z])/).join(' ')}</h3>
      ${await exampleTagsShortcode(example.entrypoint, example.name)}
    </div>
    <div nve-layout="grid gap:sm ${largeLayout ? 'span-items:12' : 'span-items:12 &xl|span-items:6'}">
      ${example.entrypoint ? await exampleShortcode(example.entrypoint, example.name, { summary: false, inline: !isPopover, height: isPopover ? '400px' : undefined, ...config }) : ''}
      <div nve-layout="column gap:sm">${content}</div>
    </div>
  </div>
`.replace('\n', '');
}

async function getBestAvailableContent(example, element) {
  const member = element?.manifest?.members?.find(m => m.name.toLowerCase() === example.name.toLowerCase());
  const isDefaultElementExample = example.name === 'Default';
  const isEventExample = example.name.startsWith('Event');
  const isPropertyExample = member;

  let content = '';
  if (isDefaultElementExample) {
    content = await apiShortcode(element.name, 'description');
  } else if (isEventExample) {
    content = await apiShortcode(element.name, 'event');
  } else if (isPropertyExample) {
    content = await apiShortcode(element.name, 'property', member.name);
  } else {
    content = `<p nve-text="body relaxed">${md.renderInline(example.summary)}</p>`;
  }

  return content;
}

function findElement(elementName) {
  const element = elements.find(s => s.name === elementName);
  if (!element) {
    console.error('Element not found: ', elementName);
  }
  return element;
}

function findExample(ref, exampleName) {
  const example = examples.find(s => s.entrypoint?.includes(ref) && s.name === exampleName);

  if (!example) {
    throw new Error(`Example not found: ${ref} ${exampleName}`);
  }

  return example;
}

function isLargeLayout(example) {
  return (
    example.entrypoint?.includes('drawer') ||
    example.entrypoint?.includes('dialog') ||
    example.entrypoint?.includes('page') ||
    example.entrypoint?.includes('grid') ||
    example.entrypoint?.includes('monaco') ||
    example.entrypoint?.includes('layout') ||
    example.name.toLowerCase().includes('horizontal') ||
    example.name.toLowerCase().includes('inline')
  );
}

function isPopoverType(element) {
  return element.manifest?.metadata?.behavior === 'popover';
}
