// Generated from: test/e2e/features/user-administration.feature
import { test } from "playwright-bdd";

test.describe('User administration', () => {

  test('Open user administration details', { tag: ['@frontend-real-backend'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('a real frontend Administrator session is available'); 
    await When('I open frontend user administration as a real Administrator', null, { page }); 
    await And('I select the Administrator user', null, { page }); 
    await Then('the selected user account details should be visible', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/user-administration.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":5,"tags":["@frontend-real-backend"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given a real frontend Administrator session is available","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I open frontend user administration as a real Administrator","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"And I select the Administrator user","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then the selected user account details should be visible","stepMatchArguments":[]}]},
]; // bdd-data-end