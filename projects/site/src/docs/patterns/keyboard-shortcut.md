---
{
  title: 'Keyboard Shortcut Patterns',
  description: 'Keyboard shortcut patterns built with NVIDIA Elements: visible cues, conflict-free combinations, and accessibility considerations.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Use `nve-text="code"` on a `<kbd>` element for displaying keyboard shortcut codes.

## Standard Styling

{% example '@internals/patterns/keyboard-shortcuts.examples.json', 'ShortcutFilled' %}

## Flat Styling

{% example '@internals/patterns/keyboard-shortcuts.examples.json', 'ShortcutFlat' %}

## Keyboard Shortcut in Dropdown

{% example '@internals/patterns/keyboard-shortcuts.examples.json', 'ShortcutDropdown' %}
