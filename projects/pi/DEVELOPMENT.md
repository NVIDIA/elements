# Development

| Command                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `pnpm run build`         | Build the extension, skill, and workflow prompts |
| `pnpm run lint`          | Lint source and build scripts                    |
| `pnpm run test`          | Run unit and package contract tests              |
| `pnpm run test:coverage` | Run unit tests with coverage                     |
| `pnpm run ci`            | Run the complete project CI pipeline             |

Test the built package in Pi:

```shell
mise exec -- pi -e .

mise exec -- pi -e . --tools elements_api_list -p 'Call elements_api_list and report the available component names.'

mise exec -- pi -e . --no-elements-auto-validate
```
