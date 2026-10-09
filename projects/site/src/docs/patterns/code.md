---
{
  title: 'Code Patterns',
  description: 'Code patterns built with NVIDIA Elements for test results, file navigation, commits, and environment settings.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Code patterns help users inspect test results, explore project files, review changes, and manage environment settings.

## File Tree

{% example '@internals/patterns/code.examples.json', 'FileTree' %}

## File Tree Git Diff

{% example '@internals/patterns/code.examples.json', 'FileTreeGitDiff' %}

## Git Review Diff

{% example '@internals/patterns/code.examples.json', 'GitReviewDiff' '{ "inline": false, "height": "480px" }' %}

## Commit

{% example '@internals/patterns/code.examples.json', 'Commit' %}

## Test Results

{% example '@internals/patterns/code.examples.json', 'TestResults' %}

## Environment Variables

{% example '@internals/patterns/code.examples.json', 'EnvironmentVariables' %}
