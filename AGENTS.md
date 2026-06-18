# Repository implementation instructions

## 1. Inspect the repository first

Before changing code:

1. inspect the repository structure;
2. read the root `AGENTS.md`;
3. read every more specific `AGENTS.md` applicable to the files being changed;
4. inspect the relevant package scripts, configuration, tests, and nearby implementation;
5. read the complete work package and its referenced requirements;
6. identify generated files and the commands that generate them.

More specific `AGENTS.md` files override broader ones for their directory scope.

Do not start implementation before understanding the existing architecture and conventions.

## 2. Follow authoritative scope

Implement only the scope of the current work package.

Do not implement later work packages, speculative abstractions, unrelated refactoring, or additional product behavior pre-emptively.

Do not invent missing requirements, API behavior, database fields, defaults, or business rules.

When the work package conflicts with:

- the current repository;
- an applicable `AGENTS.md`;
- the OpenAPI contract;
- an authoritative requirement;
- an immutable migration policy;

stop and report the exact conflict instead of silently choosing an interpretation.

Preserve existing behavior unless the work package explicitly requires it to change.

## 3. Follow existing conventions

Use the repository’s established:

- architecture;
- directory structure;
- naming conventions;
- state-management approach;
- API boundary;
- error model;
- validation approach;
- styling system;
- testing patterns;
- logging conventions;
- dependency choices.

Do not introduce a second library or competing architectural pattern when the repository already has an established solution.

Do not manually edit generated files. Update their authoritative source and run the existing generation command.

## 4. TypeScript and React conventions

- Keep TypeScript strict and avoid `any`.
- Do not use unsafe type assertions merely to silence compiler errors.
- Prefer explicit domain types and discriminated unions where they prevent invalid states.
- Use arrow-function syntax for event handlers and callback handlers.
- Use the `@` Vite alias for imports across source areas when it improves clarity.
- Prefer relative imports for files in the same directory or a directly adjacent local module.
- Do not create deeply nested relative imports such as `../../../`.
- Keep components focused on one responsibility.
- Refactor a component when it mixes substantial layout, data access, state coordination, and domain behavior, or when meaningful parts can be tested and understood independently.
- Extract reusable behavior into hooks or focused modules only when it creates a clear responsibility boundary.
- Do not split components into trivial wrappers that add indirection without benefit.

## 5. Documentation

Add TypeDoc comments when they provide information that is not already obvious from the name and type signature.

Useful TypeDoc comments explain:

- domain rules;
- invariants;
- lifecycle constraints;
- non-obvious side effects;
- ownership of state;
- error behavior;
- security-sensitive behavior;
- why an implementation differs from an obvious alternative.

Do not add comments that merely repeat the function name, parameter names, or TypeScript types.

Update user-facing or developer documentation when behavior, configuration, scripts, or architecture changes.

## 6. Dependencies and commands

Use `pnpm` only.

Do not use:

- `npm`;
- `npx`;
- `yarn`.

Before adding a dependency:

1. confirm that the repository does not already provide the capability;
2. confirm that the dependency is necessary for the current work package;
3. use a version compatible with the existing project;
4. document why it was added.

Do not perform unrelated dependency upgrades.

## 7. Database migrations

When database changes are in scope:

- follow the repository’s established migration policy;
- do not use schema synchronization as a replacement for migrations;
- do not rewrite migrations that may already be immutable or deployed unless the work package explicitly authorizes it;
- do not invent data backfills or default entities;
- test migrations against the supported database.

When no migration is required, report:

```text
Migrations added: None
```

## 8. Test requirements

Add or update automated tests for every acceptance criterion affected by the implementation.

Maintain explicit traceability between acceptance criteria and tests. One test may cover multiple criteria, and one criterion may require multiple tests.

Use:

- Vitest for unit, component, and integration tests;
- Playwright for end-to-end tests.

Test observable behavior and domain rules rather than implementation details.

