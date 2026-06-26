// Generated from: test/e2e/features/projects.feature
import { test } from "playwright-bdd";

test.describe('Projects', () => {

  test('Selecting a project from the sidebar', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I "click" on "Customer Portal" project', null, { page }); 
    await Then('the "Customer Portal" project is selected', null, { page }); 
    await And('the first requirement is selected', null, { page }); 
  });

  test('Startup renders projects and opens a requirement tab', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await And('8 projects are visible', null, { page }); 
    await When('I "double click" on the 1st requirement', null, { page }); 
    await Then('1 dedicated requirement tab is visible', null, { page }); 
  });

  test('New Project panel can be cancelled', async ({ Given, When, Then, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I "click" on the "New Project" button', null, { page }); 
    await Then('the "New Project" form controls are aligned', null, { page }); 
    await When('I cancel the "New Project" form', null, { page }); 
    await Then('the "New Project" form is closed', null, { page }); 
  });

  test('New Project form reports an empty name', async ({ Given, When, Then, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I "click" on the "New Project" button', null, { page }); 
    await Then('the "New Project" form controls are aligned', null, { page }); 
    await When('I click "Create" in the "New Project" form', null, { page }); 
    await Then('the "Project name" field reports a missing value in the "New Project" form', null, { page }); 
  });

  test('New Project form creates a backend project', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I "click" on the "New Project" button', null, { page }); 
    await Then('the "New Project" form controls are aligned', null, { page }); 
    await When('I fill the "Project name" field in the "New Project" form with "Test project"', null, { page }); 
    await And('I click "Create" in the "New Project" form', null, { page }); 
    await Then('the "Test project" project is visible in the sidebar', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, request }) => $runScenarioHooks('before', { request }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/projects.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I \"click\" on \"Customer Portal\" project","stepMatchArguments":[{"group":{"start":2,"value":"\"click\"","children":[{"start":3,"value":"click","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":13,"value":"\"Customer Portal\"","children":[{"start":14,"value":"Customer Portal","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then the \"Customer Portal\" project is selected","stepMatchArguments":[{"group":{"start":4,"value":"\"Customer Portal\"","children":[{"start":5,"value":"Customer Portal","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And the first requirement is selected","stepMatchArguments":[]}]},
  {"pwTestLine":13,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"And 8 projects are visible","stepMatchArguments":[{"group":{"start":0,"value":"8"},"parameterTypeName":"int"}]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I \"double click\" on the 1st requirement","stepMatchArguments":[{"group":{"start":2,"value":"\"double click\"","children":[{"start":3,"value":"double click","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":24,"value":"1"},"parameterTypeName":"int"}]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then 1 dedicated requirement tab is visible","stepMatchArguments":[{"group":{"start":0,"value":"1"},"parameterTypeName":"int"}]}]},
  {"pwTestLine":20,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":21,"gherkinStepLine":20,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"When I \"click\" on the \"New Project\" button","stepMatchArguments":[{"group":{"start":2,"value":"\"click\"","children":[{"start":3,"value":"click","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":17,"value":"\"New Project\"","children":[{"start":18,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then the \"New Project\" form controls are aligned","stepMatchArguments":[{"group":{"start":4,"value":"\"New Project\"","children":[{"start":5,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I cancel the \"New Project\" form","stepMatchArguments":[{"group":{"start":13,"value":"\"New Project\"","children":[{"start":14,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then the \"New Project\" form is closed","stepMatchArguments":[{"group":{"start":4,"value":"\"New Project\"","children":[{"start":5,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":28,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":29,"gherkinStepLine":28,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"When I \"click\" on the \"New Project\" button","stepMatchArguments":[{"group":{"start":2,"value":"\"click\"","children":[{"start":3,"value":"click","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":17,"value":"\"New Project\"","children":[{"start":18,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"Then the \"New Project\" form controls are aligned","stepMatchArguments":[{"group":{"start":4,"value":"\"New Project\"","children":[{"start":5,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"When I click \"Create\" in the \"New Project\" form","stepMatchArguments":[{"group":{"start":8,"value":"\"Create\"","children":[{"start":9,"value":"Create","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":24,"value":"\"New Project\"","children":[{"start":25,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":33,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then the \"Project name\" field reports a missing value in the \"New Project\" form","stepMatchArguments":[{"group":{"start":4,"value":"\"Project name\"","children":[{"start":5,"value":"Project name","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":56,"value":"\"New Project\"","children":[{"start":57,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":36,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":37,"gherkinStepLine":36,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"When I \"click\" on the \"New Project\" button","stepMatchArguments":[{"group":{"start":2,"value":"\"click\"","children":[{"start":3,"value":"click","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":17,"value":"\"New Project\"","children":[{"start":18,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then the \"New Project\" form controls are aligned","stepMatchArguments":[{"group":{"start":4,"value":"\"New Project\"","children":[{"start":5,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":39,"keywordType":"Action","textWithKeyword":"When I fill the \"Project name\" field in the \"New Project\" form with \"Test project\"","stepMatchArguments":[{"group":{"start":11,"value":"\"Project name\"","children":[{"start":12,"value":"Project name","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":39,"value":"\"New Project\"","children":[{"start":40,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":63,"value":"\"Test project\"","children":[{"start":64,"value":"Test project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"And I click \"Create\" in the \"New Project\" form","stepMatchArguments":[{"group":{"start":8,"value":"\"Create\"","children":[{"start":9,"value":"Create","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":24,"value":"\"New Project\"","children":[{"start":25,"value":"New Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the \"Test project\" project is visible in the sidebar","stepMatchArguments":[{"group":{"start":4,"value":"\"Test project\"","children":[{"start":5,"value":"Test project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end