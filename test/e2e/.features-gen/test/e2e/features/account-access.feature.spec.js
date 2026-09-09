// Generated from: test/e2e/features/account-access.feature
import { test } from "playwright-bdd";

test.describe('Public account access', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('the public account API is available', null, { page }); 
  });
  
  test('Register a local account', { tag: ['@account-access'] }, async ({ When, Then, And, page }) => { 
    await When('I register a local frontend account', null, { page }); 
    await Then('the registration instructions should be visible', null, { page }); 
    await And('the normalized registration data should have been submitted'); 
  });

  test('Verify an email link', { tag: ['@account-access'] }, async ({ When, Then, And, page }) => { 
    await When('I open a frontend email-verification link', null, { page }); 
    await Then('the email-verification confirmation should be visible', null, { page }); 
    await And('the verification token should have been submitted once'); 
  });

  test('Resend an email-verification link without account enumeration', { tag: ['@account-access'] }, async ({ When, Then, page }) => { 
    await When('I request another frontend verification email', null, { page }); 
    await Then('the generic verification-email response should be visible', null, { page }); 
  });

  test('Request a password reset without account enumeration', { tag: ['@account-access'] }, async ({ When, Then, page }) => { 
    await When('I request a frontend password reset', null, { page }); 
    await Then('the generic password-reset response should be visible', null, { page }); 
  });

  test('Set a new password', { tag: ['@account-access'] }, async ({ When, Then, And, page }) => { 
    await When('I open a frontend password-reset link', null, { page }); 
    await And('I submit a new frontend password', null, { page }); 
    await Then('the password-change confirmation should be visible', null, { page }); 
    await And('the password-reset token should have been submitted'); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/account-access.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":8,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I register a local frontend account","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the registration instructions should be visible","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And the normalized registration data should have been submitted","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":13,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I open a frontend email-verification link","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the email-verification confirmation should be visible","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And the verification token should have been submitted once","stepMatchArguments":[]}]},
  {"pwTestLine":22,"pickleLine":18,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I request another frontend verification email","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then the generic verification-email response should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":22,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I request a frontend password reset","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then the generic password-reset response should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":32,"pickleLine":26,"tags":["@account-access"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the public account API is available","isBg":true,"stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"When I open a frontend password-reset link","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"And I submit a new frontend password","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then the password-change confirmation should be visible","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"And the password-reset token should have been submitted","stepMatchArguments":[]}]},
]; // bdd-data-end