// Generated from: test/e2e/features/workspace-ux.feature
import { test } from "playwright-bdd";

test.describe('Workspace UX regression coverage', () => {

  test('New Project form shows user-safe errors and clear actions', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I open the New Project form', null, { page }); 
    await And('project creation is unavailable because the backend contract does not support it', null, { page }); 
    await Then('I see a user-safe project creation unavailable message', null, { page }); 
    await And('I do not see internal contract details', null, { page }); 
    await And('the Create action is visually primary', null, { page }); 
    await And('the Cancel action is visually secondary', null, { page }); 
    await And('the form controls are aligned', null, { page }); 
  });

  test('Requirements action bar controls are aligned', async ({ Given, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await And('a valid project is selected', null, { page }); 
    await Then('the requirement key lookup has an accessible label', null, { page }); 
    await And('the lookup input and Find key button are visibly separated', null, { page }); 
    await And('the action bar controls are vertically aligned', null, { page }); 
    await And('no action bar controls overlap', null, { page }); 
  });

  test('Copy key reports clipboard success and failure', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await And('a requirement is selected', null, { page }); 
    await When('I copy the requirement key', null, { page }); 
    await Then('I see feedback that the key was copied', null, { page }); 
    await And('the feedback is announced accessibly', null, { page }); 
    await When('clipboard writing fails', null, { page }); 
    await And('I copy the requirement key again', null, { page }); 
    await Then('I see feedback that the key could not be copied', null, { page }); 
  });

  test('New Requirement form has stable field layout', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await And('a valid project is selected', null, { page }); 
    await When('I open the New Requirement form', null, { page }); 
    await Then('the form shows the active project', null, { page }); 
    await And('the Category field has an associated required label', null, { page }); 
    await When('I open the category selector', null, { page }); 
    await Then('category options are readable', null, { page }); 
    await And('the category options do not overlap Derived type', null, { page }); 
    await And('the category options do not overlap Description', null, { page }); 
    await When('I select the UI category', null, { page }); 
    await Then('the derived type is shown outside the option list', null, { page }); 
    await And('all requirement fields remain aligned', null, { page }); 
    await And('Create and Cancel are usable actions', null, { page }); 
  });

  test('New Category form has aligned fields and category type options', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await When('I open the New Category form', null, { page }); 
    await Then('the Category key field is labelled', null, { page }); 
    await And('the Category name field is labelled', null, { page }); 
    await And('the Category type radio group is labelled', null, { page }); 
    await And('the Functional option is aligned with its radio control', null, { page }); 
    await And('the Non-functional option is aligned with its radio control', null, { page }); 
    await When('I select Non-functional', null, { page }); 
    await Then('only Non-functional is selected', null, { page }); 
    await And('Create and Cancel are normal usable buttons', null, { page }); 
    await And('no form controls overlap', null, { page }); 
  });

  test('Requirement tabs have accessible and visible close controls', async ({ Given, When, Then, And, page }) => { 
    await Given('the workspace layout is open', null, { page }); 
    await And('I open requirement FR-UI-0028 in a dedicated tab', null, { page }); 
    await Then('the requirement tab is labelled FR-UI-0028', null, { page }); 
    await And('the close button is visually separated from the key', null, { page }); 
    await And('the close button has an accessible name containing FR-UI-0028', null, { page }); 
    await And('the Workspace tab has no close button', null, { page }); 
    await When('I close the requirement tab', null, { page }); 
    await Then('the Workspace tab is active', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('test/e2e/features/workspace-ux.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":2,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":3,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":4,"keywordType":"Action","textWithKeyword":"When I open the New Project form","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":5,"keywordType":"Action","textWithKeyword":"And project creation is unavailable because the backend contract does not support it","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":6,"keywordType":"Outcome","textWithKeyword":"Then I see a user-safe project creation unavailable message","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"And I do not see internal contract details","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And the Create action is visually primary","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And the Cancel action is visually secondary","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"And the form controls are aligned","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":12,"tags":[],"steps":[{"pwStepLine":18,"gherkinStepLine":13,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"And a valid project is selected","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the requirement key lookup has an accessible label","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And the lookup input and Find key button are visibly separated","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the action bar controls are vertically aligned","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And no action bar controls overlap","stepMatchArguments":[]}]},
  {"pwTestLine":26,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":27,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"And a requirement is selected","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I copy the requirement key","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I see feedback that the key was copied","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"And the feedback is announced accessibly","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When clipboard writing fails","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"And I copy the requirement key again","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then I see feedback that the key could not be copied","stepMatchArguments":[]}]},
  {"pwTestLine":37,"pickleLine":30,"tags":[],"steps":[{"pwStepLine":38,"gherkinStepLine":31,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":32,"keywordType":"Context","textWithKeyword":"And a valid project is selected","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":33,"keywordType":"Action","textWithKeyword":"When I open the New Requirement form","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"Then the form shows the active project","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":35,"keywordType":"Outcome","textWithKeyword":"And the Category field has an associated required label","stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I open the category selector","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then category options are readable","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"And the category options do not overlap Derived type","stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"And the category options do not overlap Description","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I select the UI category","stepMatchArguments":[]},{"pwStepLine":48,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the derived type is shown outside the option list","stepMatchArguments":[]},{"pwStepLine":49,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"And all requirement fields remain aligned","stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"And Create and Cancel are usable actions","stepMatchArguments":[]}]},
  {"pwTestLine":53,"pickleLine":45,"tags":[],"steps":[{"pwStepLine":54,"gherkinStepLine":46,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":55,"gherkinStepLine":47,"keywordType":"Action","textWithKeyword":"When I open the New Category form","stepMatchArguments":[]},{"pwStepLine":56,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"Then the Category key field is labelled","stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":49,"keywordType":"Outcome","textWithKeyword":"And the Category name field is labelled","stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":50,"keywordType":"Outcome","textWithKeyword":"And the Category type radio group is labelled","stepMatchArguments":[]},{"pwStepLine":59,"gherkinStepLine":51,"keywordType":"Outcome","textWithKeyword":"And the Functional option is aligned with its radio control","stepMatchArguments":[]},{"pwStepLine":60,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"And the Non-functional option is aligned with its radio control","stepMatchArguments":[]},{"pwStepLine":61,"gherkinStepLine":53,"keywordType":"Action","textWithKeyword":"When I select Non-functional","stepMatchArguments":[]},{"pwStepLine":62,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"Then only Non-functional is selected","stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":55,"keywordType":"Outcome","textWithKeyword":"And Create and Cancel are normal usable buttons","stepMatchArguments":[]},{"pwStepLine":64,"gherkinStepLine":56,"keywordType":"Outcome","textWithKeyword":"And no form controls overlap","stepMatchArguments":[]}]},
  {"pwTestLine":67,"pickleLine":58,"tags":[],"steps":[{"pwStepLine":68,"gherkinStepLine":59,"keywordType":"Context","textWithKeyword":"Given the workspace layout is open","stepMatchArguments":[]},{"pwStepLine":69,"gherkinStepLine":60,"keywordType":"Context","textWithKeyword":"And I open requirement FR-UI-0028 in a dedicated tab","stepMatchArguments":[]},{"pwStepLine":70,"gherkinStepLine":61,"keywordType":"Outcome","textWithKeyword":"Then the requirement tab is labelled FR-UI-0028","stepMatchArguments":[]},{"pwStepLine":71,"gherkinStepLine":62,"keywordType":"Outcome","textWithKeyword":"And the close button is visually separated from the key","stepMatchArguments":[]},{"pwStepLine":72,"gherkinStepLine":63,"keywordType":"Outcome","textWithKeyword":"And the close button has an accessible name containing FR-UI-0028","stepMatchArguments":[]},{"pwStepLine":73,"gherkinStepLine":64,"keywordType":"Outcome","textWithKeyword":"And the Workspace tab has no close button","stepMatchArguments":[]},{"pwStepLine":74,"gherkinStepLine":65,"keywordType":"Action","textWithKeyword":"When I close the requirement tab","stepMatchArguments":[]},{"pwStepLine":75,"gherkinStepLine":66,"keywordType":"Outcome","textWithKeyword":"Then the Workspace tab is active","stepMatchArguments":[]}]},
]; // bdd-data-end