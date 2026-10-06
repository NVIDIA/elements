# Developing the Site

Run these commands from `projects/site` with `mise exec --`.

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `pnpm run ci`              | Run lint, build, tests, and type checks         |
| `pnpm run dev`             | Build dependencies and serve the site           |
| `pnpm run dev:fast`        | Serve the site using existing dependency builds |
| `pnpm run build`           | Build the production site                       |
| `pnpm run preview`         | Build and preview the production site           |
| `pnpm run lint`            | Run ESLint and Stylelint                        |
| `pnpm run lint:fix`        | Fix lint issues                                 |
| `pnpm run test`            | Run browser and Node.js tests                   |
| `pnpm run test:browser`    | Run browser tests                               |
| `pnpm run test:node`       | Run Node.js tests                               |
| `pnpm run test:types`      | Check source and test types with TypeScript 7   |
| `pnpm run test:lighthouse` | Run Lighthouse tests                            |
