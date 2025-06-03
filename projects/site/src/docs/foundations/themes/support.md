---
{
  title: 'Support',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Support colors are used in combination of text or iconography to convey status of an element or interation. Status type components inlcude `alerts`, `badges`, `tags` and `form control` messages.

- `default`
- `accent`
- `success`
- `warning`
- `danger`

## Icon Support

{% story '@nvidia-elements/core/icon/icon.stories.json', 'Statuses' %}

## Dot Support

{% story '@nvidia-elements/core/dot/dot.stories.json', 'SupportStatus' %}

## Badge Support

{% story '@nvidia-elements/core/badge/badge.stories.json', 'Support' %}

## Alert Support

{% story '@nvidia-elements/core/alert/alert.stories.json', 'Status' %}

## Alert Group

{% story '@nvidia-elements/core/alert/alert.stories.json', 'AlertGroupStatus' %}

## Alert Group Banner

{% story '@nvidia-elements/core/alert/alert.stories.json', 'Prominence' %}

## Notification Snackbar

{% story '@nvidia-elements/core/notification/notification.stories.json', 'Status', '{ "inline": false, "height": "640px" }' %}

## Toasts

{% story '@nvidia-elements/core/toast/toast.stories.json', 'Status', '{ "inline": false, "height": "600px" }'  %}

## Support Tokens

Support tokens define supplementary colors and styles for the design system.

{% tokens 'sys-support' %}

## Accent Tokens

{% tokens 'sys-accent' %}
