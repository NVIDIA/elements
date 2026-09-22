---
{
  title: 'Scene Labels',
  description: 'High-performance vector text labels positioned in Scene geometry.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-labels'
}
---

## Installation

{% install 'nve-scene-labels' %}

## Packed labels

Use `LabelBuffer` to store each label's text, position, scale, and color. Assign the buffer to the label layer's `source` property. Update record handles and call `publish()` to copy only the changed numeric records into the render snapshot.

The `scale-unit` attribute controls how Scene interprets every record's scale. The default `pixel` value keeps text at a stable CSS-pixel height as the camera moves. Use `world` to size labels in scene units.

Scene renders labels as depth-tested signed-distance-field glyphs. The built-in atlas supports printable ASCII and displays a replacement glyph for unsupported characters. Label records are visual annotations; they don't create one DOM or keyboard target per record. Provide an accessible name and fallback content on the owning scene when the labels convey required information.

Set `interactive` and, optionally, `featureIds` on the layer to enable glyph-aware pointer picking. Transparent pixels around and inside glyphs don't produce hits.
