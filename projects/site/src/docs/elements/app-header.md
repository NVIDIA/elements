---
{
  title: 'App Header',
  layout: 'docs.11ty.js',
  tag: 'nve-app-header'
}
---

## Installation

<nve-alert status="accent">Recommend: use <a href="./docs/elements/page-header/">nve-page-header</a> for a similar but more flexible API</nve-alert>

```typescript
import '@nvidia-elements/core/app-header/define.js';
```

```html
<nve-app-header>
  <nve-logo></nve-logo>
  <h2 slot="title">Workflows</h2>
  <nve-button slot="nav-items" selected>Link 1</nve-button>
  <nve-button slot="nav-items">Link 2</nve-button>
  <nve-icon-button icon-name="chat-bubble" slot="nav-actions"></nve-icon-button>
  <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
  <nve-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</nve-icon-button>
</nve-app-header>
```

## Standard

{% story 'nve-app-header', 'Default' %}

## App Branding

{% api 'nve-app-header', 'slot', '' %}

{% story 'nve-app-header', 'AppBadge' %}

## Nav Items

{% api 'nve-app-header', 'slot', 'nav-items' %}

{% story 'nve-app-header', 'NavItems' %}

## Nav Actions

{% api 'nve-app-header', 'slot', 'nav-actions' %}

{% story 'nve-app-header', 'NavActions' %}

## Dropdown

{% story 'nve-app-header', 'Dropdown' %}
