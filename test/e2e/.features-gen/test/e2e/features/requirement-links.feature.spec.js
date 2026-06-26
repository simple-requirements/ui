// Generated from: test/e2e/features/requirement-links.feature
import { test } from "playwright-bdd";

test.describe('Requirement links', () => {

  test('Requirement detail shows link panels and history', async ({ Given, Then, And, page, request }) => { 
    await Given('a temporary project with linked requirements is open', null, { page, request }); 
    await Then('the requirement links section is visible', null, { page }); 
    await And('the outgoing links section is visible', null, { page }); 
    await And('the incoming links section is visible', null, { page }); 
    await And('the link history section is visible', null, { page }); 
    await And('the outgoing links include the existing temporary target', null, { page }); 
    await And('the incoming links include the existing temporary source', null, { page }); 
  });

  test('Create a requirement link by target visible key', async ({ Given, When, Then, And, page, request }) => { 
    await Given('a temporary project with linked requirements is open', null, { page, request }); 
    await When('I create a requirement link to the unused temporary target', null, { page }); 
    await Then('the outgoing links include the unused temporary target', null, { page }); 
    await And('the link history contains a "created" event', null, { page }); 
  });

  test('Invalid requirement link target key is rejected', async ({ Given, When, Then, page, request }) => { 
    await Given('a temporary project with linked requirements is open', null, { page, request }); 
    await When('I try to create a requirement link to "bad-key"', null, { page }); 
    await Then('I see "Enter a valid target key" link feedback', null, { page }); 
  });

  test('Correct an outgoing requirement link target', async ({ Given, When, Then, And, page, request }) => { 
    await Given('a temporary project with linked requirements is open', null, { page, request }); 
    await When('I correct the existing outgoing link to the unused temporary target', null, { page }); 
    await Then('the outgoing links include the unused temporary target', null, { page }); 
    await And('the link history contains a "target changed" event', null, { page }); 
  });

  test('Remove an outgoing requirement link', async ({ Given, When, Then, And, page, request }) => { 
    await Given('a temporary project with linked requirements is open', null, { page, request }); 
    await When('I remove the existing outgoing requirement link', null, { page }); 
    await Then('the outgoing links no longer include the existing temporary target', null, { page }); 
    await And('the link history contains a "deleted" event', null, { page }); 
  });

  test('Open a linked requirement from outgoing links', async ({ Given, When, Then, page, request }) => { 
    await Given('a temporary project with linked requirements is open', null, { page, request }); 
    await When('I open the existing outgoing linked requirement', null, { page }); 
    await Then('the linked target requirement is selected', null, { page }); 
  });

  test('Revision comparison shows requirement link changes', async ({ Given, When, Then, And, page, request }) => { 
    await Given('a temporary project with linked requirements is open', null, { page, request }); 
    await When('I open revision comparison "1..current"', null, { page }); 
    await Then('the comparison shows requirement link changes', null, { page }); 
    await And('the comparison shows added outgoing requirement links', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, request }) => $runScenarioHooks('before', { request }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/requirement-links.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given a temporary project with linked requirements is open","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Outcome","textWithKeyword":"Then the requirement links section is visible","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"And the outgoing links section is visible","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And the incoming links section is visible","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And the link history section is visible","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And the outgoing links include the existing temporary target","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And the incoming links include the existing temporary source","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given a temporary project with linked requirements is open","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"When I create a requirement link to the unused temporary target","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then the outgoing links include the unused temporary target","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And the link history contains a \"created\" event","stepMatchArguments":[{"group":{"start":28,"value":"\"created\"","children":[{"start":29,"value":"created","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":23,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"Given a temporary project with linked requirements is open","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I try to create a requirement link to \"bad-key\"","stepMatchArguments":[{"group":{"start":38,"value":"\"bad-key\"","children":[{"start":39,"value":"bad-key","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I see \"Enter a valid target key\" link feedback","stepMatchArguments":[{"group":{"start":6,"value":"\"Enter a valid target key\"","children":[{"start":7,"value":"Enter a valid target key","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":29,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":30,"gherkinStepLine":28,"keywordType":"Context","textWithKeyword":"Given a temporary project with linked requirements is open","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"When I correct the existing outgoing link to the unused temporary target","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"Then the outgoing links include the unused temporary target","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"And the link history contains a \"target changed\" event","stepMatchArguments":[{"group":{"start":28,"value":"\"target changed\"","children":[{"start":29,"value":"target changed","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":36,"pickleLine":34,"tags":[],"steps":[{"pwStepLine":37,"gherkinStepLine":35,"keywordType":"Context","textWithKeyword":"Given a temporary project with linked requirements is open","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I remove the existing outgoing requirement link","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then the outgoing links no longer include the existing temporary target","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"And the link history contains a \"deleted\" event","stepMatchArguments":[{"group":{"start":28,"value":"\"deleted\"","children":[{"start":29,"value":"deleted","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":43,"pickleLine":41,"tags":[],"steps":[{"pwStepLine":44,"gherkinStepLine":42,"keywordType":"Context","textWithKeyword":"Given a temporary project with linked requirements is open","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"When I open the existing outgoing linked requirement","stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Then the linked target requirement is selected","stepMatchArguments":[]}]},
  {"pwTestLine":49,"pickleLine":47,"tags":[],"steps":[{"pwStepLine":50,"gherkinStepLine":48,"keywordType":"Context","textWithKeyword":"Given a temporary project with linked requirements is open","stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":49,"keywordType":"Action","textWithKeyword":"When I open revision comparison \"1..current\"","stepMatchArguments":[{"group":{"start":27,"value":"\"1..current\"","children":[{"start":28,"value":"1..current","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":52,"gherkinStepLine":50,"keywordType":"Outcome","textWithKeyword":"Then the comparison shows requirement link changes","stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":51,"keywordType":"Outcome","textWithKeyword":"And the comparison shows added outgoing requirement links","stepMatchArguments":[]}]},
]; // bdd-data-end