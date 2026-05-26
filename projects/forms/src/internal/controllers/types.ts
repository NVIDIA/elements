export interface ReactiveController {
  hostConnected?(): void;
  hostDisconnected?(): void;
  hostUpdated?(): void;
}

export interface ReactiveElement extends HTMLElement {
  addController(controller: ReactiveController): void;
}
