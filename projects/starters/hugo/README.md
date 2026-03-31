# Hugo + Elements Starter

This starter shows a minimal example of a Hugo static site generator using Elements. Hugo is using its templating system with static JS/CSS bundles provided by the Elements package.

## Getting Started

Ensure [Hugo](https://gohugo.io/) are installed in your development environment.

```bash
# run dev server locally
hugo server

# build site
hugo
```

## Advance Usage

This demo demonstrates a minimal Hugo static site with Elements integration using static bundles. The tradeoff with this approach is it requires less build tooling but at the cost of performance due to loading the entire package rather than optimized/tree-shaken builds. For more advanced usage with TypeScript or to have better production performance, consider using tools like [Vite](https://vite.dev/) alongside Hugo. Explore the TypeScript starter for a example resource of how to get started.

## Documentation

For more information on using Elements with Hugo, see:
- [Elements Documentation](https://NVIDIA.github.io/elements/)
- [Hugo Documentation](https://gohugo.io/documentation/)
- [Hugo Integration Guide](https://NVIDIA.github.io/elements/docs/integrations/hugo/)
