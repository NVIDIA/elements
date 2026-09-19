# API reference

Sphinx domains turn API-style content into linkable, searchable documentation. The declarations below are documentation examples and do not require a Python package.

:::{py:class} Pipeline(name, replicas=1)

Represents a deployable AI workload.
:::

:::{py:attribute} Pipeline.name
:type: str

The display name for the pipeline.
:::

:::{py:method} Pipeline.scale(replicas)
:async:

Scale the pipeline to `replicas` workers.

:param int replicas: The desired worker count.
:returns: The updated pipeline.
:rtype: Pipeline
:::

:::{py:function} create_pipeline(name: str, replicas: int = 1) -> Pipeline

Create a new {py:class}`Pipeline`.

:param name: A unique pipeline name.
:param replicas: The initial worker count.
:returns: A configured pipeline.
:::

## Usage

```python
pipeline = create_pipeline("inference", replicas=3)
```

Return to the {ref}`configuration-example` in the authoring guide for the corresponding data model.
