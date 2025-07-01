---
{
  title: 'TypeScript',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'typescript' %}

{% installation %}

## Integration

Once installation is complete Elements can be imported and used within [TypeScript](https://www.typescriptlang.org/) files. The Element class definitions can be imported via [type imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) to use for static type checking.

```typescript
import '@nvidia-elements/core/alert/define.js'; // import and register element to DOM
import type { Alert } from '@nvidia-elements/core/alert'; // import type definition

// type can now be used for static type checking in interfaces and for generic type arguments
const alert = document.querySelector<Alert>('nve-alert');

// set JavaScript properties
alert.closable = true;
alert.status = 'success';

// set HTML attributes
alert.setAttribute('closable', '');
alert.setAttribute('status', 'success');

// create event listeners
alert!.addEventListener('close', e => console.log(e.target));
```

## Advanced Installation

If you are not on typescript >= version `4.5.x` you will need to add this type declaration to use isolated element imports:

```typescript
/* ./src/declarations.d.ts */

interface ElementInternals {
  any: any;
}
```

If you are using [tsconfig path mapping](https://www.typescriptlang.org/tsconfig#paths) likely you will need to enable the [skipLibCheck](https://www.typescriptlang.org/tsconfig#skipLibCheck) to avoid type definition collisions within the monorepo. Alternatively, to avoid `skipLibCheck` use `npm` workspaces instead of tsconfig path mapping.

```typescript
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```
