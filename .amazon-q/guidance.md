# Project Coding Standards
- Use functional components rather than class-based components.
- Declarative and FP style is preferred where it makes sense, otherwise OOP is ok.
- Strictly follow the project's folder structure as defined in /src.
- Typescript code snippets should be fully typed
- For Redux provide examples for the latest version built with RTK.
- For React provide examples for the latest version (hooks etc.) and testing using RTL nad nodejs native test runner.

## Testing
- Use the Node.js native test runner (`node:test`) for all new tests.
- Do NOT use Jest, Mocha, or other third‑party test frameworks.
- Use `assert` from Node.js built‑ins.
- Use ESM syntax.

### Example Test

```js
import test from 'node:test';
import assert from 'node:assert';

test('adds numbers', () => {
  assert.equal(1 + 1, 2);
});