
export function onKeys(events: string[], event: KeyboardEvent, fn: () => any) {
  if (events.find(e => e === event.code)) {
    fn();
  }
}