Do not mock the unit under test itself.

Mock at established external boundaries, such as:

- generated API clients;
- repositories;
- browser APIs;
- time;
- external services.

Do not mock TanStack Query, React internals, or other framework internals when a real provider-based test is practical.

## 9. End-to-end test quality

Run the complete existing E2E suite before making changes when the work package involves E2E behavior or when an E2E failure is already known.

For an existing failing E2E test:

1. identify the exact failing test;
2. capture and analyze the failure;
3. determine whether the cause is in the product, test, fixture, environment, synchronization, or requirement expectation;
4. fix the root cause;
5. run the test in isolation;
6. run its complete test file;
7. run the complete E2E suite.

Do not make a failing test appear successful by:

- adding `.skip`;
- adding `.fixme`;
- adding `.only`;
- deleting meaningful assertions;
- weakening assertions without an authoritative requirement change;
- adding arbitrary sleeps;
- increasing timeouts as the only fix;
- relying on retries to hide deterministic failures;
- changing test order to conceal shared-state problems.

If an existing test is obsolete because an authoritative requirement changed, document the requirement change and replace the test with correct coverage.

All existing and newly added E2E tests must pass before claiming successful completion, unless an unrelated environmental or pre-existing blocker makes execution impossible. Such a blocker must be reported precisely and must not be described as success.

## 10. Test isolation

Tests must be deterministic and independently executable.

Tests must not:

- depend on another test running first;
- rely on data left by another test;
- use static database identifiers from earlier runs;
- depend on execution order;
- use arbitrary timing delays instead of observable state;
- make real external network requests unless the test is explicitly an integration test for that service.

Use deterministic fixtures and the repository’s established database-cleanup strategy.

## 11. Required verification commands

Run the repository’s relevant commands after implementation, including:

```bash
pnpm lint
pnpm format
pnpm test:unit:coverage
pnpm test:e2e
pnpm docs
```

Also run any additional command required by the changed package, such as:

```bash
pnpm typecheck
pnpm build
pnpm openapi:update
pnpm migration:run
```

Use the actual scripts defined by the repository.

If a required script does not exist, report that fact. Do not invent a substitute command without explaining it.

Run formatting early enough that subsequent checks validate the formatted code.

After fixing a failure, rerun the failed command and all commands whose results may have been affected.

## 12. Handling command failures

Do not claim success when any required command fails.

For every failure, determine whether it is:

- caused by the implementation;
- a pre-existing repository failure;
- an environment or infrastructure failure;
- caused by a missing dependency or service;
- caused by an unavailable backend or database.

Fix failures caused by the implementation.

Do not expand the work-package scope merely to repair an unrelated pre-existing problem unless the work package explicitly requires all tests to pass.

Report unrelated failures with:

- the exact command;
- the failing test, rule, or step;
- the relevant error;
- evidence that it predates or is unrelated to the implementation;
- whether it blocks verification of the work package.

Never conceal failures behind vague language such as “mostly passing.”

## 13. Code quality before completion

Before declaring the work complete:

- remove temporary debugging output;
- remove dead code;
- remove obsolete imports;
- remove unused fixtures;
- verify that no generated file was edited manually;
- verify that no later work-package behavior was added;
- verify error, loading, empty, and success states;
- verify keyboard and accessibility behavior where applicable;
- review the diff for accidental unrelated changes.

## 14. Completion report

At the end, report:

1. files added;
2. files modified;
3. files deleted;
4. migrations added, or `None`;
5. dependencies added or changed, including justification;
6. tests added or updated, mapped to acceptance criteria;
7. commands run and their exact results;
8. failures encountered and how they were resolved;
9. unresolved pre-existing or environmental failures;
10. assumptions made;
11. requirement or contract conflicts found;
12. known limitations;
13. confirmation that only the current work-package scope was implemented.

Do not state that the implementation is complete when required checks are failing or could not be executed.
