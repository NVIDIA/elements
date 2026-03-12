---
name: repo-api-design
description: Component API design patterns following Elements conventions for properties, attributes, CSS custom properties, slots, and events. Use this skill whenever the user is designing or deciding on a component API, choosing between properties vs attributes vs slots, naming CSS custom properties, designing events, avoiding impossible states, deciding whether to reflect to an attribute, using CSS Parts, implementing the DataElement interface, or applying the internal-host pattern. Also trigger when the user asks about shorthand vs granular CSS properties or event naming conventions.
---

# API Design

You MUST review the relevant API design guidelines before designing or modifying component APIs.

## When to Use This Skill

- Designing properties and attributes for new components
- Creating CSS custom properties for theming
- Avoiding impossible states in component APIs
- Choosing between properties, attributes, and slots
- Designing custom events
- Planning component composition patterns
- Setting up package exports and dependencies

## Stateless Components

When creating new components or features that may contain user state review the [Stateless Components Guidelines](/projects/site/src/docs/api-design/stateless.md).

## Properties vs Attributes

When working with JavaScript properties and HTML attributes review the [Properties & Attributes Guidelines](/projects/site/src/docs/api-design/properties-attributes.md).

## Styles & CSS Custom Properties

When working with CSS, CSS Custom Properties or Design Tokens review the [Styles & CSS Custom Properties Guidelines](/projects/site/src/docs/api-design/styles.md).

## Component Composition

When creating a new API or determining API design of parent child relationships between components review the [Component Composition Guidelines](/projects/site/src/docs/api-design/composition.md).

## Slots

When working with user provided content or container-like components review the [Slots Guidelines](/projects/site/src/docs/api-design/slots.md).

## Custom Events

When creating new events or listening to existing event review the [Custom Events Guidelines](/projects/site/src/docs/api-design/custom-events.md).

## Component Registration

When creating new components or using components as dependencies review the [Component Registration Guidelines](/projects/site/src/docs/api-design/registration.md).

## Packaging & Exports

When creating a new component or package review the [Packaging & Exports Guidelines](/projects/site/src/docs/api-design/packaging.md).
