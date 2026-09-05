declare module 'vue' {
  export type DefineComponent<Props = Record<string, never>> = new () => { $props: Props };
}
