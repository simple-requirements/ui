// Generated from: test/e2e/features/projects.feature
import { test } from "playwright-bdd";

test.describe('Projects', () => {

  test('Projects are shown in the sidebar', async ({ Given, When, Then, page }) => { 
    await Given('the backend contains the projects', {"dataTable":{"rows":[{"cells":[{"value":"name"}]},{"cells":[{"value":"Alpha Project"}]},{"cells":[{"value":"Beta Project"}]},{"cells":[{"value":"Zeta Project"}]}]}}, { page }); 
    await When('I open the application', null, { page }); 
    await Then('the sidebar should show the projects in this order', {"dataTable":{"rows":[{"cells":[{"value":"name"}]},{"cells":[{"value":"Alpha Project"}]},{"cells":[{"value":"Beta Project"}]},{"cells":[{"value":"Zeta Project"}]}]}}, { page }); 
  });

  test('Administrator creates a project', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains no projects'); 
    await And('I open Administrator project administration', null, { page }); 
    await When('I create a project named "BDD Created Project"', null, { page }); 
    await Then('project administration should contain the project "BDD Created Project"', null, { page }); 
  });

  test('Administrator renames a project', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a project named "Old BDD Project"', null, { page }); 
    await And('I open Administrator project administration', null, { page }); 
    await When('I select administrative project "Old BDD Project"', null, { page }); 
    await And('I choose "Rename project"', null, { page }); 
    await And('I rename the project to "Renamed BDD Project"', null, { page }); 
    await Then('project administration should contain the project "Renamed BDD Project"', null, { page }); 
    await And('project administration should not contain the project "Old BDD Project"', null, { page }); 
  });

  test('Administrator cannot rename a project to an empty name', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a project named "Rename Validation Project"', null, { page }); 
    await And('I open Administrator project administration', null, { page }); 
    await When('I select administrative project "Rename Validation Project"', null, { page }); 
    await And('I choose "Rename project"', null, { page }); 
    await And('I submit the project dialog with an empty name', null, { page }); 
    await Then('the project dialog should show "Project name is required."', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/projects.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the backend contains the projects","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I open the application","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the sidebar should show the projects in this order","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":13,"gherkinStepLine":17,"keywordType":"Context","textWithKeyword":"Given the backend contains no projects","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"And I open Administrator project administration","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I create a project named \"BDD Created Project\"","stepMatchArguments":[{"group":{"start":25,"value":"\"BDD Created Project\"","children":[{"start":26,"value":"BDD Created Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then project administration should contain the project \"BDD Created Project\"","stepMatchArguments":[{"group":{"start":50,"value":"\"BDD Created Project\"","children":[{"start":51,"value":"BDD Created Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":19,"pickleLine":22,"tags":[],"steps":[{"pwStepLine":20,"gherkinStepLine":23,"keywordType":"Context","textWithKeyword":"Given the backend contains a project named \"Old BDD Project\"","stepMatchArguments":[{"group":{"start":37,"value":"\"Old BDD Project\"","children":[{"start":38,"value":"Old BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":24,"keywordType":"Context","textWithKeyword":"And I open Administrator project administration","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I select administrative project \"Old BDD Project\"","stepMatchArguments":[{"group":{"start":32,"value":"\"Old BDD Project\"","children":[{"start":33,"value":"Old BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"And I choose \"Rename project\"","stepMatchArguments":[{"group":{"start":9,"value":"\"Rename project\"","children":[{"start":10,"value":"Rename project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"And I rename the project to \"Renamed BDD Project\"","stepMatchArguments":[{"group":{"start":24,"value":"\"Renamed BDD Project\"","children":[{"start":25,"value":"Renamed BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then project administration should contain the project \"Renamed BDD Project\"","stepMatchArguments":[{"group":{"start":50,"value":"\"Renamed BDD Project\"","children":[{"start":51,"value":"Renamed BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"And project administration should not contain the project \"Old BDD Project\"","stepMatchArguments":[{"group":{"start":54,"value":"\"Old BDD Project\"","children":[{"start":55,"value":"Old BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":29,"pickleLine":31,"tags":[],"steps":[{"pwStepLine":30,"gherkinStepLine":32,"keywordType":"Context","textWithKeyword":"Given the backend contains a project named \"Rename Validation Project\"","stepMatchArguments":[{"group":{"start":37,"value":"\"Rename Validation Project\"","children":[{"start":38,"value":"Rename Validation Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":33,"keywordType":"Context","textWithKeyword":"And I open Administrator project administration","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":34,"keywordType":"Action","textWithKeyword":"When I select administrative project \"Rename Validation Project\"","stepMatchArguments":[{"group":{"start":32,"value":"\"Rename Validation Project\"","children":[{"start":33,"value":"Rename Validation Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":33,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"And I choose \"Rename project\"","stepMatchArguments":[{"group":{"start":9,"value":"\"Rename project\"","children":[{"start":10,"value":"Rename project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"And I submit the project dialog with an empty name","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then the project dialog should show \"Project name is required.\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Project name is required.\"","children":[{"start":32,"value":"Project name is required.","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end