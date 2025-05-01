---
{
  title: 'Keyboard Shortcut Patterns',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Use `nve-text="code"` on a `<kbd>` element for displaying keyboard shourtcut codes.

## Standard Styling

{% story '@internals/patterns/patterns.stories.json', 'ShortcutFilled' %}

## Flat Styling

{% story '@internals/patterns/patterns.stories.json', 'ShortcutFlat' %}

## Keyboard Shortcut in Dropdown

{% story '@internals/patterns/patterns.stories.json', 'ShortcutDropdown' %}
