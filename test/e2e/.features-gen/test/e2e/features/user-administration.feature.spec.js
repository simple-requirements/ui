// Generated from: test/e2e/features/user-administration.feature
import { test } from "playwright-bdd";

test.describe('User and session administration', () => {

  test('Activate a verified user and revoke a session', { tag: ['@user-administration'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('the frontend user-administration API is available', null, { page }); 
    await When('I sign in as a frontend Administrator', null, { page }); 
    await And('I open frontend user administration', null, { page }); 
    await And('I select the pending user', null, { page }); 
    await And('I activate the selected user', null, { page }); 
    await Then('the user should be active in frontend administration', null, { page }); 
    await When('I revoke the selected user\'s active session', null, { page }); 
    await Then('the session should be shown as revoked', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/user-administration.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":5,"tags":["@user-administration"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the frontend user-administration API is available","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I sign in as a frontend Administrator","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"And I open frontend user administration","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I select the pending user","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I activate the selected user","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then the user should be active in frontend administration","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When I revoke the selected user's active session","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the session should be shown as revoked","stepMatchArguments":[]}]},
]; // bdd-data-end