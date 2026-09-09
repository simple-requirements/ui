// Generated from: test/e2e/features/bootstrap.feature
import { test } from "playwright-bdd";

test.describe('Initial Administrator bootstrap', () => {

  test('First startup offers initial Administrator registration', { tag: ['@bootstrap'] }, async ({ Given, When, Then, page }) => { 
    await Given('initial Administrator bootstrap is available to the frontend', null, { page }); 
    await When('I open the frontend authentication entry', null, { page }); 
    await Then('the initial Administrator form should be visible', null, { page }); 
  });

  test('Initial Administrator registration requires email verification', { tag: ['@bootstrap'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('initial Administrator bootstrap is available to the frontend', null, { page }); 
    await When('I open the frontend authentication entry', null, { page }); 
    await And('I register the initial Administrator through the frontend', null, { page }); 
    await Then('the initial Administrator email-verification instruction should be visible', null, { page }); 
    await When('I continue from initial Administrator registration', null, { page }); 
    await Then('the frontend login page should be visible', null, { page }); 
  });

  test('A concurrent bootstrap completion switches to normal login', { tag: ['@bootstrap'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('initial Administrator bootstrap becomes unavailable during frontend registration', null, { page }); 
    await When('I open the frontend authentication entry', null, { page }); 
    await And('I register the initial Administrator through the frontend', null, { page }); 
    await Then('the frontend login page should be visible', null, { page }); 
    await And('the completed-bootstrap notice should be visible', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/bootstrap.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":["@bootstrap"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given initial Administrator bootstrap is available to the frontend","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I open the frontend authentication entry","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then the initial Administrator form should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":9,"tags":["@bootstrap"],"steps":[{"pwStepLine":13,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"Given initial Administrator bootstrap is available to the frontend","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I open the frontend authentication entry","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"And I register the initial Administrator through the frontend","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the initial Administrator email-verification instruction should be visible","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I continue from initial Administrator registration","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the frontend login page should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":17,"tags":["@bootstrap"],"steps":[{"pwStepLine":22,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"Given initial Administrator bootstrap becomes unavailable during frontend registration","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I open the frontend authentication entry","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"And I register the initial Administrator through the frontend","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then the frontend login page should be visible","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And the completed-bootstrap notice should be visible","stepMatchArguments":[]}]},
]; // bdd-data-end