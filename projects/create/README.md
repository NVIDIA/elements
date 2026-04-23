# @nvidia-elements/create

Create new Elements projects using `npm create @nvidia-elements`.

## npm Usage

```bash
# Interactive project creation
npm create @nvidia-elements

# Create a React project
npm create @nvidia-elements react

# Create a Angular project
npm create @nvidia-elements angular

# Create a Vue project
npm create @nvidia-elements vue
```

### pnpm Usage

```bash
# Interactive project creation
pnpm create @nvidia-elements

# Create a React project
pnpm create @nvidia-elements react

# Create a Angular project
pnpm create @nvidia-elements angular

# Create a Vue project
pnpm create @nvidia-elements vue
```

## How It Works

This package is a thin wrapper that delegates to `@nvidia-elements/cli` for project scaffolding. It automatically detects your package manager:

- **npm**: Uses `npm exec --package=@nvidia-elements/cli@latest -y -- nve project.create --type=react`
- **pnpm**: Uses `pnpm dlx @nvidia-elements/cli project.create -- nve project.create --type=react`

## Available Project Types

Run the command with any supported starter template type. For a full list of available templates, see the [@nvidia-elements/cli documentation](https://NVIDIA.github.io/elements/).

## Resources

- https://docs.npmjs.com/cli/v9/commands/npm-init
- https://pnpm.io/cli/create
- https://yarnpkg.com/cli/init