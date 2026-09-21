# Rules

## Common rules

1. Inspect the repository and all applicable `AGENTS.md` files before making changes.
2. Follow the existing architecture and conventions before introducing a new pattern.
3. Use `pnpm` for package scripts and dependency operations.
    - Do not use `npm`.
    - Do not use `npx`; use `pnpm exec` when a binary must be invoked directly.

4. Use the `@/` alias for imports from `src`.
5. Implement only the requested scope.
    - Do not implement later backlog items pre-emptively.
    - Do not add abstractions solely for hypothetical future requirements.

6. Preserve existing behavior unless changing that behavior is part of the task.
7. Prefer focused changes over unrelated repository-wide refactorings.
8. Before creating a new component, hook, helper, store, API abstraction, style, or test fixture, check whether an equivalent already exists.
9. Keep generated code, server state, domain data, and client-only UI state in their existing architectural layers.

## Architecture overview

Use these boundaries when deciding where new code belongs:

- `src/api/generated`: Orval-generated API clients and generated Zod schemas.
- `src/api/*.ts`: hand-written API wrappers, domain-facing schemas/types, and API-specific helpers.
- `src/api/collections`: TanStack DB collections for long-lived reactive domain data.
- `src/auth`: authentication, authorization, permission predicates, and protected-route behavior.
- `src/components`: reusable application UI and application-shell components.
- `src/pages`: route-level features and feature-specific components/hooks.
- `src/router`: route definitions, route helpers, and route UI metadata.
- `src/stores`: client-only cross-cutting state using `@tanstack/react-store`.
- `src/styles`: shared design tokens, mixins, typography, colors, resets, and common styles.
- `src/utils`: reusable pure utilities that do not belong to a specific feature.
- `test`: unit/component tests.
- `test/e2e`: Playwright BDD feature tests and real-backend test support.

Do not move responsibilities between these layers merely because doing so makes one file shorter.

## Source code documentation

Keep documentation concise and useful.

1. Document non-obvious:
    - business rules;
    - permission behavior;
    - state transitions;
    - lifecycle behavior;
    - workarounds;
    - synchronization requirements;
    - algorithms.

2. Add TypeDoc to exported helpers, hooks, components, or APIs when their purpose or contract is not obvious from their name and TypeScript signature.
3. Stores under `src/stores` should have a concise description when their ownership or lifecycle is not immediately obvious.
4. Use `@param`, `@returns`, and examples only when they add useful information.
5. Do not add TypeDoc to trivial functions merely to satisfy a documentation quota.
6. Do not write comments that only restate the implementation.
7. Keep existing useful documentation accurate when behavior changes.

## Code complexity

Use Cyclomatic Complexity and Halstead Volume as maintainability signals, not absolute quality gates.

### Cyclomatic Complexity

Prefer:

- below `10` for a function or hook;
- review for extraction above `10`;
- refactor before adding more branching above `15`;
- review a React component above `20` for decomposition.

Do not add substantial branching to an already complex function without considering extraction.

Prefer these extraction patterns:

- validation logic -> pure validation helpers or Zod schemas;
- permission decisions -> `src/auth`;
- collection-backed data selection -> focused hooks using `useLiveQuery`;
- mutation workflows -> feature hooks;
- form state/orchestration -> form hooks;
- substantial forms -> dedicated `*Form.tsx` components;
- repeated rendering branches -> child components;
- formatting -> `src/utils` or feature-local pure helpers;
- route construction -> `src/router`;
- reusable route-dependent UI behavior -> route metadata or route helpers.

### Halstead Volume

Use these values as guidance:

- below `1000`: usually fine;
- `1000–3000`: acceptable;
- `3000–6000`: review for multiple responsibilities;
- above `6000`: strong refactoring candidate, particularly when Cyclomatic Complexity is also high.

Do not create excessive indirection or tiny artificial files purely to reduce a metric.

Prioritize refactoring when:

1. complexity is high;
2. the code has multiple responsibilities;
3. it changes frequently, is hard to test, or has caused regressions.

### When not to refactor

Do not refactor solely for a metric when:

- the code is clear and stable;
- the file is generated;
- the code is outside the requested scope;
- extraction makes navigation worse;
- extraction introduces meaningless wrappers;
- tests are insufficient and the refactor would be risky;
- planned work will replace the code shortly.

## React components

When creating or modifying a component:

