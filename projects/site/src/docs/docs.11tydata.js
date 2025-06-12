import { PlaygroundService } from '@internals/metadata';

const playgroundService = new PlaygroundService();
const playgroundURL = await playgroundService.getPlaygroundURL({
  html: '<nve-alert status="success">Elements</nve-alert>'
});
const reactPlaygroundURL = await playgroundService.getReactPlaygroundURL({
  html: '<nve-alert status="success">Elements + React</nve-alert>'
});
const angularPlaygroundURL = await playgroundService.getAngularPlaygroundURL({
  html: '<nve-alert status="success">Elements + Angular</nve-alert>'
});
const litPlaygroundURL = await playgroundService.getLitPlaygroundURL({
  html: '<nve-alert status="success">Elements + Lit</nve-alert>'
});

export default function () {
  return {
    playground: {
      playgroundURL,
      reactPlaygroundURL,
      angularPlaygroundURL,
      litPlaygroundURL
    }
  };
}
