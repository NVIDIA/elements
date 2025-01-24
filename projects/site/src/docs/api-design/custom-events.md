---
{
  title: 'Custom Events',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Events are used to communicate user intent to the host application. Examples include, `close`, or `change`. Events should be **stateless** only relaying user interaction and avoid changing the state of the element.

```html
<nve-alert closable></nve-alert>

<script type="module">
  const alert = document.querySelector('nve-alert');
  alert.addEventListenter('close', event => console.log(event));
</script>
```

## Compatibility

Events should not include verb/action style prefixing such as on or trigger. Many frameworks de-sugar event handlers to prefix with keywords like on. Example React `onClose={this.close}`

<nve-alert status="warning">Warning: use lowercase kebab events as some frameworks do not treat custom events as case sensitive. &nbsp;<a href="https://custom-elements-everywhere.com/">(read more)</a></nve-alert>

<nve-alert status="warning">Warning: avoid overloading existing default native custom events to avoid breaking user expectations on event behavior &nbsp;<a href="https://github.com/vmware-clarity/core/blob/main/projects/core/build/eslint-rules/reserved-event-names.js">(read more)</a></nve-alert>
