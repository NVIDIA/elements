---
{
  title: 'Animation',
  description: 'Animation tokens and motion primitives in NVIDIA Elements: durations, easing curves, reduced-motion support, and how to compose transitions.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Animation tokens provide basic timings for animations and hook into theme support for reduced motion.

{% tokens 'ref-animation' %}

## Reduced Motion

{% example '@nvidia-elements/themes/index.examples.json' 'ReducedMotion' %}
