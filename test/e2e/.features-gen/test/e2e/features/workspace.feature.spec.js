// Generated from: test/e2e/features/workspace.feature
import { test } from "playwright-bdd";

test.describe('Workspace shell', () => {

  test('The loading overlay is visible during startup', async ({ Given, Then, page }) => { 
    await Given('the workspace application is starting', null, { page }); 
    await Then('the loading overlay is visible', null, { page }); 
  });

  test('The first project in the list is automatically selected', async ({ Given, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await Then('the first project in the list is selected', null, { page }); 
    await And('the "Requirements" action is selected', null, { page }); 
    await And('the first requirement is selected', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, request }) => $runScenarioHooks('before', { request }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/workspace.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the workspace application is starting","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Outcome","textWithKeyword":"Then the loading overlay is visible","stepMatchArguments":[]}]},
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then the first project in the list is selected","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And the \"Requirements\" action is selected","stepMatchArguments":[{"group":{"start":4,"value":"\"Requirements\"","children":[{"start":5,"value":"Requirements","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And the first requirement is selected","stepMatchArguments":[]}]},
]; // bdd-data-end