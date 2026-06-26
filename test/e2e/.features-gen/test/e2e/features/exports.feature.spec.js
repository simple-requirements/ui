// Generated from: test/e2e/features/exports.feature
import { test } from "playwright-bdd";

test.describe('Exports', () => {

  test('Project context menu opens the project export dialog', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I open the context menu for "Customer Portal" project', null, { page }); 
    await Then('the context menu offers "Export project"', null, { page }); 
    await And('the context menu offers "Export all projects"', null, { page }); 
    await When('I choose "Export project" from the context menu', null, { page }); 
    await Then('the export dialog "Export project Customer Portal" is visible', null, { page }); 
    await And('the export dialog offers "GitHub-flavored Markdown"', null, { page }); 
    await And('the export dialog offers "AsciiDoc"', null, { page }); 
  });

  test('Project context menu opens the all-projects export dialog', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I open the context menu for "Customer Portal" project', null, { page }); 
    await And('I choose "Export all projects" from the context menu', null, { page }); 
    await Then('the export dialog "Export all projects" is visible', null, { page }); 
    await And('the export dialog offers "JSON"', null, { page }); 
  });

  test('Requirement context menu opens the requirement selection export dialog', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I open the context menu for requirement "FR-INT-0038"', null, { page }); 
    await Then('the context menu offers "Export requirement(s)"', null, { page }); 
    await And('the context menu offers "Export all requirements"', null, { page }); 
    await When('I choose "Export requirement(s)" from the context menu', null, { page }); 
    await Then('the export dialog "Export FR-INT-0038" is visible', null, { page }); 
    await And('the export dialog offers "GitHub-flavored Markdown"', null, { page }); 
    await And('the export dialog offers "AsciiDoc"', null, { page }); 
  });

  test('Requirement context menu opens the all-requirements export dialog', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I open the context menu for requirement "FR-INT-0038"', null, { page }); 
    await And('I choose "Export all requirements" from the context menu', null, { page }); 
    await Then('the export dialog "Export all requirements" is visible', null, { page }); 
    await And('the export dialog offers "JSON"', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, request }) => $runScenarioHooks('before', { request }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/exports.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I open the context menu for \"Customer Portal\" project","stepMatchArguments":[{"group":{"start":28,"value":"\"Customer Portal\"","children":[{"start":29,"value":"Customer Portal","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then the context menu offers \"Export project\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Export project\"","children":[{"start":25,"value":"Export project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And the context menu offers \"Export all projects\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Export all projects\"","children":[{"start":25,"value":"Export all projects","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I choose \"Export project\" from the context menu","stepMatchArguments":[{"group":{"start":9,"value":"\"Export project\"","children":[{"start":10,"value":"Export project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the export dialog \"Export project Customer Portal\" is visible","stepMatchArguments":[{"group":{"start":18,"value":"\"Export project Customer Portal\"","children":[{"start":19,"value":"Export project Customer Portal","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And the export dialog offers \"GitHub-flavored Markdown\"","stepMatchArguments":[{"group":{"start":25,"value":"\"GitHub-flavored Markdown\"","children":[{"start":26,"value":"GitHub-flavored Markdown","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And the export dialog offers \"AsciiDoc\"","stepMatchArguments":[{"group":{"start":25,"value":"\"AsciiDoc\"","children":[{"start":26,"value":"AsciiDoc","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":17,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"When I open the context menu for \"Customer Portal\" project","stepMatchArguments":[{"group":{"start":28,"value":"\"Customer Portal\"","children":[{"start":29,"value":"Customer Portal","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"And I choose \"Export all projects\" from the context menu","stepMatchArguments":[{"group":{"start":9,"value":"\"Export all projects\"","children":[{"start":10,"value":"Export all projects","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the export dialog \"Export all projects\" is visible","stepMatchArguments":[{"group":{"start":18,"value":"\"Export all projects\"","children":[{"start":19,"value":"Export all projects","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And the export dialog offers \"JSON\"","stepMatchArguments":[{"group":{"start":25,"value":"\"JSON\"","children":[{"start":26,"value":"JSON","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":25,"pickleLine":23,"tags":[],"steps":[{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I open the context menu for requirement \"FR-INT-0038\"","stepMatchArguments":[{"group":{"start":40,"value":"\"FR-INT-0038\"","children":[{"start":41,"value":"FR-INT-0038","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then the context menu offers \"Export requirement(s)\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Export requirement(s)\"","children":[{"start":25,"value":"Export requirement(s)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":29,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"And the context menu offers \"Export all requirements\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Export all requirements\"","children":[{"start":25,"value":"Export all requirements","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":30,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"When I choose \"Export requirement(s)\" from the context menu","stepMatchArguments":[{"group":{"start":9,"value":"\"Export requirement(s)\"","children":[{"start":10,"value":"Export requirement(s)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then the export dialog \"Export FR-INT-0038\" is visible","stepMatchArguments":[{"group":{"start":18,"value":"\"Export FR-INT-0038\"","children":[{"start":19,"value":"Export FR-INT-0038","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"And the export dialog offers \"GitHub-flavored Markdown\"","stepMatchArguments":[{"group":{"start":25,"value":"\"GitHub-flavored Markdown\"","children":[{"start":26,"value":"GitHub-flavored Markdown","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":33,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"And the export dialog offers \"AsciiDoc\"","stepMatchArguments":[{"group":{"start":25,"value":"\"AsciiDoc\"","children":[{"start":26,"value":"AsciiDoc","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":36,"pickleLine":34,"tags":[],"steps":[{"pwStepLine":37,"gherkinStepLine":35,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I open the context menu for requirement \"FR-INT-0038\"","stepMatchArguments":[{"group":{"start":40,"value":"\"FR-INT-0038\"","children":[{"start":41,"value":"FR-INT-0038","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"And I choose \"Export all requirements\" from the context menu","stepMatchArguments":[{"group":{"start":9,"value":"\"Export all requirements\"","children":[{"start":10,"value":"Export all requirements","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then the export dialog \"Export all requirements\" is visible","stepMatchArguments":[{"group":{"start":18,"value":"\"Export all requirements\"","children":[{"start":19,"value":"Export all requirements","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"And the export dialog offers \"JSON\"","stepMatchArguments":[{"group":{"start":25,"value":"\"JSON\"","children":[{"start":26,"value":"JSON","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end