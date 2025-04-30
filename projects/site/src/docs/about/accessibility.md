---
{
  title: 'Accessibility',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The following document outlines the accessibility standards and guidelines for our system.
Our goal is to provide an inclusive and accessible user experience for all users.

## Guidelines

The World Wide Web Consortium (W3C) provides guidelines for making web content more
accessible to people with disabilities. The following are the guidelines that our
system aims to follow:

- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/): This is the latest set of guidelines, which builds upon the previous versions and provides additional recommendations for improving accessibility.
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/): This guide describes how to apply accessibility semantics to common design patterns and widgets. It provides design patterns and functional examples complemented by in-depth guidance for fundamental practices.
- [WCAG Legal Guidance](https://wcag.com/legal/): Conformance with WCAG is a best practice for legal compliance. WCAG is the universally accepted set of technical standards that, when followed, make digital experiences more accessible. As the global standard, many laws, including the Americans with Disabilities Act and the Accessibility for Ontarians with Disabilities Act, reference conformance with WCAG.

## Automated Testing

All components in the library's light theme are tested for accessibility using [axe-core](https://github.com/dequelabs/axe-core).
This is an automated accessibility testing tool that can be used to identify and address accessibility issues.
However this automates up to only up to ~60% of test cases and the remaining test cases need to be manually tested.
Known issues will be tracked and called out on the component documentation page.

## Component Specs

All component target to meet a pre-defined and established [ARIA Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/)
or existing Web Standard Spec. This is to ensure that the component is accessible by default
follow well established UX patterns. The spec of each component can be found at the top
of its given documentation page.

## Expectations

Our system has the following expectations for designers and developers:

- Ensure that all interactive elements are accessible via keyboard navigation.
- Follow WCAG guidelines for color contrast, layout, and other accessibility-related factors.
- Conduct regular accessibility audits to identify and address any issues or areas of improvement.
- Work with stakeholders and users to gather feedback and ensure that the system meets the needs of all users.

## Resources

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Spec](https://www.w3.org/TR/WCAG21/)
- [The A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Four Categories of Accessibility](https://www.a11yproject.com/posts/accessibility-is-blind-people/)
- [The A11y Project](https://www.a11yproject.com/)
- [Web Dev Learn](https://web.dev/learn/accessibility/)
