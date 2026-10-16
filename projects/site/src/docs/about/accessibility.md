---
{
  title: 'Accessibility',
  description: 'Accessibility goals for NVIDIA Elements, the WCAG 2.1 AA target, and what automated Chromium checks cover.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

This page records the accessibility target for Elements and the checks that run in the repository. Read an automated result on this site as a test outcome, separate from conformance.

## Guidelines

The World Wide Web Consortium (W3C) publishes the Web Content Accessibility Guidelines (WCAG). [WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the current W3C Recommendation. It extends [WCAG 2.1](https://www.w3.org/TR/WCAG21/), which remains a W3C Recommendation. W3C advises the use of WCAG 2.2. Content that conforms to WCAG 2.2 also conforms to WCAG 2.1 and WCAG 2.0.

The Elements target remains WCAG 2.1 Level AA. This page leaves that target in place. It does not claim WCAG 2.2 conformance. Moving the project target to WCAG 2.2 AA needs a separate decision.

The system also follows these references:

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/): patterns and functional examples for common widgets.
- [WCAG legal guidance](https://wcag.com/legal/): background on how laws reference WCAG. The link is a reference, not an audit result for Elements.

## Automated testing

Accessibility tests call `runAxe` from `@internals/testing/axe`. That helper runs [axe-core](https://github.com/dequelabs/axe-core) 4.11.0, the version pinned in the workspace catalog. The call uses axe-core's default rule selection and disables `aria-prohibited-attr`, because axe-core does not yet support the ElementInternals accessibility object model. In axe-core 4.11.0 the default selection leaves the WCAG 2.2 `target-size` rule disabled, and it includes enabled rules tagged `best-practice` plus some rules tagged `experimental`.

The axe setup loads `@nvidia-elements/themes/index.css` and sets `nve-theme` to an empty value. `:root` in that stylesheet supplies the default light theme. The setup does not load `dark.css` or `high-contrast.css`. Tests run in Chromium through Playwright.

axe-core reports that its rules find, on average, 57% of WCAG issues automatically. Manual keyboard, screen-reader, focus, contrast, zoom, and interaction testing still has to cover the rest. Component pages call out known issues.

Lighthouse tests are a second automated check. They use the default Lighthouse config in Chromium, limited to the performance, accessibility, and best-practices categories, and they skip `aria-prohibited-attr`. Lighthouse HTML templates set `nve-theme="dark"`. Some templates also import `dark.css`, and some do not. A Lighthouse accessibility score and a passing axe result stay automated scores, separate from a conformance audit. The [metrics](/docs/metrics/) pages show those test results.

The [accessibility testing guide](/docs/internal/guidelines/testing-accessibility/) shows how to write an axe test.

## Component specs

Each component targets a published [ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) or an existing web standard. The component documentation page names that spec.

## Expectations

Designers and developers:

- Make interactive elements available from the keyboard.
- Apply the WCAG 2.1 AA target to color contrast, layout, and related factors.
- Review keyboard, screen-reader, focus, contrast, zoom, and interaction behavior along with the automated checks.
- Track known gaps on the component page.

## Resources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), the current W3C Recommendation
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/), the Elements target
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [The A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Four Categories of Accessibility](https://www.a11yproject.com/posts/accessibility-is-blind-people/)
- [The A11y Project](https://www.a11yproject.com/)
- [Web Dev Learn](https://web.dev/learn/accessibility/)
