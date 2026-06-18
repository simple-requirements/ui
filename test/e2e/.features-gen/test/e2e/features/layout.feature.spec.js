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

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/layout.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":2,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":3,"keywordType":"Context","textWithKeyword":"Given I open the demo workspace","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":4,"keywordType":"Outcome","textWithKeyword":"Then the startup overlay disappears","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":5,"keywordType":"Outcome","textWithKeyword":"And 8 demo projects are visible","stepMatchArguments":[{"group":{"start":0,"value":"8"},"parameterTypeName":"int"}]},{"pwStepLine":10,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I double click the first requirement","stepMatchArguments":[{"group":{"start":19,"value":"first"},"parameterTypeName":"word"}]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then 1 dedicated requirement tab is visible","stepMatchArguments":[{"group":{"start":0,"value":"1"},"parameterTypeName":"int"}]}]},
]; // bdd-data-end