1. Keep the component focused on one coherent UI responsibility.
2. Prefer composition over adding many boolean/configuration props to a single component.
3. Reuse existing application components and PrimeReact patterns before introducing new UI abstractions.
4. Keep domain logic out of purely presentational components.
5. Do not store values in state when they can be derived from:
    - props;
    - route state;
    - collection data;
    - another existing state value.

6. Do not use an effect for work that can be expressed declaratively.
7. Keep effects narrow and dependencies correct.
8. Do not add `useMemo`, `useCallback`, or `memo` automatically.
    - Use them when they provide a concrete correctness, identity-stability, or performance benefit.

9. Preserve all relevant states when modifying a feature:
    - loading;
    - empty;
    - success;
    - validation error;
    - API error;
    - permission denied;
    - disabled/pending.

10. Inspect corresponding tests before changing component behavior.
11. Inspect relevant E2E scenarios when changing user-visible behavior, labels, roles, routes, dialogs, or navigation.

## React hooks

1. Follow the Rules of Hooks.
2. Name custom hooks with the `use` prefix.
3. Keep each hook focused on a coherent responsibility.
4. Do not use a hook merely to wrap one trivial expression.
5. Keep side effects visible and deliberate.
6. Return typed domain-facing values rather than leaking unnecessary implementation details.
7. Feature hooks may orchestrate:
    - route parameters;
    - TanStack DB live queries;
    - React Query operations;
    - form actions;
    - navigation;
    - feature-local state.

8. Do not hide unrelated workflows inside one large "controller" hook when they can be separated clearly.
9. Add or update tests for hooks containing meaningful business or UI logic.

## Server state architecture

The application uses:

- `@tanstack/react-query` as the remote request/cache foundation;
- `@tanstack/query-db-collection` to connect suitable queries to collections;
- `@tanstack/react-db` as the preferred reactive read model for core domain entities.

Do not treat React Query and React DB as competing alternatives. They serve different layers.

### TanStack DB collections

Core domain entities that are repeatedly queried and observed throughout the application should normally use TanStack DB collections.

Existing examples include:

- projects;
- project categories;
- project requirements.

When adding another comparable domain resource, first consider whether it belongs in `src/api/collections`.

A query-backed collection should normally:

1. use `createCollection`;
2. use `queryCollectionOptions`;
3. use the shared `queryClient`;
4. use the corresponding generated query key where available;
5. call a hand-written domain-facing API wrapper;
6. define a stable `getKey`;
7. use the appropriate Zod schema;
8. have a stable, descriptive collection ID.

### Scoped collections

For collections scoped by values such as `projectId`:

1. create a collection factory;
2. cache the resulting collection by scope identifier;
3. return the same collection instance for the same identifier;
4. do not construct a new collection on each component render.

Follow the existing category and requirement collection patterns.

### Reading collection-backed data

Prefer `useLiveQuery` when reading data represented by a TanStack DB collection.

Use React DB query operators such as `eq` where they make the query clearer.

For route-scoped collections:

- resolve the collection from its factory;
- keep its identity stable, typically with `useMemo`;
- include collection/identifier dependencies in `useLiveQuery`.

Do not copy collection contents into another global store.

Do not add a parallel `useQuery` read path for an entity already represented by a collection unless there is a concrete architectural reason.

### When direct React Query is appropriate

Direct `useQuery` is appropriate for data that is not currently modeled as a long-lived collection, particularly:

- transient operation data;
- review summaries;
- review comments;
- administration-specific datasets;
- session information;
- resources with no meaningful shared reactive identity.

The existing administration and review code are valid examples.

Do not create a TanStack DB collection merely because a request returns an array.

Use a collection when reactive identity, repeated domain access, or cross-feature observation makes it useful.

### Mutations

Mutations currently use several appropriate mechanisms:

- API wrapper calls from `useActionState`;
- `useMutation`;
- focused mutation-runner hooks.

Follow the established pattern of the feature you are modifying unless there is a concrete reason to improve it.

After a successful mutation:

1. identify which query-backed collections or direct queries are stale;
2. invalidate the narrowest relevant generated/custom query key;
3. let the collection refresh through its React Query backing where applicable;
4. update explicit React Query cache data only when that is clearer and safer than invalidation;
5. keep UI side effects such as navigation, toast messages, and dialog closing explicit.

Do not broadly invalidate unrelated queries.

Do not maintain a separate manual copy of collection-backed server data.

## API layer

