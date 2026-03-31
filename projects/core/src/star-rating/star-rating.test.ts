import { html } from 'lit';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { StarRating } from '@nvidia-elements/core/star-rating';
import '@nvidia-elements/core/star-rating/define.js';
import '@nvidia-elements/core/forms/define.js';

describe(StarRating.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: StarRating;
  let element2: StarRating;
  let element3: StarRating;
  let input: HTMLInputElement;
  let halfStarInput: HTMLInputElement;
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
    <nve-star-rating id="star-rating-3">
        <label>Half-star rating</label>
        <input id="half-star-input" type="range" max="5" value="3.5" min="0" step="0.5"/>
        <nve-control-message>message</nve-control-message>
    </nve-star-rating>
    `);

    element = fixture.querySelector('#star-rating-1');
    element2 = fixture.querySelector('#star-rating-2');
    element3 = fixture.querySelector('#star-rating-3');
    input = element.querySelector('input');
    halfStarInput = element3.querySelector('input');
    icons = element.shadowRoot.querySelectorAll('nve-icon');

    await elementIsStable(element);
    await elementIsStable(element2);
    await elementIsStable(element3);
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

  // Half-star rating tests
  it('should display half-star correctly', async () => {
    const stars = element3.shadowRoot.querySelectorAll('nve-icon');

    const fullStars = Array.from(stars).filter(star => star.getAttribute('name') === 'star');
    expect(fullStars.length).toBe(3);

    const halfStars = Array.from(stars).filter(star => star.getAttribute('name') === 'star-half');
    expect(halfStars.length).toBe(1);
    expect(stars[3].getAttribute('name')).toBe('star-half');
  });

  it('should update to half-star value', async () => {
    halfStarInput.value = '2.5';
    halfStarInput.dispatchEvent(new Event('input'));
    await element3.updateComplete;

    const stars = element3.shadowRoot.querySelectorAll('nve-icon');
    expect(stars[2].getAttribute('name')).toBe('star-half');
    expect(element3['value']).toBe(2.5);
  });

  it('should reset value to 0', async () => {
    halfStarInput.value = '2.5';
    halfStarInput.dispatchEvent(new Event('input'));
    await element3.updateComplete;

    halfStarInput.value = '0';
    halfStarInput.dispatchEvent(new Event('input'));
    await element3.updateComplete;

    const emptyStars = Array.from(element3.shadowRoot.querySelectorAll('nve-icon')).filter(
      star => star.getAttribute('name') === 'star-stroke'
    );
    expect(element3['value']).toBe(0);
    expect(emptyStars.length).toBe(5);
  });

  it('should set active to half-star value on left side hover', async () => {
    element3['active'] = 0; // Reset first
    element3['active'] = 2.5; // This is what #handleMouseMove would set for left side of 3rd star

    await element3.updateComplete;
    expect(element3['active']).toBe(2.5);
  });

  it('should set active to full-star value on right side hover', async () => {
    element3['active'] = 0; // Reset first
    element3['active'] = 2; // This is what #handleMouseMove would set for right side of 2nd star

    await element3.updateComplete;
    expect(element3['active']).toBe(2);
  });

  it('should reset active value on mouseleave', async () => {
    element3['active'] = 2.5;

    const starsContainer = element3.shadowRoot.querySelector('.stars');
    starsContainer.dispatchEvent(new MouseEvent('mouseleave'));
    await element3.updateComplete;

    expect(element3['active']).toBe(0);
  });

  it('should use active value when clicking', async () => {
    element3['active'] = 2;

    const stars = element3.shadowRoot.querySelectorAll('nve-icon');
    stars[1].dispatchEvent(new MouseEvent('click'));
    await element3.updateComplete;

    expect(element3['value']).toBe(2);
  });

  it('should use active half-star value when clicking', async () => {
    element3['active'] = 2.5;

    const stars = element3.shadowRoot.querySelectorAll('nve-icon');
    stars[2].dispatchEvent(new MouseEvent('click'));
    await element3.updateComplete;

    expect(element3['value']).toBe(2.5);
  });

  it('should toggle off when clicking current value', async () => {
    halfStarInput.value = '4';
    halfStarInput.dispatchEvent(new Event('input'));
    await element3.updateComplete;

    element3['active'] = 0;
    const stars = element3.shadowRoot.querySelectorAll('nve-icon');
    stars[3].dispatchEvent(new MouseEvent('click'));
    await element3.updateComplete;

    expect(element3['value']).toBe(0);
  });

  it('should toggle off full and half-star values', async () => {
    // Test full-star toggle
    halfStarInput.value = '3';
    halfStarInput.dispatchEvent(new Event('input'));
    await element3.updateComplete;

    element3['active'] = 0;
    element3.shadowRoot.querySelectorAll('nve-icon')[2].dispatchEvent(new MouseEvent('click'));
    await element3.updateComplete;
    expect(element3['value']).toBe(0);

    // Test half-star toggle
    halfStarInput.value = '2.5';
    halfStarInput.dispatchEvent(new Event('input'));
    await element3.updateComplete;

    element3['active'] = 0;
    element3.shadowRoot.querySelectorAll('nve-icon')[2].dispatchEvent(new MouseEvent('click'));
    await element3.updateComplete;
    expect(element3['value']).toBe(0);
  });

  it('should detect mouse position for half-star selection', async () => {
    const stars = element3.shadowRoot.querySelectorAll('nve-icon');
    const thirdStar = stars[2];

    // Mock getBoundingClientRect
    const originalGetBoundingClientRect = thirdStar.getBoundingClientRect;
    thirdStar.getBoundingClientRect = () => ({ left: 0, width: 30 }) as DOMRect;

    // Test left side (half-star)
    const leftSideEvent = new MouseEvent('mousemove', { bubbles: true });
    Object.defineProperty(leftSideEvent, 'clientX', { value: 10 });
    thirdStar.dispatchEvent(leftSideEvent);
    await element3.updateComplete;
    expect(element3['active']).toBe(2.5);

    // Test right side (full-star)
    const rightSideEvent = new MouseEvent('mousemove', { bubbles: true });
    Object.defineProperty(rightSideEvent, 'clientX', { value: 25 });
    thirdStar.dispatchEvent(rightSideEvent);
    await element3.updateComplete;
    expect(element3['active']).toBe(3);

    thirdStar.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('should dispatch input and change events on native input when star is clicked', async () => {
    const inputHandler = vi.fn();
    const changeHandler = vi.fn();
    input.addEventListener('input', inputHandler);
    input.addEventListener('change', changeHandler);

    const starToClick = icons[2];
    starToClick.dispatchEvent(new MouseEvent('click'));
    await element.updateComplete;

    expect(inputHandler).toHaveBeenCalled();
    expect(changeHandler).toHaveBeenCalled();
  });
});
