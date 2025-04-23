---
{
  title: 'Page Header',
  layout: 'docs.11ty.js',
  tag: 'nve-page-header'
}
---

## Installation

```typescript
import '@nvidia-elements/core/page-header/define.js';
```

```html
<nve-page-header>
  <nve-logo slot="prefix"></nve-logo>
  <h2 slot="prefix">Workflows</h2>
  <nve-button selected><a href="#">Link 1</a></nve-button>
  <nve-button><a href="#">Link 2</a></nve-button>
  <nve-icon-button icon-name="chat-bubble" slot="suffix"></nve-icon-button>
  <nve-icon-button icon-name="switch-apps" slot="suffix"></nve-icon-button>
  <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
</nve-page-header>
```

## Standard

{% story 'nve-page-header', 'Default' %}

## App Logo

{% api 'nve-page-header', 'story', 'AppLogo' %}

{% story 'nve-page-header', 'AppLogo' %}

## Menu Button

{% api 'nve-page-header', 'story', 'MenuButton' %}

{% story 'nve-page-header', 'MenuButton' %}

## Dropdown Menu

{% api 'nve-page-header', 'story', 'DropdownMenu' %}

{% story 'nve-page-header', 'DropdownMenu' %}

## Search

{% api 'nve-page-header', 'story', 'Search' %}

{% story 'nve-page-header', 'Search' %}

## Prefix Navigation

{% story 'nve-page-header', 'PrefixNavigation' %}

## Center Navigation

{% story 'nve-page-header', 'CenterNavigation' %}

## Suffix Navigation

{% story 'nve-page-header', 'SuffixNavigation' %}

## User Detail

{% story 'nve-page-header', 'UserDetail' %}
