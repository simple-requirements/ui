// Generated from: test/e2e/features/account-access.feature
import { test } from "playwright-bdd";

test.describe('Public account access', () => {

  test.beforeEach('Background', async ({ Given }, testInfo) => { if (testInfo.error) return;
    await Given('the real public account API is available'); 
  });
  
  test('Register a local account', { tag: ['@account-access'] }, async ({ When, Then, And, page }) => { 
    await When('I register a unique local frontend account', null, { page }); 
    await Then('the registration instructions should be visible', null, { page }); 
    await And('the normalized registration data should be visible to administration'); 
  });

  test('Reject an invalid email-verification link', { tag: ['@account-access'] }, async ({ When, Then, page }) => { 
    await When('I open an invalid frontend email-verification link', null, { page }); 
    await Then('the email-verification invalid-link message should be visible', null, { page }); 
  });

  test('Resend an email-verification link without account enumeration', { tag: ['@account-access'] }, async ({ When, Then, page }) => { 
    await When('I request another frontend verification email', null, { page }); 
    await Then('the generic verification-email response should be visible', null, { page }); 
  });

  test('Request a password reset without account enumeration', { tag: ['@account-access'] }, async ({ When, Then, page }) => { 
    await When('I request a frontend password reset', null, { page }); 
    await Then('the generic password-reset response should be visible', null, { page }); 
  });

  test('Reject an invalid password-reset token', { tag: ['@account-access'] }, async ({ When, Then, And, page }) => { 
    await When('I open an invalid frontend password-reset link', null, { page }); 
    await And('I submit a new frontend password', null, { page }); 
    await Then('the password-reset invalid-link message should be visible', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/account-access.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":8,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the real public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I register a unique local frontend account","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the registration instructions should be visible","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And the normalized registration data should be visible to administration","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":13,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the real public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I open an invalid frontend email-verification link","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the email-verification invalid-link message should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":17,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the real public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I request another frontend verification email","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the generic verification-email response should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":26,"pickleLine":21,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the real public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I request a frontend password reset","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then the generic password-reset response should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":31,"pickleLine":25,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the real public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When I open an invalid frontend password-reset link","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"And I submit a new frontend password","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then the password-reset invalid-link message should be visible","stepMatchArguments":[]}]},
]; // bdd-data-end