---
{
  title: 'Visualization',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The visualization design tokens provide a consistent color palette for theming data visualization UI tools and libraries. Elements does not support data visualizations as part of the core library, but does provide a set of tokens that you can use to theme data visualization libraries.

## Usage

You can consume tokens via CSS Custom Properties, but data visualization libraries often use JavaScript based APIs for theming. To make it easier to theme these libraries, a utility function converts the active theme tokens to a JavaScript object.

```typescript
import { getThemeTokens } from '@nvidia-elements/core';

const tokens = getThemeTokens();

// output
{
  "--nve-ref-color-brand-green-100": "#121807"
  "--nve-ref-border-radius-lg": "16px"
  "--nve-ref-font-size-200": "14px"
  ...
}
```

## ChartJS

Below is a simple demo of a visualization library (ChartJS) consuming the tokens and rendering the visualization to a HTML canvas.

<visualization-demo></visualization-demo>

```typescript
import { getThemeTokens } from '@nvidia-elements/core';
import Chart from 'chart.js/auto';

const tokens = getThemeTokens();
new Chart(document.querySelector('canvas'), {
  type: 'line',
  options: { ... },
  data: {
    labels: [...],
    datasets: [
      {
        label: 'grass',
        data: [...],
        backgroundColor: tokens['--nve-sys-visualization-categorical-grass'],
        borderColor: tokens['--nve-sys-visualization-categorical-grass'],
      }
    ]
  }
});
```

## Heatmap

{% example '@internals/patterns/heatmap.examples.json' 'ModulePassRate', '{ "inline": false, "height": "600px" }' %}

## Categorical

The categorical tokens apply to visualizations that represent distinct categories or groups. These values are useful when the data has distinct groups but no natural numerical order.

{% tokens 'sys-visualization-categorical' %}

## Sequential Diverging Virdis

The diverging tokens apply to visualizations that represent two opposing values or groups of data. This can be useful for data with a natural center and the goal is to highlight the differences or deviations from the center.

{% tokens 'sys-visualization-sequential-diverging-virdis' %}

## Sequential Diverging Red Green

{% tokens 'sys-visualization-sequential-diverging-red-green' %}

## Trend

{% tokens 'sys-visualization-trend' %}

<script type="module" src="/_internal/stories/visualization/visualization-demo.js"></script>