The API layer deliberately has both generated and hand-written code.

### Generated API code

`src/api/generated` is generated by Orval.

Never manually edit it.

When the backend OpenAPI contract changes:

1. run `pnpm api:generate`;
2. inspect the generated diff;
3. update hand-written API wrappers as required;
4. update collections, hooks, components, and tests affected by changed types or behavior.

The Orval configuration generates:

- React Query clients;
- model types;
- Zod schemas.

### Hand-written API wrappers

Files such as:

- `projectsApi.ts`;
- `categoriesApi.ts`;
- `requirementsApi.ts`;
- `reviewApi.ts`;
- `authApi.ts`

form the application-facing API layer.

Use these wrappers when they already exist instead of importing generated endpoint functions directly throughout UI code.

Hand-written wrappers may:

- adapt generated DTO shapes into frontend domain shapes;
- validate responses with Zod;
- expose stable application-facing request functions;
- centralize query keys or schemas;
- hide generated naming/details from UI code.

Do not bypass an existing wrapper without a concrete reason.

### Fetch behavior

All generated API requests use the custom `apiFetch` mutator.

Preserve this path so requests retain:

- API base URL handling;
- access-token headers;
- JSON response handling;
- authentication-failure behavior;
- typed `ApiError` subclasses.

Do not introduce raw `fetch` calls in feature code when the API infrastructure can represent the request.

## Runtime validation and Zod

The frontend uses Zod both for generated API schemas and hand-written frontend validation.

1. Parse important API results using the established domain-facing schemas.
2. Do not rely solely on TypeScript types for untrusted server or form data.
3. Keep frontend form validation separate from backend security enforcement.
4. Reuse generated Zod schemas where they accurately represent the required contract.
5. Add hand-written schemas when the frontend domain model or form model differs from the generated transport type.
6. Prefer `safeParse` for user-input validation where field-level errors must be presented.

## Forms

The application uses React 19 `useActionState` for several forms.

When working on an existing form that uses this pattern:

1. preserve the `useActionState` architecture unless there is a specific reason to change it;
2. parse `FormData` explicitly;
3. validate with Zod before submitting;
4. return field errors separately from form-level errors;
5. prevent route incompleteness from becoming an unhandled exception;
6. keep mutation/invalidation logic in the feature action hook;
7. keep presentation in the form component.

Do not introduce a second form library solely for a new feature when the existing patterns are sufficient.

For complex forms, prefer the established separation:

- `*Form.tsx` for presentation;
- `*FormTypes.ts` for form state/types;
- `*FormValidation.ts` for validation;
- `use*FormAction.ts` for submission;
- `use*FormData.ts` for collection/query-backed data;
- `use*FormNavigation.ts` for navigation/dirty-state behavior;
- `use*FormRoute.ts` for route interpretation;
- `use*FormController.ts` for composition when needed.

Do not create all of these files mechanically for a small form. Use them when responsibilities justify the split.

## Client-only state and TanStack Store

Client-only cross-cutting state uses `@tanstack/react-store`.

Existing examples include:

- authentication state;
- tab-bar state;
- action-bar state;
- toast state.

Use a store when state:

- is not canonical backend data;
- is shared across unrelated parts of the component tree;
- has meaningful application-wide lifecycle behavior.

Do not use stores to duplicate data already owned by TanStack DB or React Query.

When modifying a store:

1. keep the state model focused;
2. expose named operations rather than spreading state manipulation throughout components;
3. keep reset behavior explicit;
4. consider logout/authentication-failure cleanup;
5. preserve immutable update patterns;
6. update store tests when behavior changes.

## Authentication and authorization

Authentication and authorization have dedicated infrastructure under `src/auth`.

Reuse it.

### Authentication

Preserve:

- `ProtectedRoute`;
- authentication-failure handling;
- auth store lifecycle;
- access-token propagation through `apiFetch`.

A `401` is globally significant because `apiFetch` invokes authentication-failure handling.

Do not add feature-local `401` handling that conflicts with this behavior.

Authentication failure clears cached server state. Keep this in mind when adding stateful infrastructure.

### Authorization

Use:

- `AdministratorRoute`;
- `ProjectPermissionRoute`;
- global permission helpers;
- project permission helpers;
- role metadata.

Do not reproduce permission rules with ad hoc role-string comparisons inside feature components.

For permission-dependent UI:

