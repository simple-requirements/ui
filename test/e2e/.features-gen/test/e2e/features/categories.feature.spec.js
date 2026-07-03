// Generated from: test/e2e/features/categories.feature
import { test } from "playwright-bdd";

test.describe('Project categories', () => {

  test('User opens project categories', async ({ Given, When, Then, page }) => { 
    await Given('the backend contains a category test project named "Category BDD Project" with categories', {"dataTable":{"rows":[{"cells":[{"value":"key"},{"value":"type"},{"value":"name"}]},{"cells":[{"value":"AUTH"},{"value":"FR"},{"value":"Authentication"}]},{"cells":[{"value":"PERF"},{"value":"NFR"},{"value":"Performance"}]}]}}); 
    await When('I open the category list for the category test project', null, { page }); 
    await Then('the categories table should show the categories', {"dataTable":{"rows":[{"cells":[{"value":"key"},{"value":"type"},{"value":"name"},{"value":"requirements"}]},{"cells":[{"value":"AUTH"},{"value":"FR"},{"value":"Authentication"},{"value":"0"}]},{"cells":[{"value":"PERF"},{"value":"NFR"},{"value":"Performance"},{"value":"0"}]}]}}, { page }); 
  });

  test('User selects a category', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a category test project named "Category BDD Project" with categories', {"dataTable":{"rows":[{"cells":[{"value":"key"},{"value":"type"},{"value":"name"}]},{"cells":[{"value":"AUTH"},{"value":"FR"},{"value":"Authentication"}]},{"cells":[{"value":"PERF"},{"value":"NFR"},{"value":"Performance"}]}]}}); 
    await When('I open the category list for the category test project', null, { page }); 
    await And('I select category "AUTH"', null, { page }); 
    await Then('the category details panel should show category "AUTH"', null, { page }); 
  });

  test('User opens a category details tab', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a category test project named "Category BDD Project" with categories', {"dataTable":{"rows":[{"cells":[{"value":"key"},{"value":"type"},{"value":"name"}]},{"cells":[{"value":"AUTH"},{"value":"FR"},{"value":"Authentication"}]}]}}); 
    await When('I open the category list for the category test project', null, { page }); 
    await And('I double-click category "AUTH"', null, { page }); 
    await Then('the URL should point to the details route for category "AUTH"', null, { page }); 
    await And('the tab bar should contain "Category AUTH"', null, { page }); 
    await And('the full category details page should show category "AUTH"', null, { page }); 
  });

  test('User closes a category details tab', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a category test project named "Category BDD Project" with categories', {"dataTable":{"rows":[{"cells":[{"value":"key"},{"value":"type"},{"value":"name"}]},{"cells":[{"value":"AUTH"},{"value":"FR"},{"value":"Authentication"}]}]}}); 
    await And('I opened the category details tab for category "AUTH"', null, { page }); 
    await When('I close the "Category AUTH" tab', null, { page }); 
    await Then('the URL should point to the category list route', null, { page }); 
    await And('the categories table should be visible again', null, { page }); 
  });

  test('User opens a category details route directly', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a category test project named "Category BDD Project" with categories', {"dataTable":{"rows":[{"cells":[{"value":"key"},{"value":"type"},{"value":"name"}]},{"cells":[{"value":"AUTH"},{"value":"FR"},{"value":"Authentication"}]}]}}); 
    await When('I open the category details URL directly for category "AUTH"', null, { page }); 
    await Then('the tab bar should contain "Category AUTH"', null, { page }); 
    await And('the full category details page should show category "AUTH"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/categories.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given the backend contains a category test project named \"Category BDD Project\" with categories","stepMatchArguments":[{"group":{"start":51,"value":"\"Category BDD Project\"","children":[{"start":52,"value":"Category BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I open the category list for the category test project","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then the categories table should show the categories","stepMatchArguments":[]}]},
  {"pwTestLine":12,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":13,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given the backend contains a category test project named \"Category BDD Project\" with categories","stepMatchArguments":[{"group":{"start":51,"value":"\"Category BDD Project\"","children":[{"start":52,"value":"Category BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I open the category list for the category test project","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"And I select category \"AUTH\"","stepMatchArguments":[{"group":{"start":18,"value":"\"AUTH\"","children":[{"start":19,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then the category details panel should show category \"AUTH\"","stepMatchArguments":[{"group":{"start":48,"value":"\"AUTH\"","children":[{"start":49,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":19,"pickleLine":23,"tags":[],"steps":[{"pwStepLine":20,"gherkinStepLine":24,"keywordType":"Context","textWithKeyword":"Given the backend contains a category test project named \"Category BDD Project\" with categories","stepMatchArguments":[{"group":{"start":51,"value":"\"Category BDD Project\"","children":[{"start":52,"value":"Category BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"When I open the category list for the category test project","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"And I double-click category \"AUTH\"","stepMatchArguments":[{"group":{"start":24,"value":"\"AUTH\"","children":[{"start":25,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then the URL should point to the details route for category \"AUTH\"","stepMatchArguments":[{"group":{"start":55,"value":"\"AUTH\"","children":[{"start":56,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"And the tab bar should contain \"Category AUTH\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Category AUTH\"","children":[{"start":28,"value":"Category AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"And the full category details page should show category \"AUTH\"","stepMatchArguments":[{"group":{"start":52,"value":"\"AUTH\"","children":[{"start":53,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":28,"pickleLine":33,"tags":[],"steps":[{"pwStepLine":29,"gherkinStepLine":34,"keywordType":"Context","textWithKeyword":"Given the backend contains a category test project named \"Category BDD Project\" with categories","stepMatchArguments":[{"group":{"start":51,"value":"\"Category BDD Project\"","children":[{"start":52,"value":"Category BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":30,"gherkinStepLine":37,"keywordType":"Context","textWithKeyword":"And I opened the category details tab for category \"AUTH\"","stepMatchArguments":[{"group":{"start":47,"value":"\"AUTH\"","children":[{"start":48,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":31,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"When I close the \"Category AUTH\" tab","stepMatchArguments":[{"group":{"start":12,"value":"\"Category AUTH\"","children":[{"start":13,"value":"Category AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"Then the URL should point to the category list route","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":40,"keywordType":"Outcome","textWithKeyword":"And the categories table should be visible again","stepMatchArguments":[]}]},
  {"pwTestLine":36,"pickleLine":42,"tags":[],"steps":[{"pwStepLine":37,"gherkinStepLine":43,"keywordType":"Context","textWithKeyword":"Given the backend contains a category test project named \"Category BDD Project\" with categories","stepMatchArguments":[{"group":{"start":51,"value":"\"Category BDD Project\"","children":[{"start":52,"value":"Category BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":38,"gherkinStepLine":46,"keywordType":"Action","textWithKeyword":"When I open the category details URL directly for category \"AUTH\"","stepMatchArguments":[{"group":{"start":54,"value":"\"AUTH\"","children":[{"start":55,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"Then the tab bar should contain \"Category AUTH\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Category AUTH\"","children":[{"start":28,"value":"Category AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"And the full category details page should show category \"AUTH\"","stepMatchArguments":[{"group":{"start":52,"value":"\"AUTH\"","children":[{"start":53,"value":"AUTH","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end