---
{
  title: 'Forms',
  layout: 'docs.11ty.js'
}
---

# Forms

The forms utility library provides a base mixin to make it easy to create form associated custom elements. Form associated custom elements enable components to integrate and participate in form value state and validation. This creates a reliable and predictable API contract for components. This project is in the very early stages of exploration. [Project Source](https://github.com/NVIDIA/elements/-/tree/main/projects/labs/forms)

## Getting Started

```shell
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install
npm install @nvidia-elements/forms
```

## API

### Events

- `input` emitted when the value changes as a result of a user action
- `change` emitted when the user modifies and commits the element's value.
- `reset` emitted when the control state was reset to its initial value
- `invalid` emitted when the control is invalid

### Properties

- `value` contains component state
- `readonly` determine if component is in readonly/non-editable
- `disabled` determine if component is interactive
- `name` name associated to parent form
- `noValidate` getter to check if component is in a no validation state
- `form` getter to get a reference to component parent form
- `willValidate` determine if component will validate
- `validity` validity state of the component
- `validationMessage` current validation message of the component
- `valueAsString` stringified value of the component
- `valueAsNumber` parsed number value of the component