- use named permission predicates;
- hide or disable actions consistently with the existing feature;
- remember that frontend permission handling is UX only;
- backend authorization remains the security boundary.

When permissions change, test both allowed and denied UI behavior where relevant.

## Routing

Use the established React Router architecture.

1. Put route definitions in the router layer.
2. Reuse helpers from `src/router/projectRoutes.ts` instead of manually constructing project/category/requirement URLs throughout feature code.
3. Add new route helpers when a route is reused in multiple places.
4. Preserve route parameter semantics.
5. Page components should own route-level orchestration, not duplicate low-level route parsing across child components.
6. When changing routes, update:
    - navigation;
    - close/back helpers;
    - tab behavior;
    - route guards;
    - unit tests;
    - E2E tests.

## Route UI metadata

The application uses route handles and `useRouteUiMetadata` to configure shell behavior such as ActionBar state.

When adding or changing a route:

1. determine whether it needs an `actionBar` handle;
2. determine whether chrome actions should be disabled;
3. update `ActionBarKind` and its configuration if introducing a genuinely new route UI mode;
4. do not infer shell behavior from brittle pathname string checks when route metadata can express it.

## Tabs and application shell

The RootLayout contains coordinated application-shell behavior:

- Sidebar;
- TabBar;
- ActionBar;
- account menu;
- loading overlay.

Treat these as shared shell infrastructure.

When changing feature navigation, consider:

- whether a tab should open or activate;
- what route should become active;
- whether the active project changes;
- whether actions are available for the active route;
- what happens when a tab is closed.

Do not implement feature-specific shell behavior independently if the existing stores/router metadata can represent it.

## Styling and SCSS

Before adding styles, inspect `src/styles`.

The repository already defines shared:

- colors;
- typography;
- UI tokens;
- mixins;
- toast styles;
- reset styles.

When creating or modifying component SCSS:

1. reuse existing tokens and mixins before adding new ones;
2. use shared color variables/tokens;
3. use shared typography/font-size variables/tokens;
4. prefer component-scoped selectors;
5. avoid global selectors unless modifying intentional global behavior;
6. avoid excessive selector specificity;
7. avoid `!important` unless required to override external library behavior that cannot reasonably be handled another way;
8. consider all consumers before modifying a shared token or mixin;
9. preserve responsive behavior.

Do not create a new shared token merely to avoid using an appropriate existing value.

Conversely, do not force an unrelated existing token into a new semantic purpose purely to avoid adding one.

## PrimeReact

PrimeReact is the main component library.

Before implementing a custom control, check whether:

- PrimeReact already provides it;
- the repository has an application-specific wrapper/component;
- an existing component establishes the interaction pattern.

Preserve project-specific styling and accessibility rather than using raw PrimeReact defaults inconsistently.

## Accessibility

Treat accessibility as part of correctness.

1. Prefer semantic HTML.
2. Ensure interactive controls have accessible names.
3. Associate labels with form fields.
4. Preserve keyboard operation.
5. Prefer proper `button` and `a` elements over clickable generic elements.
6. Do not convey meaning through color alone.
7. Use ARIA only when native semantics are insufficient.
8. Keep dialog and navigation focus behavior sensible.
9. When disabling an action, ensure the reason remains understandable where appropriate.
10. Prefer tests using accessible roles, names, labels, and visible text.

## Unit and component tests

Unit/component tests use Vitest, Testing Library, and jsdom.

Tests live under `test/**/*.spec.ts` and `test/**/*.spec.tsx`.

When changing behavior:

1. update or add relevant tests;
2. keep tests isolated;
3. mock API/infrastructure where appropriate;
4. test behavior rather than component internals;
5. prefer queries by:
    - role;
    - accessible name;
    - label;
    - visible text;

6. avoid CSS selectors and incidental DOM structure when a semantic locator exists;
7. cover failure states where meaningful;
8. add regression tests for bug fixes;
9. do not weaken assertions simply to make a test pass.

If Vitest reports an individual test as unusually slow, investigate when the effort is proportionate.

### Component coverage

Components with meaningful behavior should normally have direct or higher-level test coverage.

A tiny purely presentational component does not require a dedicated spec when meaningful behavior is already covered through its parent feature.

Do not create trivial tests merely to satisfy a "one test file per component" rule.

### Coverage

Aim for at least `75%` unit/component coverage for code included in the configured coverage calculation.

If coverage is below that level:

