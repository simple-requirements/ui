// Generated from: test/e2e/features/layout.feature
import { test } from "playwright-bdd";

test.describe('Demo layout prototype', () => {

  test('Startup renders projects and opens a requirement tab', async ({ Given, When, Then, And, page }) => { 
    await Given('I open the demo workspace', null, { page }); 
    await Then('the startup overlay disappears', null, { page }); 
    await And('8 demo projects are visible', null, { page }); 
    await When('I double click the first requirement', null, { page }); 
    await Then('1 dedicated requirement tab is visible', null, { page }); 
  });

  test('Workspace controls and New Requirement form remain aligned', async ({ Given, When, Then, page }) => { 
    await Given('I open the demo workspace', null, { page }); 
    await Then('the startup overlay disappears', null, { page }); 
    await Then('the New Project button label is centered', null, { page }); 
    await When('I open a new requirement form', null, { page }); 
    await Then('the complete New Requirement form is visible without pane-level scroll glitches', null, { page }); 
  });

  test('New Project form uses safe errors and stable responsive layout', async ({ Given, When, Then, And, page }) => { 
    await Given('I open the demo workspace', null, { page }); 
    await Then('the startup overlay disappears', null, { page }); 
    await When('I open a new project form', null, { page }); 
    await Then('the New Project form matches the desktop snapshot', null, { page }); 
    await When('I submit the New Project form with "Contract Gap Project"', null, { page }); 
    await Then('project creation shows a safe unavailable error', null, { page }); 
    await And('the New Project error state matches the desktop snapshot', null, { page }); 
    await When('I resize the viewport to 1024 by 768', null, { page }); 
    await Then('the New Project form matches the narrow snapshot', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/layout.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":2,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":3,"keywordType":"Context","textWithKeyword":"Given I open the demo workspace","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":4,"keywordType":"Outcome","textWithKeyword":"Then the startup overlay disappears","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":5,"keywordType":"Outcome","textWithKeyword":"And 8 demo projects are visible","stepMatchArguments":[{"group":{"start":0,"value":"8"},"parameterTypeName":"int"}]},{"pwStepLine":10,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I double click the first requirement","stepMatchArguments":[{"group":{"start":19,"value":"first"},"parameterTypeName":"word"}]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then 1 dedicated requirement tab is visible","stepMatchArguments":[{"group":{"start":0,"value":"1"},"parameterTypeName":"int"}]}]},
  {"pwTestLine":14,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"Given I open the demo workspace","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then the startup overlay disappears","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then the New Project button label is centered","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I open a new requirement form","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then the complete New Requirement form is visible without pane-level scroll glitches","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":23,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Given I open the demo workspace","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then the startup overlay disappears","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I open a new project form","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then the New Project form matches the desktop snapshot","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"When I submit the New Project form with \"Contract Gap Project\"","stepMatchArguments":[{"group":{"start":35,"value":"\"Contract Gap Project\"","children":[{"start":36,"value":"Contract Gap Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then project creation shows a safe unavailable error","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"And the New Project error state matches the desktop snapshot","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I resize the viewport to 1024 by 768","stepMatchArguments":[{"group":{"start":25,"value":"1024"},"parameterTypeName":"int"},{"group":{"start":33,"value":"768"},"parameterTypeName":"int"}]},{"pwStepLine":31,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the New Project form matches the narrow snapshot","stepMatchArguments":[]}]},
]; // bdd-data-end