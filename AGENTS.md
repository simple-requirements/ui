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
