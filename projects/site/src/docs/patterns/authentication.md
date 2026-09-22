---
{
  title: 'Authentication Patterns',
  description: 'Build authentication flows with NVIDIA Elements, including sign-in forms, access-denied states, session expiry, and secure identity provider integration.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Login Form

{% example '@nvidia-elements/core/forms/validation.examples.json' 'LoginForm' %}

## No Access

{% example '@internals/patterns/authentication.examples.json' 'NoAccess' %}

## Login Page

{% example '@internals/patterns/templates.examples.json' 'Auth' %}
