---
{
  title: 'Contributions',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

This guide facilitates and streamlines your contribution process and helps ensure
that every contribution adheres to the high standards of code and design quality.
In this system, unit testing is highly valued to maintain a reliable, robust design system.

The team may not accept all contributions or may need more time before implementation.
Take into account that a design system component or pattern requires a significant amount of time.
Each use case, many apps, frameworks, API design, and guidelines applicable to all must be carefully considered.
The main focus is to enable you to deliver value to your users.

<img src="static/images/contributions.drawio.svg" style="padding: 12px 0 0 0" />

## Types of Contributions

- **Bug Reporting (minimal effort)**
  reporting a bug with minimal reproduction
- **Feature Requests (minimal effort)**
  reporting a feature request with feature spec
- **Minor Fixes (low effort)**
  code bugs, Figma library bugs, documentation improvements
- **Minor Features (moderate effort)**
  does not disrupt the existing functionality, limited impact effects on the design system as a whole, such as a new icon to the current icon library
- **New Components or Feature (high effort)**
  significant improvements, such as introducing a new feature to a component or changing existing API behavior, require coordination at a system-wide level. This impact extends to code, design, and guidelines.

## Levels of Effort

- **minimal effort** less than a day
- **low effort** less than a week
- **moderate effort** 1-3 weeks
- **high effort** more than 3 weeks

## Bug Reporting

1. **Create a new issue** using the [bug template on Gitlab]({{ELEMENTS_REPO_BASE_URL}}/-/issues/new?issuable_template=default), providing as much detail as you can about the problem and how to reproduce it. Use the [Elements Playground]({{ELEMENTS_PLAYGROUND_BASE_URL}}/ui/elements-playground) to provide a minimal reproducible example if possible.

## Feature Requests

1. **Proposing a Feature**: If you believe a new feature would benefit the design system, please create a new issue using File an issue with the [feature template on Gitlab]({{ELEMENTS_REPO_BASE_URL}}/-/issues/new?issuable_template=feature)

## Bug Fixes

1. **Create a new issue** using the [bug template on Gitlab]({{ELEMENTS_REPO_BASE_URL}}/-/issues/new?issuable_template=default), providing as much detail as you can about the problem and how to reproduce it. Use the [Elements Playground]({{ELEMENTS_PLAYGROUND_BASE_URL}}/ui/elements-playground) to provide a minimal reproducible example.

2. **Resolve the Bug**: Once you have a solution for the bug, please ensure that your code is clear, concise, and adheres to the coding guidelines.

3. **Code and Design Quality**: Quality is paramount. Any bug fixes should keep, or preferably enhance, the existing code and design quality.

4. **Unit Testing**: Each bug fix should include an appropriate unit test. This confirms that the fix works as intended and helps prevent regressions in the future.

## New Components / Feature

1. **Proposing a New Component**: For a new component you would like to contribute, please create a new issue via the [Slack Workflow](https://nvidia.slack.com/archives/C03BDL2UCGK).

2. **Design Review**: The initial MVP design passes review and is ready for implementation.

3. **Implementation**: Provide a API proposal spec on the component adhering to the [coding and API guidelines](./docs/api-design/)

4. **Code and Design Quality**: New components should maintain a high standard of code quality and adhere to the [coding and API guidelines](./docs/api-design/)

5. **Unit Testing**: As with other contributions, all new components should have appropriate unit tests to verify their functionality and performance.

File an issue with the [feature template on Gitlab]({{ELEMENTS_REPO_BASE_URL}}/-/issues/new?issuable_template=feature).
