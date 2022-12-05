export function stopEvent(event: any) {
  event?.preventDefault();
  event?.stopPropagation();
}
