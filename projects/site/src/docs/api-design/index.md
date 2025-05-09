---
{
  title: 'API Design Guidelines',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## What this document is

This document outlines the API best practices and guidelines for creating highly reusable UI components/elements that work in any framework or library. The best practices defined here are tailored to low level leaf components and may not be applicable to all use cases of an application or plugin.

## What this document is not

This document is not intended to define the best practices and API design of higher level UI components used at the micro-frontend/plugin/application level. While some of the recommendations and best practices outlined in this document are applicable, not all will apply outside of the reusable UI element library use case.

## Legend

<div nve-layout="column gap:xs">
  <nve-alert status="success">Do: a best practice to follow</nve-alert>
  <nve-alert status="danger">Don't: a practice to avoid</nve-alert>
  <nve-alert status="accent">Tip: helpful details on rationale for a given guideline</nve-alert>
  <nve-alert status="warning">details on the risks of not following a guideline</nve-alert>
  <nve-alert><nve-icon slot="icon">🏁</nve-icon> Performance: detail about how a guideline impacts performance</nve-alert>
  <nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn: resource to learn more about a guideline topic</nve-alert>
  <nve-alert><nve-icon slot="icon">🚧</nve-icon> WIP: details on any work in progress guidance</nve-alert>
</div>

## Terminology

- Element: a web component defined within the public API of the library
- Component: higher level UI web/framework components in plugins/apps
- Pattern: combination of elements to create a UI rather creating new additional elements
- Pattern Library: packaged library of patterns/behaviors composed of low level elements
- Plugin/Application: code that consumes or uses the elements
- Consumers: developers/designers that use the UI elements within their products

## Philosophy

Web standards over frameworks

- Stateless over Stateful
- Composable Patterns over Custom Features
- Common Design Language for developers and designers
- Internationalizable by default
- Accessible by default
- Automated conventions and best practices

Consistent element APIs provide consistent developer experience. The recommendations in this document provide a path of optimal compatibility with other framework integrations, including

- routing/linking
- native form controls / validation
- key navigation
- property/event binding/content projection
- i18n/a11y

```html
<!-- HTML/JavaScript -->
<nve-alert status="success">
  <p>hello there!</p>
</nve-alert>

<script type="module">
  import '@nvidia-elements/core/include/alert.js';
  const alert = document.querySelector('nve-alert');
  alert.closable = true;
  alert.addEventListener('close', (e) => console.log(e))
</script>

<!-- Angular -->
<nve-alert status="success" [closable]="boolProp" (close)="handle($event)">
  <p>hello there!</p>
</nve-alert>

<!-- Lit -->
<nve-alert status="success" ?closable=${boolProp} @close=${e => this.handle(e)}>
  <p>hello there!</p>
</nve-alert>

<!-- Vue -->
<nve-alert status="success" :closable="boolProp" @close="handle">
  <p>hello there!</p>
</nve-alert>

<!-- React/Preact -->
<nve-alert status="success" closable={this.state.boolProp} onClose={this.handle}>
  <p>hello there!</p>
</nve-alert>
```

<nve-alert status="accent">
  See example of how a Web Component based design system can be used by <a href="https://NVIDIA.github.io/elements/starters/">many frameworks</a>.
</nve-alert>
