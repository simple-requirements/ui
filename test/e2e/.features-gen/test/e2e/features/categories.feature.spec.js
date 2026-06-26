// Generated from: test/e2e/features/categories.feature
import { test } from "playwright-bdd";

test.describe('Categories', () => {

  test('New Category form has aligned fields and category type options', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I "click" on the "Categories" button', null, { page }); 
    await And('I "click" on the "New category" button', null, { page }); 
    await Then('the "Category key" field in the "New Category" form is labelled', null, { page }); 
    await And('the "Category name" field in the "New Category" form is labelled', null, { page }); 
    await And('the "Category type" radio group in the "New Category" form is labelled', null, { page }); 
    await When('I select "Non-functional (NFR)" in the "New Category" form', null, { page }); 
    await Then('only "Non-functional (NFR)" is selected in the "New Category" form', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, request }) => $runScenarioHooks('before', { request }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/categories.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I \"click\" on the \"Categories\" button","stepMatchArguments":[{"group":{"start":2,"value":"\"click\"","children":[{"start":3,"value":"click","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":17,"value":"\"Categories\"","children":[{"start":18,"value":"Categories","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"And I \"click\" on the \"New category\" button","stepMatchArguments":[{"group":{"start":2,"value":"\"click\"","children":[{"start":3,"value":"click","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":17,"value":"\"New category\"","children":[{"start":18,"value":"New category","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then the \"Category key\" field in the \"New Category\" form is labelled","stepMatchArguments":[{"group":{"start":4,"value":"\"Category key\"","children":[{"start":5,"value":"Category key","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":32,"value":"\"New Category\"","children":[{"start":33,"value":"New Category","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And the \"Category name\" field in the \"New Category\" form is labelled","stepMatchArguments":[{"group":{"start":4,"value":"\"Category name\"","children":[{"start":5,"value":"Category name","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":33,"value":"\"New Category\"","children":[{"start":34,"value":"New Category","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And the \"Category type\" radio group in the \"New Category\" form is labelled","stepMatchArguments":[{"group":{"start":4,"value":"\"Category type\"","children":[{"start":5,"value":"Category type","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":39,"value":"\"New Category\"","children":[{"start":40,"value":"New Category","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I select \"Non-functional (NFR)\" in the \"New Category\" form","stepMatchArguments":[{"group":{"start":9,"value":"\"Non-functional (NFR)\"","children":[{"start":10,"value":"Non-functional (NFR)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":39,"value":"\"New Category\"","children":[{"start":40,"value":"New Category","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then only \"Non-functional (NFR)\" is selected in the \"New Category\" form","stepMatchArguments":[{"group":{"start":5,"value":"\"Non-functional (NFR)\"","children":[{"start":6,"value":"Non-functional (NFR)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":47,"value":"\"New Category\"","children":[{"start":48,"value":"New Category","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end