1. determine whether meaningful tests should be added;
2. add them when they protect useful behavior;
3. do not add meaningless tests solely to improve the number;
4. report a remaining meaningful gap at the end.

## E2E / feature tests

E2E tests use Playwright BDD.

Feature files are under:

`test/e2e/features`

Step definitions are under:

`test/e2e/steps`

Support/fixtures are under:

`test/e2e/support`.

### Real backend

E2E tests should use the real backend for application workflows.

The repository already contains real-backend support helpers and fixtures.

Do not replace a real-backend scenario with mocked browser API responses merely because mocking is easier.

A backend mock is acceptable only when:

- the real backend genuinely cannot produce the scenario;
- the mock provides a substantial simplification;
- the test remains meaningful.

Remove temporary mocks once the real backend supports the workflow.

### Execution model

Playwright is intentionally configured with:

- `fullyParallel: false`;
- `workers: 1`.

Do not enable parallel execution casually.

The tests interact with persistent shared backend state and are not currently designed around parallel database isolation.

If parallelization is desired, isolate test data and backend state first.

### Test data

Use the existing support helpers and fixtures for:

- projects;
- categories;
- requirements;
- memberships;
- authentication.

Use unique persistent data where collisions are possible.

Keep scenarios deterministic and independent of stale local data.

### Locators

Prefer:

- role;
- accessible name;
- label;
- visible text.

Avoid selectors based on CSS classes or incidental DOM structure.

When changing text, labels, routes, or UI semantics, inspect relevant feature files and step definitions for stale locators.

### Generated BDD tests

Never manually edit:

`test/e2e/.features-gen`

Regenerate them through the normal E2E workflow.

## Generated and derived files

Do not manually modify:

- `src/api/generated`;
- `test/e2e/.features-gen`;
- `coverage`;
- `playwright-report`;
- `cucumber-report`;
- `test-results`;
- `vitest-json-report.json`;
- `dist`.

These are generated or derived outputs.

Do not use "everything in `.gitignore`" as the definition of untouchable files. `.gitignore` describes version-control behavior, not architectural ownership.

## Dependency changes

Do not add a new dependency when the existing stack can reasonably solve the problem.

Before adding one, check whether the functionality already exists in:

- React;
- React Router;
- TanStack DB;
- TanStack Query;
- TanStack Store;
- Zod;
- PrimeReact;
- existing project utilities.

If a new dependency is genuinely needed:

1. use `pnpm`;
2. keep its purpose narrow;
3. avoid overlapping state/data/UI libraries without a strong reason;
4. report the dependency addition at the end.

## Finish work rules

After implementing a change, run validation appropriate to the affected scope.

### Always run

1. Format:
   `pnpm format`

2. Lint:
   `pnpm lint`

3. Build:
   `pnpm build`

`pnpm build` already performs the application TypeScript check before the Vite build.

Do not substitute the repository's `typecheck` script for the normal application build; its current configuration targets `tsconfig.node.json` and redirects output to `output.txt`.

### Unit/component tests

For changes to production TypeScript/React behavior, run:

`pnpm test:unit:coverage`

Fix regressions caused by your work.

### E2E tests

Run:

`pnpm test:e2e`

when the change affects meaningful user workflows, including:

- routing;
- authentication;
- authorization;
- projects;
- categories;
- requirements;
- administration;
- shell/navigation behavior;
- backend-integrated forms;
- API interaction covered by feature tests.

Small internal refactors with unchanged observable behavior do not necessarily require the complete E2E suite.

### API generation

Run:

`pnpm api:generate`

when the backend OpenAPI contract changed or generated client output needs regeneration.

Never manually repair generated files.

### Documentation

Run:

`pnpm docs`

when exported documented application APIs changed substantially or when the requested work specifically concerns generated documentation.

Do not require documentation generation for every trivial implementation change.

### Re-run after generated changes

If formatting, API generation, or another command changes tracked source files, inspect the diff and rerun the relevant validation commands.

### Failures

Do not claim the work is complete when a relevant command fails.

- Fix failures caused by the implementation.
- Distinguish unrelated pre-existing failures clearly.
- Do not silence or weaken tests/lint rules merely to obtain a green run.

## Completion report

At the end of substantial work, report:

1. files changed;
2. user-visible behavior changed;
3. tests added or updated;
4. generated API changes, if any;
5. relevant commands run and their results;
6. noteworthy complexity changes;
7. dependencies added, if any;
8. unresolved concerns or assumptions.
