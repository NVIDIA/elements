---
{
  title: 'Scene Mesh',
  description: 'Indexed custom mesh geometry for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-mesh'
}
---

## Installation

{% install 'nve-scene-mesh' %}

## Buffer source

{% example 'nve-scene-mesh' 'BufferSource' %}

## Load a file

{% api 'nve-scene-mesh' 'property' 'src' %}

{% example 'nve-scene-body' 'LoadGeometry' %}

## Replace complete geometry

{% api 'nve-scene-mesh' 'property' 'geometry' %}

```js
const positions = new Float32Array([
  0, 0, 0,
  2, 0, 0,
  0, 2, 0,
  2, 2, 0
]);
const indices = new Uint32Array([0, 1, 2, 1, 3, 2]);

mesh.geometry = { indices, positions };
```

## Publish reused arrays

{% api 'nve-scene-mesh' 'method' 'publishGeometry' %}

```js
positions[8] = 0.75;
mesh.publishGeometry({ attribute: 'positions', start: 2, count: 1 });
```

{% example 'nve-scene-mesh' 'GeometryUpdates' %}

## Capture a texture

{% api 'nve-scene-mesh' 'method' 'setTexture' %}

```js
const input = await createImageBitmap(image);
try {
  const result = await mesh.setTexture(input);
  if (result.status === 'failed') {
    await mesh.setTexture(null);
  }
} finally {
  input.close();
}
```

{% example 'nve-scene-mesh' 'TextureCapture' %}
