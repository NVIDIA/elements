---
{
  title: 'Scene Model',
  description: 'An entity frame grouping scoped bodies and joints.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-model'
}
---

## Installation

{% install 'nve-scene-model' %}

A model is the whole entity: [bodies](../body/) connected by [joints](../joint/). It extends a [frame](../frame/)
with a name scope, the `joints` view, and `tint`. Pose, visibility, and lifecycle retain frame behavior.
A base model has no `src` and never loads files. Bodies keep their feature IDs and picking behavior.

## Name scopes

Members use names local to their nearest model. Unqualified `frame` and `mimic` references search that scope,
then outer models and the scene. Separate models can use identical internal names. `/` separates qualified
names, such as a camera's `frame="armB/tcp"`; bare names cannot contain `/`.
Nested models extend the path, for example `cell/arm/tcp`. Document order does not affect resolution.
An unnamed model works internally. An outside qualified reference to its member requires a model name,
otherwise Scene reports `model-name` and suppresses that chain until corrected.

## Drive joints

`model.joints` is a read-only live view of this scope, excluding nested models. `get(name)` returns a joint;
`set(name, value)` assigns its synchronous value. `has`, `names`, and `values` inspect current membership;
`values` returns a plain object. `reset` sets every non-mimic joint to zero.
An unknown name through `get` or `set` reports `model-joint` and invalidates this entity chain until a valid
access or reset corrects the input.

Model `tint` defaults to white and multiplies into each body's own tint. Nested model tints compose in the
existing linear-light color pipeline without recapturing geometry.

{% example 'nve-scene-model' 'IndependentArms' %}
