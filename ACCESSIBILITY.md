# Accessibility

NVIDIA Elements aims to help people with disabilities use applications built with its Web Components and contribute to the project. Accessibility matters because barriers in shared components can affect many applications.

This statement covers the component libraries, themes, documentation, and contribution practices in this repository. It describes accessibility goals, current checks, known limits, and how to report a barrier. Applications that use Elements need their own accessibility evaluation.

## Priorities

The project targets [Web Content Accessibility Guidelines (WCAG) 2.2 Level AA](https://www.w3.org/TR/WCAG22/), as described in the [accessibility guide](https://nvidia.github.io/elements/docs/about/accessibility/). This is a goal, not a claim of verified conformance across the repository or applications that use it.

The priorities are:

- Completing tasks with a keyboard, with visible focus and predictable focus movement.
- Providing names, roles, states, and updates that assistive technologies can communicate.
- Following the [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) for common interactive patterns.
- Making text, controls, and status information understandable without relying on color alone.
- Supporting readable layouts, reduced motion, and translation of component labels.

## Contributor expectations

These expectations apply to human contributors and coding agents:

- Preserve keyboard operation, accessible names, labels, and focus behavior. Follow the component's documented interaction pattern.
- Add or update accessibility tests for affected states and variants. The [accessibility testing guidelines](projects/site/src/docs/internal/guidelines/testing-accessibility.md) describe the shared axe-core helper and the expectation of zero reported violations.
- Add unit tests for changes to keyboard navigation, focus, and accessibility states. Automated scans alone cannot verify those interactions.
- Check contrast and readability when changing colors or themes, including the states users need to complete a task.
- Describe manual checks in the pull request: the task, browser, operating system, input method, assistive technology when used, and result. Include remaining gaps or test exclusions.
- Keep component guidance and examples accurate, including labels, text alternatives, and responsibilities of application authors.

The repository uses ESLint with lit-a11y rules and axe-core tests in Chromium. Project CI includes accessibility tests alongside other checks. Consult the affected project's `DEVELOPMENT.md` for its commands. For example, from `projects/core`, run:

```shell
mise exec -- pnpm run lint
mise exec -- pnpm run test:axe
```

See the [contribution guide](https://nvidia.github.io/elements/docs/about/contributions/) and [commit sign-off requirements](CONTRIBUTING.md).

## Reporting accessibility issues

[Open an accessibility issue](https://github.com/NVIDIA/elements/issues/new) to report a barrier or request help. A plain-text description is enough. If possible, include:

- The task you wanted to complete and where you encountered the barrier: a component, example, documentation URL, or tool.
- What happened, what you expected, and any steps that reproduce the problem.
- The Elements package version, browser, operating system, input method, and assistive technology, with versions when available.
- Whether you can complete the task another way and how the barrier affects you.

Screenshots, recordings, and code examples are optional. You do not need to disclose a disability or assign a severity. Issues are public; share only information you want to make public.

### Severity

Describe the effect on the task: does the barrier prevent completion, require a difficult workaround, or make the task harder? Examples include a keyboard trap that prevents leaving a control, an unnamed button whose purpose is unclear, or text that is difficult to read. Maintainers use this context to assess priority. The project does not define accessibility-specific severity levels or resolution deadlines.

### Response process

The issue thread is the place for maintainer responses, requests for reproduction details, available workarounds, and links to proposed fixes. Reporters can use it to provide updates or verify whether a fix resolves their task. Response and resolution times depend on maintainer availability and the scope of the change. The project has no guaranteed response or resolution period.

The repository's [stale issue workflow](.github/workflows/stale.yml) can mark unassigned issues after 90 days without activity and close them 14 days later. If a barrier remains, comment on the issue when the stale notice appears. Automatic closure does not establish that a fix exists.

## Ownership and maintenance

NVIDIA Elements maintainers own this statement and accessibility review for the packages they maintain. Their responsibilities include reviewing reports and contributions, documenting limitations, and keeping testing guidance accurate.

Review this statement when supported environments, testing practices, reporting processes, or known limitations change. The project has no documented fixed review schedule. When maintenance responsibilities change, include open accessibility issues and this statement in the handoff.

This statement reflects a repository review on November 12, 2026. The review examined source, tests, configuration, and documentation. It did not include a full accessibility conformance evaluation.

## Supported environments

- **Browser:** Chrome is the primary supported browser in the [support guide](https://nvidia.github.io/elements/docs/about/support/).
- **Automated checks:** The shared accessibility test configuration uses Playwright's Chromium browser and the default light theme. It checks component fixtures rather than complete application journeys.
- **Input:** Keyboard interaction is a design expectation, with unit tests for shared navigation controllers and component focus behavior. Pointer interaction also appears in component tests.
- **Themes:** The themes package provides light, dark, high contrast, and reduced motion styles. Their availability does not establish accessibility conformance in every combination.
- **Assistive technologies and devices:** The repository does not publish a versioned test matrix for screen readers, operating systems, mobile devices, voice input, or switch input. Automated Chromium results do not establish support for those combinations or for other browsers.

## Known limitations

- **Some accessibility checks have exclusions.** The [shared axe helper](projects/internals/testing/src/axe/index.ts) disables `aria-prohibited-attr` because of an [axe-core limitation with ElementInternals](https://github.com/dequelabs/axe-core/issues/4259). Individual suites also disable checks, including [grid relationship checks](projects/core/src/grid/grid.test.axe.ts) and color contrast checks for [tabs](projects/core/src/tabs/tabs.test.axe.ts) and [steps](projects/core/src/steps/steps.test.axe.ts). Passing these suites does not verify all relationships or text contrast; check them in the application with manual inspection and assistive technology.
- **Chart data needs a text alternative.** The [sparkline component](projects/core/src/sparkline/sparkline.ts) presents an image and hides its internal chart shapes from assistive technologies. Application authors need to supply a meaningful accessible name and a text summary or data table when users need the underlying values.
- **Application content needs its own checks.** Labels, projected content, custom colors, translations, media alternatives, and complete workflows depend on application authors. Component fixtures do not verify those choices or the full documentation site.

These limits describe current coverage and integration responsibilities, not an exhaustive list of barriers. Use the reporting process above for problems in your environment.
