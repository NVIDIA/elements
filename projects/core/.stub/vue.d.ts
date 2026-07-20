/** Minimal Vue surface required to validate generated declaration types. */
declare module 'vue' {
  export type DefineComponent<Props> = new () => { $props: Props };
}
