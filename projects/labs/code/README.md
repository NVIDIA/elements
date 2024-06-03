# @nvidia-elements/code

[Built with Vite](https://vitejs.dev/)

To create reusable UI components that build on top of Elements we recommend using [lit.dev](https://lit.dev) for authoring highly reusable custom elements (Web Components). This path enables your extensions to work in a large variety of frameworks and environments. We recommend reading the [publishing and best practices](https://lit.dev/docs/tools/publishing/) provided by the lit team. The rest of this guide will focus on how to integrate specifically for Element integration and best practices.

## Getting Started

```shell
pnpm i

pnpm run dev
```

## Tasks

| Command          | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `pnpm run build` | Build library source                                   |
| `pnpm run test`  | Run library tests                                      |
| `pnpm run ci`    | Build and run all library CI requirements (build/test) |
