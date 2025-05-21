---
{
  title: 'Card',
  layout: 'docs.11ty.js',
  tag: 'nve-card',
  associatedElements: ['nve-card-header', 'nve-card-content', 'nve-card-footer']
}
---

## Installation

{% install 'nve-card' %}

## Standard

Combining `card-header`, `card-content` & `card-footer` will yield a fully styled card. Note how `card-content` will vertically stretch to fill the card size and the footer will align to the bottom of the card.

{% story 'nve-card', 'Default' %}

## Media Card

{% story 'nve-card', 'MediaCard' %}

## Card with Header Tabs

{% story 'nve-card', 'Tabs' %}

## Card Description List

{% story 'nve-card', 'DescriptionList' %}

## Multiple Content Containers and Full-bleed Divider

{% story 'nve-card', 'CardWithMultipleContentsAndDivider' %}

## Content Layout

Layout system is supported when `nve-layout` attribute is used on the `card-content` element:

{% story 'nve-card', 'CardWithContentLayout' %}

## Container Fill

{% story 'nve-card', 'ContainerFill' %}
