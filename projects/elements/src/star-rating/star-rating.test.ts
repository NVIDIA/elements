import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { StarRating } from '@nvidia-elements/core/star-rating';
import '@nvidia-elements/core/star-rating/define.js';
import '@nvidia-elements/core/forms/define.js';

describe(StarRating.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: StarRating;
  let element2: StarRating;
  let input: HTMLInputElement;
  let icons: NodeListOf<HTMLElement>;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-star-rating id="star-rating-1">
        <label>label</label>
        <input type="range"/>
        <nve-control-message>message</nve-control-message>
    </nve-star-rating>
     <nve-star-rating id="star-rating-2">
        <label>label</label>
        <input type="range" max="3" min="1"/>
        <nve-control-message>message</nve-control-message>
    </nve-star-rating>
    `);

    element = fixture.querySelector('#star-rating-1');
    element2 = fixture.querySelector('#star-rating-2');
    input = fixture.querySelector('input');
    icons = element.shadowRoot.querySelectorAll('nve-icon');

    await elementIsStable(element);
    await elementIsStable(element2);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(StarRating.metadata.tag)).toBeDefined();
  });

  it('should update the rating value when the range input changes and update the displayed stars', async () => {
    input.value = '4';
    input.dispatchEvent(new Event('input'));
    await element.updateComplete;
    const stars = element.shadowRoot.querySelectorAll('nve-icon');
    const filledStars = Array.from(stars).filter(star => star.getAttribute('name') === 'star');
    expect(element['value']).toBe(4);
    expect(filledStars.length).toBe(4); // four stars should be filled
  });

  it('should highlight the correct star on hover', async () => {
    const starIcons = element.shadowRoot.querySelectorAll('nve-icon');
    // Simulate hover over the 3rd star (index 2)
    const starToHover = starIcons[2];
    starToHover.dispatchEvent(new MouseEvent('mouseover'));
    await element.updateComplete;
    expect(starToHover.getAttribute('name')).toBe('star'); // The 3rd star should be highlighted
  });

  it('should update the value when a star is clicked', async () => {
    // Click on the 4th star (index 3)
    const starToClick = icons[3];
    starToClick.dispatchEvent(new MouseEvent('click'));
    await element.updateComplete;
    // The value should be 4 (since we clicked on the 4th star)
    expect(element['value']).toBe(4);
  });

  it('should highlight the correct star on hover', async () => {
    const starIcons = element.shadowRoot.querySelectorAll('nve-icon');
    const starToHover = starIcons[2];
    starToHover.dispatchEvent(new MouseEvent('mouseout'));
    await element.updateComplete;
    expect(element['active']).toBe(0);
  });

  it('should update max value', async () => {
    expect(element2['max']).toBe(3);
  });

  it('should update min value', async () => {
    expect(element2['min']).toBe(1);
  });
});
