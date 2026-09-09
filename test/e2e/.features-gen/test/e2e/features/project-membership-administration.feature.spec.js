// Generated from: test/e2e/features/project-membership-administration.feature
import { test } from "playwright-bdd";

test.describe('Project membership administration', () => {

  test('Assign, change, and remove project memberships', { tag: ['@project-membership-administration'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('the frontend project-membership administration API is available', null, { page }); 
    await When('I sign in as a frontend Administrator', null, { page }); 
    await And('I open frontend project membership administration', null, { page }); 
    await And('I select the administration project "Project Alpha"', null, { page }); 
    await Then('"Alice Member" should have the project role "Viewer"', null, { page }); 
    await When('I assign "Bob Builder" the project roles "Requirements Engineer, Developer"', null, { page }); 
    await Then('"Bob Builder" should have the project roles "Requirements Engineer, Developer"', null, { page }); 
    await When('I change "Bob Builder" to the project role "Viewer"', null, { page }); 
    await Then('"Bob Builder" should have the project role "Viewer"', null, { page }); 
    await When('I remove "Alice Member" from the project', null, { page }); 
    await Then('"Alice Member" should no longer have a project membership', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/project-membership-administration.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":5,"tags":["@project-membership-administration"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given the frontend project-membership administration API is available","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I sign in as a frontend Administrator","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"And I open frontend project membership administration","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I select the administration project \"Project Alpha\"","stepMatchArguments":[{"group":{"start":36,"value":"\"Project Alpha\"","children":[{"start":37,"value":"Project Alpha","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then \"Alice Member\" should have the project role \"Viewer\"","stepMatchArguments":[{"group":{"start":0,"value":"\"Alice Member\"","children":[{"start":1,"value":"Alice Member","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":44,"value":"\"Viewer\"","children":[{"start":45,"value":"Viewer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I assign \"Bob Builder\" the project roles \"Requirements Engineer, Developer\"","stepMatchArguments":[{"group":{"start":9,"value":"\"Bob Builder\"","children":[{"start":10,"value":"Bob Builder","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":41,"value":"\"Requirements Engineer, Developer\"","children":[{"start":42,"value":"Requirements Engineer, Developer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then \"Bob Builder\" should have the project roles \"Requirements Engineer, Developer\"","stepMatchArguments":[{"group":{"start":0,"value":"\"Bob Builder\"","children":[{"start":1,"value":"Bob Builder","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":44,"value":"\"Requirements Engineer, Developer\"","children":[{"start":45,"value":"Requirements Engineer, Developer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I change \"Bob Builder\" to the project role \"Viewer\"","stepMatchArguments":[{"group":{"start":9,"value":"\"Bob Builder\"","children":[{"start":10,"value":"Bob Builder","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":43,"value":"\"Viewer\"","children":[{"start":44,"value":"Viewer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then \"Bob Builder\" should have the project role \"Viewer\"","stepMatchArguments":[{"group":{"start":0,"value":"\"Bob Builder\"","children":[{"start":1,"value":"Bob Builder","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":43,"value":"\"Viewer\"","children":[{"start":44,"value":"Viewer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I remove \"Alice Member\" from the project","stepMatchArguments":[{"group":{"start":9,"value":"\"Alice Member\"","children":[{"start":10,"value":"Alice Member","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then \"Alice Member\" should no longer have a project membership","stepMatchArguments":[{"group":{"start":0,"value":"\"Alice Member\"","children":[{"start":1,"value":"Alice Member","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end