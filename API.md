# Meter and Meter Group API - @nvidia-elements/core/meter

**Status:** proposed

`nve-meter` represents a scalar measurement within a known range. It can render independently or as a segment within `nve-meter-group`.

`nve-meter-group` arranges meters into a shared segmented visualization. Each child remains an independently accessible meter.

## Standalone meter

```html
<nve-meter
  value="58"
  min="0"
  max="128"
  color="blue-cobalt"
  aria-label="Storage used"
  aria-valuetext="58 GB of 128 GB used">
</nve-meter>
```

## Segmented meter

```html
<p id="storage-label">Storage</p>

<nve-meter-group aria-labelledby="storage-label">
  <nve-meter
    value="16"
    min="0"
    max="128"
    color="blue-cobalt"
    aria-label="Apps"
    aria-valuetext="16 GB of 128 GB">
  </nve-meter>

  <nve-meter
    value="8"
    min="0"
    max="128"
    color="purple-violet"
    aria-label="Messages"
    aria-valuetext="8 GB of 128 GB">
  </nve-meter>

  <nve-meter
    value="24"
    min="0"
    max="128"
    color="teal-cyan"
    aria-label="Media"
    aria-valuetext="24 GB of 128 GB">
  </nve-meter>

  <nve-meter
    value="10"
    min="0"
    max="128"
    color="yellow-amber"
    aria-label="System"
    aria-valuetext="10 GB of 128 GB">
  </nve-meter>

  <nve-meter
    value="70"
    min="0"
    max="128"
    color="gray-slate"
    aria-label="Available"
    aria-valuetext="70 GB of 128 GB">
  </nve-meter>
</nve-meter-group>
```

## `nve-meter`

Represents one named measurement. Grouping changes its presentation while preserving its value, bounds, color, status, and accessible meaning.

### Properties and attributes

| Property | Attribute | Type                                             | Proposed default | Description                                                                                                |
| -------- | --------- | ------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `value`  | `value`   | `number`                                         | `0`              | Current measurement within the defined range.                                                              |
| `min`    | `min`     | `number`                                         | `0`              | Lower bound of the measurement.                                                                            |
| `max`    | `max`     | `number`                                         | `100`            | Upper bound of the measurement.                                                                            |
| `color`  | `color`   | Shared Elements `Color` type                     | Unset            | Palette variant used for the filled region. Reflects to the attribute, matching badge and tag conventions. |
| `status` | `status`  | `'accent' \| 'success' \| 'warning' \| 'danger'` | Unset            | Semantic visual treatment, matching progress bar status options. Reflects to the attribute.                |

Set properties through HTML or JavaScript:

```js
const meter = document.querySelector('nve-meter');

meter.value = 115;
meter.max = 128;
meter.status = 'warning';
```

### Effective values

Non-finite bounds resolve to their defaults: `min = 0` and `max = 100`. The effective maximum clamps up to the effective minimum. Non-finite values resolve to the effective minimum, and values clamp into the effective range. These calculations do not change consumer-provided properties. Rendering and accessible numeric values use the same effective values.

### Color

`color` uses the same named palette variants as Elements badges and tags.

- Standalone meters apply the color to their filled region.
- Grouped meters keep their individual colors.
- The group does not automatically assign or replace child colors.
- Legends can compose badges or tags using matching color values.
- Names and values communicate meaning independently of color.

### Status

`status` selects a semantic fill treatment.

| Value     | Intent                                |
| --------- | ------------------------------------- |
| `accent`  | Draw attention to the measurement.    |
| `success` | Show a positive or healthy condition. |
| `warning` | Show a condition requiring attention. |
| `danger`  | Show a critical condition.            |

```html
<nve-meter
  value="115"
  max="128"
  status="warning"
  aria-label="Storage used"
  aria-valuetext="115 GB of 128 GB used, storage nearly full">
</nve-meter>
```

The application sets status explicitly. The meter does not infer status from its value or bounds.

Grouped meters keep their individual statuses.

### Fill precedence

The fill treatment follows this order:

1. An explicit `--accent-color` CSS override.
2. An explicit `color` palette variant.
3. The `status` fill treatment.
4. The default `var(--nve-sys-interaction-color)`.

### Accessibility

Each meter exposes:

| Semantic               | Source                                              |
| ---------------------- | --------------------------------------------------- |
| `role="meter"`         | Provided by the component                           |
| `aria-valuenow`        | Current effective `value`                           |
| `aria-valuemin`        | Effective `min`                                     |
| `aria-valuemax`        | Effective `max`                                     |
| Accessible name        | Consumer-provided `aria-label` or `aria-labelledby` |
| Human-readable value   | Optional consumer-provided `aria-valuetext`         |
| Associated description | Optional consumer-provided `aria-describedby`       |

