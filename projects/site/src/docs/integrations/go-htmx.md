---
{
  title: 'HTMX + Go',
  description: 'Use NVIDIA Elements with HTMX and Go: render full pages and fragment responses from Go templates.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'go-htmx' %}

{% installation 'go-htmx' %}

The HTMX + Go starter extends the Go starter with one server-rendered fragment endpoint for HTMX swaps.

The starter uses the pre-built Elements CSS and JavaScript bundles. It loads HTMX in the base HTML page and renders `/` as the full page. The `/fragment/time` endpoint serves a fragment response that returns only the refresh button's swap target.

Use this path when you want Go templates to own rendering while HTMX updates small regions of the page without adding a JavaScript build step.

For upstream framework details, see the [Go documentation](https://go.dev/doc/) and [HTMX documentation](https://htmx.org/docs/).

## Registry Usage Guidelines

{% artifactory-usage %}
