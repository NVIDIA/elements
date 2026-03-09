## Playground UI Workflow

Best practices and guidelines for creating an Elements Playground, an in-browser sandbox for rapid UI prototyping.

Start by creating a `.playground/<name>.html` scratchpad file in the workspace root with the starter layout. This establishes the file early so all later research, writing, and validation happen in place. Making targeted edits and re-validating from disk prevents regressions where earlier correct markup silently drifts.

For simple templates that likely pass on the first try, passing `template` directly is fine. Use the scratchpad file when building anything non-trivial.

1. **Create** the scratchpad file at `.playground/<name>.html` with the starter layout template
2. **Search** patterns and compositions (tools: `examples_list`, `examples_get`)
3. **Search** available components and APIs (tools: `api_list`)
4. **Look up** full API details and documentation (tools: `api_get`)
5. **Write** the HTML into the scratchpad file using `nve-*` components (tools: `api_imports_get`)
6. **Check** the scratchpad (tools: `playground_validate` with `path`)
7. **Iterate**—make targeted edits to only the lines flagged by validation. Do not rewrite the entire file. Re-validate after each fix.
8. **Create** the playground (tools: `playground_create` with `path`)
