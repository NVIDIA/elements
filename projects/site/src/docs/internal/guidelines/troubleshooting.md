---
{
  title: 'Troubleshooting',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

This guide covers common issues and solutions for test failures, build errors, performance regressions, and development environment problems.

## Test Failures

### Unit Test Timing Issues

- **Symptom:** Tests fail intermittently or when accessing element properties
- **Cause:** Component not fully rendered or updated before assertions
- **Solution:** Always wait for `elementIsStable()` before assertions

```typescript
// ❌ Bad: No stability check
it('should update property', async () => {
  element.status = 'success';
  expect(element.getAttribute('status')).toBe('success'); // May fail
});

// ✅ Good: Wait for stability
it('should update property', async () => {
  element.status = 'success';
  await elementIsStable(element);
  expect(element.getAttribute('status')).toBe('success');
});
```

### Missing Fixture Cleanup

- **Symptom:** Tests pass individually but fail when run together
- **Cause:** DOM pollution from previous tests
- **Solution:** Always use `removeFixture()` in `afterEach()`

```typescript
// ✅ Proper cleanup pattern
describe('Component', () => {
  let fixture: HTMLElement;
  let element: Component;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-component></nve-component>`);
    element = fixture.querySelector('nve-component');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture); // Required!
  });
});
```

### Event Timing Problems

- **Symptom:** Event listeners don't trigger or receive wrong values
- **Cause:** Events fire before listeners attached or before element stable
- **Solution:** Use `untilEvent()` helper and ensure stability

```typescript
// ✅ Proper event testing
it('should emit custom event', async () => {
  const eventPromise = untilEvent(element, 'change');
  element.value = 'new-value';
  await elementIsStable(element);

  const event = await eventPromise;
  expect(event.detail.value).toBe('new-value');
});
```

## Visual Regression Failures

### Theme Attribute Mismatch

- **Symptom:** Visual test fails with theme-related differences
- **Cause:** Theme attribute not set correctly in template
- **Solution:** Ensure `nve-theme` attribute matches test name

```typescript
// ✅ Correct theme setup
function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/component/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <nve-component>content</nve-component>
  `;
}

test('should match visual baseline dark theme', async () => {
  const report = await visualRunner.render('component.dark', template('dark'));
  expect(report.maxDiffPercentage).toBeLessThan(1);
});
```

### Viewport Size Issues

- **Symptom:** Screenshots show different dimensions than expected
- **Cause:** Content overflows or viewport not consistent
- **Solution:** Use explicit containers or adjust viewport in test config

```typescript
// Add container with explicit sizing
function template() {
  return /* html */ `
    <div style="width: 800px; padding: 20px;">
      <nve-component>content</nve-component>
    </div>
  `;
}
```

### Acceptable Diff Threshold

**Default:** `maxDiffPercentage < 1`

Visual differences under 1% are acceptable due to:

- Sub-pixel rendering variations
- Font rendering differences across OS
- Anti-aliasing variations

If diff exceeds 1%, investigate actual visual change or update baseline.

## Lighthouse Failures

### Performance Score Below 100

- **Causes:**

  - Bundle size too large
  - Unoptimized images
  - Blocking resources
  - Excessive JavaScript execution

- **Solutions:**

```typescript
// Check bundle size limit
expect(report.payload.javascript.kb).toBeLessThan(15); // Adjust based on component

// For larger components, document justification:
// Components with rich functionality may have higher limits
expect(report.payload.javascript.kb).toBeLessThan(25);
```

- **Bundle Size Guidelines:**
  - Simple components: < 12 KB
  - Interactive components: < 18 KB
  - Complex components: < 25 KB
  - Rich editors/specialized: Document in test

### Accessibility Score Below 100

- **Common Issues:**

  - Missing ARIA labels
  - Insufficient color contrast
  - Missing focus indicators
  - Invalid ARIA attributes

- **Solution:** Run accessibility tests and fix violations

```shell
pnpm run test:axe
```

See [accessibility testing guide](testing-accessibility.md) for details.

### Best Practices Score Below 100

- **Common Issues:**

  - Console errors in production
  - Deprecated APIs usage
  - Missing error handling
  - Inefficient patterns

- **Solution:** Review Lighthouse report details and fix issues

## Build Failures

