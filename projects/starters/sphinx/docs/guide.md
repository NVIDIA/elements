# Authoring guide

MyST adds structured documentation features to familiar Markdown. This page demonstrates navigation, links, code, tables, and admonitions.

## Cross-references

Link to another page with {doc}`api`, to a heading with {ref}`configuration-example`, or to the sample {py:func}`create_pipeline` API.

(configuration-example)=

## Configuration example

Use fenced code blocks with a language identifier for syntax highlighting.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Pipeline:
    name: str
    replicas: int = 1
```

## Tables

| Setting    |      Default | Purpose                        |
| ---------- | -----------: | ------------------------------ |
| `replicas` |          `1` | Controls worker count.         |
| `region`   | `us-central` | Selects the deployment region. |
| `debug`    |      `false` | Enables verbose diagnostics.   |

## Admonitions

:::{tip}
Run the warning-enabled production command before publishing documentation.
:::

:::{warning}
Replace public CDN URLs with an approved internal asset host when NVIDIA network policy requires it.
:::

## Definition lists

Document tree
: The primary navigation generated from the root `toctree`.

Local table of contents
: Links generated from headings on the current page.
