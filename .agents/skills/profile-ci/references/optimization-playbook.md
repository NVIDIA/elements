# CI optimization playbook

Use this reference after collecting a valid profile. Select approaches from current evidence; do not list every approach in every audit.

## Selection order

### Remove unconsumed or duplicate work

Look for bundle visualizers, duplicate test suites, unused report formats, repeated downloads, redundant generation, and work repeated in both a main job and a dedicated job.

Verify all output consumers before removal. Preserve required test, release, documentation, and deployment coverage.

### Improve the completion branch

Trace the scripts that finish last through Wireit dependencies. Consider:

- starting independent prerequisites earlier;
- removing dependencies that do not represent real input requirements;
- narrowing broad dependency fan-in;
- reducing work in the final command;
- avoiding a second copy, transform, or package pass.

Do not decouple a dependency until output and runtime behavior prove that the downstream task does not need it.

### Split composite commands

Split sequential phases when one command hides attribution or forces broad cache invalidation. Give each phase accurate Wireit files, outputs, dependencies, and environment.

Splitting improves observability and caching. It does not reduce cold wall time by itself unless the graph can safely overlap phases.

### Add controlled parallelism

Look for one-worker test suites, disabled file parallelism, sequential linting, and independent generated targets.

Prefer process-level shards when tools share browser state or globals. Give every shard separate ports, browser profiles, coverage directories, screenshots, JUnit/JSON output, and temporary files. Merge reports deterministically and verify identical totals and thresholds.

Measure peak memory and full CI time. A faster package command can slow the pipeline by starving sibling work.

### Reduce transformed or generated inputs

Use module counts, page counts, plugin timings, and repeated transforms to find large input surfaces. Consider:

- deduplicating identical generated modules;
- externalizing safe shared assets;
- omitting development-only modules from production;
- avoiding repeated full-document scans;
- narrowing entry points and globs;
- generating shared metadata once.

Require output-equivalence checks for routes, bundles, screenshots, metadata, and runtime behavior.

### Improve cache boundaries

Audit Wireit `files`, `output`, `dependencies`, `cascade`, environment variables, and package-lock inputs. Split tasks whose unrelated inputs invalidate expensive work.

Measure cache-hit behavior separately. The cold profiler sets `WIREIT_CACHE=none`, so cache changes cannot explain its results.

### Use tool-specific diagnostics

Inspect the installed tool version and local configuration before choosing flags.

- Wireit: use command start/finish order and dependency declarations.
- Vite or Rolldown: inspect transformed module counts and plugin timing warnings.
- Eleventy: compare written files, templates, transforms, and Vite phases.
- Vitest: inspect file/test totals, workers, concurrency, isolation, retries, browser providers, and reporters.
- ESLint: inspect rule timing, file counts, cache state, and supported concurrency modes.
- Coverage: identify report consumers and the cost of collection, transformation, serialization, and report generation.

## Experiment record

For each experiment, capture:

- hypothesis;
- exact configuration difference;
- baseline and candidate commands;
- sample count and environment;
- median, minimum, maximum, and variance;
- output-equivalence checks;
- test and coverage totals;
- peak memory or other resource constraints;
- targeted timing and full-CI timing;
- decision and confidence.

Change one performance variable at a time where practical.

## Confidence rubric

- **High diagnosis confidence:** repeated measurements and configuration directly explain the serialization or work.
- **Medium diagnosis confidence:** evidence is consistent, but concurrent contention or hidden tool behavior remains.
- **Low diagnosis confidence:** the signal is noisy, appears only once, or lacks configuration support.
- **High approach confidence:** a low-risk removal or configuration change preserves verified outputs.
- **Medium approach confidence:** the approach needs isolation, report merging, or dependency validation.
- **Low approach confidence:** the expected gain is speculative or depends on undocumented behavior.

State diagnosis confidence separately from approach confidence when they differ.

## Reject weak recommendations

Do not recommend:

- deleting caches to make a warm build faster;
- adding all script durations to estimate total CI time;
- increasing every worker count to the CPU count;
- removing tests solely because they are slow;
- moving a check to another workflow without confirming that required status checks include it;
- claiming an isolated benchmark equals full CI savings;
- upgrading dependencies and changing orchestration in the same performance experiment;
- optimizing a top-ten parallel script while ignoring the branch that completes last.