### Wireit Cache Issues

- **Symptom:** Build fails with outdated errors or missing dependencies
- **Cause:** Stale Wireit cache
- **Solution:** Reset CI environment

```shell
pnpm run ci:reset
```

This clears all caches and reinstalls dependencies.

### TypeScript Compilation Errors

- **Symptom:** Type errors in CI but not locally
- **Cause:** Different TypeScript version or stale build cache
- **Solutions:**

```shell
# Check TypeScript version matches
pnpm list typescript

# Clear build outputs
rm -rf dist/

# Rebuild
pnpm run build
```

## Git LFS Issues

### Missing Visual Test Baselines

- **Symptom:** Visual tests fail with "baseline not found"
- **Cause:** Git LFS files not pulled
- **Solution:** Pull LFS files

```shell
git lfs install
git lfs pull
```

## Development Environment

### Node Version Mismatch

- **Symptom:** Build or tests fail with Node compatibility errors
- **Cause:** Wrong Node.js version
- **Solution:** Use Node Version Manager

```shell
# Install correct version from .nvmrc
nvm install
nvm use

# Verify version
node --version  # Should show 24.12.0
```

### pnpm Version Issues

- **Symptom:** Install fails or lockfile changes unexpectedly
- **Cause:** Wrong pnpm version
- **Solution:** Use Corepack

```shell
# Install Corepack globally
npm install -g corepack@0.34.5

# Enable Corepack
corepack enable

# Prepare pnpm version from package.json
corepack prepare --activate

# Verify version
pnpm --version
```

### Port Conflicts in Dev Mode

- **Symptom:** Dev server fails to start with "port already in use"
- **Cause:** Another process using the port
- **Solution:**

```shell
# Find process using port
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or specify different port
PORT=3001 pnpm run dev
```

## Performance Regressions

### Test Suite Running Slowly

- **Symptom:** Tests take much longer than before
- **Causes & Solutions:**

1. **Too many fixture creations**

```typescript
// ❌ Creating fixture in each test
it('test 1', async () => {
  const fixture = await createFixture(...);
});

// ✅ Reuse fixture in beforeEach
beforeEach(async () => {
  fixture = await createFixture(...);
});
```

2. **Missing test parallelization**

```shell
# Enable parallel tests
WIREIT_PARALLEL=1 pnpm run test
```

3. **Unnecessary elementIsStable() calls**

```typescript
// ❌ Excessive stability checks
await elementIsStable(element);
element.value = 'test';
await elementIsStable(element);
expect(element.value).toBe('test');
await elementIsStable(element);

// ✅ Only check when needed
element.value = 'test';
await elementIsStable(element);
expect(element.value).toBe('test');
```

### Build Time Regression

**Symptom:** CI builds take much longer than expected
**Causes & Solutions:**

1. **Wireit cache not working**

- Check `files` and `output` arrays are accurate
- Verify no gitignored files in `files` array

2. **Missing dependency parallelization**

- Review Wireit dependencies in package.json
- Ensure independent tasks don't list each other as dependencies

3. **Large bundle sizes**

- Check for accidental bundling of dev dependencies
- Use bundle analyzer: `ANALYZE=true pnpm run build`

## CI/CD Issues

### Pipeline Timeout

- **Symptom:** CI job exceeds time limit
- **Cause:** Hung tests or infinite loops
- **Solution:** Add timeouts to tests

```typescript
describe('Component', { timeout: 30000 }, () => {
  it('should complete quickly', { timeout: 5000 }, async () => {
    // Test code
  });
});
```

## Getting Help

When troubleshooting:

1. **Check CI logs** - Full error messages often in collapsed sections
2. **Reproduce locally** - Run exact CI command locally
3. **Compare with working example** - Check similar components/projects
4. **Review recent changes** - Use `git diff main` to see what changed
5. **Clear all caches** - `pnpm run ci:reset` eliminates cache issues

## Related Documentation

- [Testing Guidelines](testing.md) - Test patterns and best practices
- [Unit Testing](testing-unit.md) - Unit test patterns
- [Visual Testing](testing-visual.md) - Visual regression details
- [Lighthouse Testing](testing-lighthouse.md) - Performance testing
- [Build System](../../internals/BUILD.md) - Wireit configuration
