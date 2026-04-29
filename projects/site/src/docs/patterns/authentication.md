---
{
  title: 'Authentication Patterns',
  description: 'Authentication patterns built with NVIDIA Elements: sign-in flows, session expiry handling, and identity provider integration.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Login Form

{% example '@internals/patterns/authentication.examples.json' 'LoginForm' %}

## No Access

{% example '@internals/patterns/authentication.examples.json' 'NoAccess' %}

## Login Page

{% example '@internals/patterns/authentication.examples.json' 'LoginPage' '{ "inline": false, "height": "600px" }' %}
