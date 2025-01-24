import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { keyNavigationGrid } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable, emulateClick } from '@nvidia-elements/testing';

@keyNavigationGrid<GridKeyNavigationControllerTestElement>()
@customElement('grid-key-navigation-controller-test-element')
class GridKeyNavigationControllerTestElement extends LitElement {
  get keynavGridConfig() {
    return {
      grid: this.shadowRoot.querySelector<HTMLElement>('section'),
      rows: this.shadowRoot.querySelectorAll<HTMLElement>('section > div'),
      cells: this.shadowRoot.querySelectorAll<HTMLElement>('section > div > *')
    };
  }

  render() {
    return html`
      <section>
        <div>
          <button>0</button>
          <button>1</button>
          <button>2</button>
        </div>
        <div>
          <button>3</button>
          <button>4</button>
          <button>5</button>
        </div>
        <div>
          <button>6</button>
          <button>7</button>
          <button>8</button>
        </div>
        <div>
          <button>9</button>
          <button>10</button>
          <button>11</button>
        </div>
        <div>
          <button>12</button>
          <button>13</button>
          <button>14</button>
        </div>
        <div>
          <div>15 <input /></div>
          <div><button>16</button></div>
          <div><button>17-1</button><button>17-2</button></div>
        </div>
      </section>
    `;
  }
}

describe('grid-key-navigation.controller', () => {
  let element: GridKeyNavigationControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<grid-key-navigation-controller-test-element></grid-key-navigation-controller-test-element>`
    );
    element = fixture.querySelector<GridKeyNavigationControllerTestElement>(
      'grid-key-navigation-controller-test-element'
    );
    element.keynavGridConfig.cells[0].focus();
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should set tabindex -1 on grid cells and 0 for the first cell', async () => {
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
  });

  it('should set activate a cell on left click', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.cells[2].dispatchEvent(new MouseEvent('mouseup', { bubbles: true, buttons: 1 }));
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[2].tabIndex).toBe(0);
  });

  it('should support arrow key navigation', async () => {
    element.keynavGridConfig.cells[0].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true })
    );
    element.keynavGridConfig.cells[1].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true })
    );
    await elementIsStable(element);

    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[2].tabIndex).toBe(0);

    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    await elementIsStable(element);

    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[2].tabIndex).toBe(-1);

    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' }));
    await elementIsStable(element);

    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[3].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[6].tabIndex).toBe(0);

    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
    await elementIsStable(element);

    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[3].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[6].tabIndex).toBe(-1);
  });

  it('should support key navigation shortcuts from wcag spec', async () => {
    // last in row
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'End' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[2].tabIndex).toBe(0);

    // first in row
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'Home' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[2].tabIndex).toBe(-1);

    // last cell in grid
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[17].tabIndex).toBe(0);

    // first cell in grid
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Home', ctrlKey: true, metaKey: true })
    );
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[17].tabIndex).toBe(-1);

    // page down (every 5th cell)
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageDown' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[12].tabIndex).toBe(0);

    // page up (every 5th cell)
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageUp' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[12].tabIndex).toBe(-1);
  });

  it('should not page beyond index when using page up or page down', async () => {
    // limit reached should focus first available cell
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageUp' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageUp' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageUp' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[12].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(-1);

    // limit reached should focus last available cell
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageDown' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageDown' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'PageDown' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[12].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(0);
  });

  it('should invert directions when in RTL mode', async () => {
    await elementIsStable(element);
    element.dir = 'rtl';

    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[2].tabIndex).toBe(0);

    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
    expect(element.keynavGridConfig.cells[2].tabIndex).toBe(-1);
  });

  // https://w3c.github.io/aria-practices/#gridNav_focus
  it('should retain focus on grid cell if more than one interactive item is within cell', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[17].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[17]);
    expect(element.shadowRoot.activeElement).not.toEqual(
      element.keynavGridConfig.cells[17].querySelectorAll('button')[0]
    );
    expect(element.shadowRoot.activeElement).not.toEqual(
      element.keynavGridConfig.cells[17].querySelectorAll('button')[1]
    );
  });

  it('should allow inner interactive elements to be access in the tabflow when cell is active', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[17].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[17]);
    expect(element.shadowRoot.activeElement).not.toEqual(
      element.keynavGridConfig.cells[17].querySelectorAll('button')[0]
    );
    expect(element.shadowRoot.activeElement).not.toEqual(
      element.keynavGridConfig.cells[17].querySelectorAll('button')[1]
    );

    element.keynavGridConfig.cells[17].querySelectorAll('button')[0].focus();
    await elementIsStable(element);
    expect(element.shadowRoot.activeElement).not.toEqual(element.keynavGridConfig.cells[17]);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[17].querySelectorAll('button')[0]);
    expect(element.shadowRoot.activeElement).not.toEqual(
      element.keynavGridConfig.cells[17].querySelectorAll('button')[1]
    );
  });

  it('should focus internactive item within cell if only interactive item within cell', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    await elementIsStable(element);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[16].querySelectorAll('button')[0]);
  });

  it('should retain focus on grid cell if interactive item a complex type (uses key navigation)', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[15]);
    expect(element.shadowRoot.activeElement).not.toEqual(
      element.keynavGridConfig.cells[15].querySelectorAll('input')[0]
    );
  });

  it('should allow complex types to be activated via `enter` key', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    element.keynavGridConfig.cells[15].dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }));

    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[15].querySelectorAll('input')[0]);
  });

  it('should allow refocus to cell from cell interactions when pressing key `escape`', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    element.keynavGridConfig.cells[15].dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }));
    await elementIsStable(element);

    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[15].querySelectorAll('input')[0]);

    element.keynavGridConfig.cells[15].dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape', bubbles: true }));
    await elementIsStable(element);

    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[15]);
  });

  it('should ignore any key navigation inputs when a interactive element is active within a cell', async () => {
    await elementIsStable(element);
    element.keynavGridConfig.grid.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'End', ctrlKey: true, metaKey: true })
    );
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    element.keynavGridConfig.grid.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }));
    element.keynavGridConfig.cells[15].dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }));

    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[15].querySelectorAll('input')[0]);

    element.keynavGridConfig.cells[15].dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true })
    );
    await elementIsStable(element);
    expect(element.keynavGridConfig.cells[15].tabIndex).toBe(0);
    expect(element.shadowRoot.activeElement).toEqual(element.keynavGridConfig.cells[15].querySelectorAll('input')[0]);
  });

  it('should allow focus on complex input types if clicked', async () => {
    await elementIsStable(element);
    const input = element.keynavGridConfig.cells[15].querySelector('input');
    expect(input.matches(':focus')).toBe(false);
    input.focus();
    emulateClick(input);
    await elementIsStable(element);
    expect(input.matches(':focus')).toBe(true);
  });

  it('should allow focus on simple focus type if clicked', async () => {
    await elementIsStable(element);
    const button = element.keynavGridConfig.cells[16].querySelector('button');
    expect(button.matches(':focus')).toBe(false);
    button.focus();
    emulateClick(button);
    await elementIsStable(element);
    expect(button.matches(':focus')).toBe(true);
  });

  it('should allow focus on simple focus type if clicked in cell with multiple focus targets', async () => {
    await elementIsStable(element);
    const button = element.keynavGridConfig.cells[17].querySelectorAll('button')[1];
    expect(button.matches(':focus')).toBe(false);
    button.focus();
    emulateClick(button);
    await elementIsStable(element);
    expect(button.matches(':focus')).toBe(true);
  });
});
