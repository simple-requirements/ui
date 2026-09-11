// Generated from: test/e2e/features/authentication.feature
import { test } from "playwright-bdd";

test.describe('Frontend authentication session', () => {

  test('Protected application routes require authentication', { tag: ['@authentication'] }, async ({ Given, When, Then, page }) => { 
    await Given('initial Administrator bootstrap is complete for frontend authentication'); 
    await When('I navigate to a protected frontend route', null, { page }); 
    await Then('the frontend login page should be visible', null, { page }); 
  });

  test('User signs in and returns to the requested route', { tag: ['@authentication'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('the frontend authentication API accepts valid credentials'); 
    await When('I navigate to a protected frontend route', null, { page }); 
    await And('I sign in through the frontend', null, { page }); 
    await Then('the requested protected route should be visible', null, { page }); 
    await And('authenticated frontend requests should contain the bearer token'); 
  });

  test('User signs out', { tag: ['@authentication'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('I am signed in through the frontend', null, { page }); 
    await When('I sign out through the frontend', null, { page }); 
    await Then('the frontend login page should be visible', null, { page }); 
    await And('the frontend logout endpoint should have been called'); 
  });

  test('Reloading the SPA loses its in-memory session', { tag: ['@authentication'] }, async ({ Given, When, Then, page }) => { 
    await Given('I am signed in through the frontend', null, { page }); 
    await When('I reload the authenticated frontend', null, { page }); 
    await Then('the frontend login page should be visible', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/authentication.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":["@authentication"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given initial Administrator bootstrap is complete for frontend authentication","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I navigate to a protected frontend route","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then the frontend login page should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":9,"tags":["@authentication"],"steps":[{"pwStepLine":13,"gherkinStepLine":10,"keywordType":"Context","textWithKeyword":"Given the frontend authentication API accepts valid credentials","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I navigate to a protected frontend route","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"And I sign in through the frontend","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the requested protected route should be visible","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And authenticated frontend requests should contain the bearer token","stepMatchArguments":[]}]},
  {"pwTestLine":20,"pickleLine":16,"tags":["@authentication"],"steps":[{"pwStepLine":21,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Given I am signed in through the frontend","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I sign out through the frontend","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the frontend login page should be visible","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And the frontend logout endpoint should have been called","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":22,"tags":["@authentication"],"steps":[{"pwStepLine":28,"gherkinStepLine":23,"keywordType":"Context","textWithKeyword":"Given I am signed in through the frontend","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I reload the authenticated frontend","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the frontend login page should be visible","stepMatchArguments":[]}]},
]; // bdd-data-end