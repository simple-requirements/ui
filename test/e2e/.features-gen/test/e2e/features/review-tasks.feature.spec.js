// Generated from: test/e2e/features/review-tasks.feature
import { test } from "playwright-bdd";

test.describe('Review assignment tasks', () => {

  test('Requirements Engineer assigns a review task', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a review-task project named "Review Task Assignment BDD Project" with a draft requirement'); 
    await And('the Review Engineer has membership in the review-task project'); 
    await When('I open the review-task requirement review as a Requirements Engineer', null, { page }); 
    await And('I assign the review task to "Review Engineer"', null, { page }); 
    await Then('review assignments should show "Review Engineer" as "Pending"', null, { page }); 
  });

  test('Assigned Requirements Engineer sees and completes a pending task', async ({ Given, When, Then, And, page }) => { 
    await Given('the backend contains a review-task project named "Review Task Inbox BDD Project" with a pending task for the Review Engineer'); 
    await When('I open my review tasks as the Review Engineer', null, { page }); 
    await Then('my review tasks should contain the review-task requirement', null, { page }); 
    await When('I mark the review-task requirement completed', null, { page }); 
    await And('I show completed review tasks', null, { page }); 
    await Then('my review tasks should show the review-task requirement as "completed"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/review-tasks.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the backend contains a review-task project named \"Review Task Assignment BDD Project\" with a draft requirement","stepMatchArguments":[{"group":{"start":49,"value":"\"Review Task Assignment BDD Project\"","children":[{"start":50,"value":"Review Task Assignment BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"And the Review Engineer has membership in the review-task project","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I open the review-task requirement review as a Requirements Engineer","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"And I assign the review task to \"Review Engineer\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Review Engineer\"","children":[{"start":29,"value":"Review Engineer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then review assignments should show \"Review Engineer\" as \"Pending\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Review Engineer\"","children":[{"start":32,"value":"Review Engineer","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":52,"value":"\"Pending\"","children":[{"start":53,"value":"Pending","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":14,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Context","textWithKeyword":"Given the backend contains a review-task project named \"Review Task Inbox BDD Project\" with a pending task for the Review Engineer","stepMatchArguments":[{"group":{"start":49,"value":"\"Review Task Inbox BDD Project\"","children":[{"start":50,"value":"Review Task Inbox BDD Project","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I open my review tasks as the Review Engineer","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then my review tasks should contain the review-task requirement","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I mark the review-task requirement completed","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"And I show completed review tasks","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then my review tasks should show the review-task requirement as \"completed\"","stepMatchArguments":[{"group":{"start":59,"value":"\"completed\"","children":[{"start":60,"value":"completed","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end