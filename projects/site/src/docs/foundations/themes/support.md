---
{
  title: 'Support',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Support colors combine with text or iconography to convey the status of an element or interaction. Status type components include `alerts`, `badges`, `tags` and `form control` messages.

- `default`
- `accent`
- `success`
- `warning`
- `danger`

## Icon Support

{% example '@nvidia-elements/core/icon/icon.examples.json' 'Statuses' %}

## Dot Support

{% example '@nvidia-elements/core/dot/dot.examples.json' 'SupportStatus' %}

## Badge Support

{% example '@nvidia-elements/core/badge/badge.examples.json' 'Support' %}

## Alert Support

{% example '@nvidia-elements/core/alert/alert.examples.json' 'SupportStatus' %}

## Alert Group

{% example '@nvidia-elements/core/alert/alert.examples.json' 'GroupStatus' %}

## Alert Group Banner

{% example '@nvidia-elements/core/alert/alert.examples.json' 'Prominence' %}

## Notification Snackbar

{% example '@nvidia-elements/core/notification/notification.examples.json' 'Status' '{ "inline": false, "height": "640px" }' %}

## Toasts

{% example '@nvidia-elements/core/toast/toast.examples.json' 'Status' '{ "inline": false, "height": "600px" }'  %}

## Support Tokens

Support tokens define supplementary colors and styles for the design system.

{% tokens 'sys-support' %}

## Accent Tokens

{% tokens 'sys-accent' %}
