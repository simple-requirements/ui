# Rules

## Common rules

1. Inspect the existing repository and all applicable `AGENTS.md` files first.

### Source code documentation

1. Keep source code documentation always concise and meaningful.
2. Add TypeDoc documentation to every function.
    - Use explainations and examples only if a function is very complex.
    - For a simple function just document their parameters, return value and one concise sentens about what this function does.
3. Add TypeDoc to every component.
4. Add TypeDoc like documentation to each store under ./src/stores.
    - Just describe what purpose this store serves.
    - Do not use any TypeDoc tags

### Code complexity metrics

Use Cyclomatic Complexity and Halstead Volume as maintainability signals, not as absolute pass/fail quality scores.

#### Cyclomatic Complexity

For Cyclomatic Complexitiy these rules apply:

- Prefer Cyclomatic Complexity below `10` for a single function.
- A function above `10` should be reviewed for extraction.
- A function above `15` should normally be refactored before adding more behavior.
- A React component above `20` should be split unless there is a clear reason not to.
- Do not add new branches to an already high-complexity function without first considering a helper, hook, or child component.


Prefere these refactorings if the Cyclomatic Complexity is too high:

- Extract validation logic into pure helper functions.
- Extract permission checks into `src/auth/*`.
- Extract mutation/query handling into hooks.
- Extract repeated rendering branches into child components.
- Replace repeated conditional UI rules with named predicates.

#### Halstead Volum

For the Halstead Volume these rules apply:

- Below `1000`: usually fine.
- `1000–3000`: acceptable, but review if the file changes often.
- `3000–6000`: likely contains multiple responsibilities; consider extraction.
- Above `6000`: strong refactoring candidate, especially if Cyclomatic Complexity is also high.
- Do not chase a lower Halstead number by creating tiny artificial files.
- Refactor only when extraction improves readability, testability, or separation of concerns.

Prioritize refactoring when all three are true:

1. Halstead Volume is high.
2. Cyclomatic Complexity is high.
3. The file is frequently changed or bug-prone.

#### Preferred extraction patterns

For page-level React components:

- Keep route params, redirects, and page composition in the page component.
- Move API query loading into `use*Queries` hooks.
- Move mutations into `use*Mutation` or `use*MutationRunner` hooks.
- Move forms into dedicated `*Form.tsx` components.
- Move form state into `use*Form` hooks.
- Move display-only sections into small presentational components.
- Move formatting helpers into `src/utils/*`.
- Move permission logic into `src/auth/*`.

#### When not to refactor

Do not refactor only to satisfy a metric when:

- the code is clear and stable;
- the file is generated;
- the change would make navigation harder;
- the extraction would create unnecessary indirection;
- tests are missing and the refactor is not trivial;
- the file is about to be replaced by planned feature work.

### Do not touch

You should never change the files in one of these directories:

- ./test/e2e/.features-gen
- ./src/api/generated
- All directories listed in the .gitignore file

## Creating React components

When you create a React component you should:

1. Always use the @ alias when importing files into the component.
2. Remember the \*Single file responsibility`paradigm which means that each component should have one responsibility only.
    - If a component has more than one responsibility then thoroughly check whether a refactoring makes sense.
    - If a refactoring makes sense then do it.

## Creating React hooks

When you create a React hook the same rules apply as when you create a React component.

## Creating SCSS files

### SCSS files for components

When you create a SCSS file for a component you should:

1. Always check whether there are classes, variables, mixins or other already defined things in ./src/styles/\*.scss.
    - If there are such things do not create new styles.
    - If it is necessary to create a new style then update the style in ./src/styles but thoroughly check whether that makes unwanted changes to other components.
2. Use variables for colors.
3. Use variables for font-sizes.

## Finish work rules

After you have finished your work you should:

1. Execute the linter with `pnpm lint` or `npx eslint .`.
2. Execute the formatter with `pnpm format` or `npx prettier --write .`
3. Create the source code documentation with `pnpm docs` or `npx typedoc`
4. Do a type check with `tsc --noEmit -p tsconfig.node.json --composite false`.
    - If there are any error you have to fix them before the work is done.
    - When you are done with fixing the type errors start with step 1 of _Finish work rules_ again.
5. Calculate these code complexity metrics and report them to me:
    - Cyclomatic Complexity
    - Halstead Volume
