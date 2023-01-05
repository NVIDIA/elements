import { beforeEach, describe, expect, it } from 'vitest';
import { untilEvent } from '@elements/elements/test';
import { GlobalStateService } from './global.service.js';

describe('GlobalStateService', () => {
  beforeEach(() => {
    window.MLV_ELEMENTS.state.versions = ['PACKAGE_VERSION'];
    window.MLV_ELEMENTS.state.elementRegistry = { };
  });

  it('should provide an intial state object', () => {
    expect(GlobalStateService.state).toStrictEqual({
      versions: ['PACKAGE_VERSION'],
      elementRegistry: { },
      i18nRegistry: { },
      iconRegistry: { }
    });
  });

  it('should merge state updates', async () => {
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '1.0.0' } });
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { two: '2.0.0' } });

    expect(GlobalStateService.state).toStrictEqual({
      versions: ['PACKAGE_VERSION'],
      elementRegistry: {
        one: '1.0.0',
        two: '2.0.0'
      },
      i18nRegistry: { },
      iconRegistry: { }
    });
  });

  it('should dispatch an event when the state is updated', async () => {
    const event = untilEvent(document, 'TEST_EVENT');
    GlobalStateService.dispatch('TEST_EVENT', { elementRegistry: { one: '0.0.0' } });
    await event;

    expect((await event).detail).toStrictEqual({
      versions: ['PACKAGE_VERSION'],
      elementRegistry: {
        one: '0.0.0'
      },
      i18nRegistry: { },
      iconRegistry: { }
    });
  });
});
