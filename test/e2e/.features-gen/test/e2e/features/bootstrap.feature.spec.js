// Generated from: test/e2e/features/bootstrap.feature
import { test } from "playwright-bdd";

test.describe('Initial Administrator bootstrap', () => {

  test('Authentication entry reflects the real bootstrap status', { tag: ['@bootstrap'] }, async ({ Given, When, Then, page }) => { 
    await Given('the real bootstrap API is available'); 
    await When('I open the frontend authentication entry', null, { page }); 
    await Then('either the initial Administrator form or the sign-in form should be visible', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/bootstrap.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":["@bootstrap"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the real bootstrap API is available","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I open the frontend authentication entry","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then either the initial Administrator form or the sign-in form should be visible","stepMatchArguments":[]}]},
]; // bdd-data-end