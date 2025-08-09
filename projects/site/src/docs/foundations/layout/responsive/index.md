---
{
  title: 'Responsive Layout',
  layout: 'docs.11ty.js',
  permalink: 'docs/internal/layout/responsive/index.html'
}
---

# {{title}}

<nve-alert-group status="warning" prominence="emphasis">
  <nve-alert style="--align-items: start">
    <div nve-text="relaxed">
      Responsive layout modules are marked <em>Pre-Release</em> and are not yet ready for consumer adoption - API is subject to breaking changes.
    </div>
  </nve-alert>
</nve-alert-group>

Fluid page layouts are achieved through the [abstracted CSS flexbox and grid APIs](docs/foundations/layout/), allowing pages built with Elements `nve-layout` attributes to automatically grow and shrink with the browser viewport width.

The layout system can be extended with responsive capabilities using two different approaches: **Container Queries** and **Viewport Queries**. Both systems allow you to create adaptive layouts that respond to different screen sizes, but they work in fundamentally different ways.

### Layout vs Display Attributes

The responsive system uses two distinct attributes:

- **`nve-layout`**: Controls layout properties that affect how children are arranged (gap, padding, flex direction, grid structure)
- **`nve-display`**: Controls visibility of individual elements (hide/show)

This separation exists because hiding an element only affects its own display, not the layout of its children. By using `nve-display` for visibility control, we maintain a clear distinction between layout utilities that affect child arrangement and display utilities that affect element visibility.

<nve-alert-group>
  <nve-alert>
    <nve-icon slot="icon">🎓</nve-icon> Learn more about container queries in this <a href="https://web.dev/articles/new-responsive" target="_blank" nve-text="link">Google web.dev article</a> and media queries in <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media" target="_blank" nve-text="link">MDN documentation</a>.
  </nve-alert>
</nve-alert-group>

## Container Queries (`&` prefix)

Container queries respond to the **width of the parent container**, making them ideal for component-based responsive design. This approach allows components to adapt regardless of where they're placed on the page.

**Breakpoints:**

- `xs = 160px`
- `sm = 320px`
- `md = 480px`
- `lg = 640px`
- `xl = 800px`
- `xxl = 960px`

```html
<!-- Responds to the container's width, not the browser width -->
<div>
  <section nve-layout="column &md|row &lg|gap:xl">
    <nve-card></nve-card>
    <nve-card nve-display="hide &lg|show"></nve-card>
  </section>
</div>
```

**Pros:**

- **Component-aware**: Elements respond to their actual available space
- **Reusable**: Same component works in different contexts (sidebar, main content, etc.)
- **Future-proof**: Modern CSS approach for intrinsic web design
- **Broad support**: Works in all modern browsers as of summer 2025
- **Flexible**: More granular breakpoints (xs: 160px to xxl: 960px)

**Cons:**

- **Requires wrapper**: Parent element needs `container-type` (automatically applied)
- **Newer technology**: Limited support in older browsers
- **Learning curve**: Different mental model than traditional responsive design

[Learn more about the Container Query based system →](docs/internal/layout/responsive/container/)

## Viewport Queries (`@` prefix)

Viewport queries respond to the **browser window width**, providing traditional responsive design behavior that most developers are familiar with.

**Breakpoints:**

- `sm = 576px`
- `md = 768px`
- `lg = 1024px`
- `xl = 1280px`
- `xxl = 1440px`

```html
<!-- Responds to the browser viewport width -->
<section nve-layout="column @md|row @lg|gap:xl">
  <nve-card></nve-card>
  <nve-card nve-display="hide @lg|show"></nve-card>
</section>
```

**Pros:**

- **Familiar**: Traditional responsive design approach developers know
- **Global consistency**: All elements respond to the same viewport breakpoints
- **Broad support**: Works in all modern browsers
- **Page-level control**: Ideal for overall page layout decisions

**Cons:**

- **Less flexible**: Elements can't adapt to their actual container size
- **Context-blind**: Same breakpoint triggers regardless of element placement
- **Fewer breakpoints**: Standard breakpoints (sm: 576px to xxl: 1440px)

[Learn more about Viewport Query based system →](docs/internal/layout/responsive/viewport/)

## When to Use Which System

**Use Container Queries (`&`) when:**

- Building reusable components
- Component needs to work in different containers
- Sidebar widgets, card layouts, form components
- Component-driven development

Example: `<nve-button nve-display="hide &sm|show">` - Button shows when its container is wide enough

**Use Viewport Queries (`@`) when:**

- Designing overall page layouts
- All instances should respond to viewport
- Navigation bars, page headers, global layout
- Traditional responsive design

Example: `<nav nve-display="hide @lg|show">` - Navigation shows on large screens

## Combining Both Systems

You can use both systems together for maximum flexibility:

<nve-alert-group status="accent">
  <nve-alert>
    <nve-icon slot="icon">🎓</nve-icon> Learn more about combining container and media queries in this Google <a href="https://web.dev/articles/new-responsive#mixing_container_queries_with_media_queries" target="_blank" nve-text="link">web.dev</a> video and article.
  </nve-alert>
</nve-alert-group>

```html
<!-- Viewport-based overall layout, container-based component layout -->
<nve-page>
  <main nve-layout="column gap:lg pad:xs @lg|pad:xxl">
    <section nve-layout="grid gap:md span-items:12 @sm|span-items:6 @lg|span-items:4">
      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading lg">Responsive Card Example</h3>
        </nve-card-header>
        <nve-card-content>
          <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
          <p>This card demonstrates combining container and viewport queries.</p>
        </nve-card-content>
      </nve-card>

      <nve-card>
        <nve-card-header>
          <h3 nve-text="heading lg">Responsive Card Example</h3>
        </nve-card-header>
        <nve-card-content>
          <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
          <p>This card demonstrates combining container and viewport queries.</p>
        </nve-card-content>
      </nve-card>

      <!-- Repeats... -->
  </main>
</nve-page>
```

{% story '@nvidia-elements/styles/responsive.stories.json', 'ResponsiveCombined', '{ "editable": true, "height": "650px" }' %}

## Supported Features

Both responsive layout systems support conditional styling across defined pixel width breakpoints. Available features include:

- **Gap spacing**: Responsive spacing between elements
- **Padding**: Responsive internal spacing
- **Flex direction**: Switch between `row` and `column` layouts
- **Direction reversal**: `row-reverse` and `column-reverse` options
- **Grid structure**: Varying grid column spans and layouts
- **Visibility control**: Hide and show elements based on breakpoints

### Important Note on Visibility Control

Hiding and showing elements uses the `nve-display` attribute instead of `nve-layout`. This separation exists because visibility control affects only the element itself, not the layout of its children. For example:

```html
<!-- Container queries -->
<nve-badge nve-display="hide &md|show">Hidden until container is ≥ 480px wide</nve-badge>

<!-- Viewport queries -->
<nve-badge nve-display="hide @lg|show">Hidden until viewport is ≥ 1024px wide</nve-badge>
```

<script type="module">
  import '/_internal/canvas-editable/canvas-editable.js';
</script>