Accessible numeric values remain on the same scale as their bounds. A meter with a value of `58` and a maximum of `128` exposes `58 / 128`, keeping both on the same scale.

Setting `status` does not change the accessible role to `status`, introduce live announcements, or automatically generate accessible status text. Consumers communicate meaningful conditions through visible text, `aria-valuetext`, or an associated description.

Meters provide a display without keyboard interaction.

## `nve-meter-group`

Arranges child meters into one segmented visualization.

### Properties and attributes

The group has no `value`, `min`, `max`, `color`, or `status` property.

It derives its shared scale from the child meters. Each child owns its measurement and fill treatment.

Use `aria-label` or `aria-labelledby` to name the group.

### Children

Compose segments using direct `nve-meter` children. Their DOM order determines their visual sequence.

Frameworks can generate these children through their ordinary iteration and binding mechanisms. This composition needs no array-based segment property.

### Shared scale

All children must have matching effective `min` and `max` values.

Validation compares resolved values, including defaults, rather than requiring identical attribute declarations.

For example, these meters have matching bounds when the defaults are `min="0"` and `max="100"`:

```html
<nve-meter-group aria-label="Resource allocation">
  <nve-meter
    value="20"
    color="blue-cobalt"
    aria-label="Category A">
  </nve-meter>

  <nve-meter
    value="30"
    min="0"
    max="100"
    color="teal-cyan"
    aria-label="Category B">
  </nve-meter>
</nve-meter-group>
```

The `@nvidia-elements/lint/no-invalid-meter-group` rule reports mismatched effective bounds in static templates. Applications must maintain matching bounds for dynamic values. The group does not validate or overwrite child bounds at runtime.

Each segment occupies `(value - min) / (max - min)` of the shared track. For zero-based ranges, this is `value / max`. Collapsed ranges have an empty fill. The group does not normalize segment widths against the sum of child values.

The same lint rule reports static segment widths that exceed capacity. At runtime, the group clips excess segments at the track end in DOM order without diagnostics or normalization.

Represent available capacity as an explicit child meter, as shown in the storage example.

### Accessibility

The group exposes `role="group"`. Each child retains its own `role="meter"`, accessible name, bounds, and value.

The group does not expose another combined meter or cumulative child values. A segment’s position does not change its measurement.

If the implementation paints decorative replacement bars, it hides those bars from assistive technology and keeps the child meter nodes exposed. Each child measurement appears exactly once in the accessibility tree.

## CSS customization

The CSS API follows the progress bar conventions.

| Custom property  | Standalone meter          | Grouped meters                                            | Default                                 |
| ---------------- | ------------------------- | --------------------------------------------------------- | --------------------------------------- |
| `--accent-color` | Filled region color       | Set on each child meter to customize its segment          | `var(--nve-sys-interaction-color)`      |
| `--background`   | Unfilled track background | Set on the group to customize the shared track background | `var(--nve-sys-interaction-background)` |
| `--height`       | Track height              | Set on the group to control the entire track height       | `var(--nve-ref-size-200)`               |

The default accent color applies when the meter has no `color`, `status`, or explicit CSS override.

```css
nve-meter {
  --accent-color: var(--nve-sys-interaction-color);
}
```

### Standalone customization

```html
<nve-meter
  value="58"
  max="128"
  aria-label="Storage used"
  aria-valuetext="58 GB of 128 GB used"
  style="
    --accent-color: rebeccapurple;
    --background: lightgray;
    --height: 8px;
  ">
</nve-meter>
```

### Group customization

Set shared track properties on the group and segment fill overrides on individual meters.

```html
<nve-meter-group
  aria-label="Resource allocation"
  style="--height: 8px; --background: lightgray;">
  <nve-meter
    value="20"
    max="100"
    aria-label="Category A"
    style="--accent-color: rebeccapurple;">
  </nve-meter>

  <nve-meter
    value="30"
    max="100"
    color="teal-cyan"
    aria-label="Category B">
  </nve-meter>
</nve-meter-group>
```

## Composition and updates

Compose visible labels, legends, formatted totals, descriptions, tooltips, and actions around the meter elements.

The application owns measurement values and statuses. Changing a property updates the visualization and accessibility state without emitting a change event.

## Out of scope

- The native meter threshold properties `low`, `high`, and `optimum`.
- Automatic status calculation from measurement values.
- Group-level bounds, values, colors, or statuses.
- An array-based segment configuration API.
- Indeterminate progress behavior.
