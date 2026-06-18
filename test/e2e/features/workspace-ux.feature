Feature: Workspace UX regression coverage
  Scenario: New Project form shows user-safe errors and clear actions
    Given the workspace layout is open
    When I open the New Project form
    And project creation is unavailable because the backend contract does not support it
    Then I see a user-safe project creation unavailable message
    And I do not see internal contract details
    And the Create action is visually primary
    And the Cancel action is visually secondary
    And the form controls are aligned

  Scenario: Requirements action bar controls are aligned
    Given the workspace layout is open
    And a valid project is selected
    Then the requirement key lookup has an accessible label
    And the lookup input and Find key button are visibly separated
    And the action bar controls are vertically aligned
    And no action bar controls overlap

  Scenario: Copy key reports clipboard success and failure
    Given the workspace layout is open
    And a requirement is selected
    When I copy the requirement key
    Then I see feedback that the key was copied
    And the feedback is announced accessibly
    When clipboard writing fails
    And I copy the requirement key again
    Then I see feedback that the key could not be copied

  Scenario: New Requirement form has stable field layout
    Given the workspace layout is open
    And a valid project is selected
    When I open the New Requirement form
    Then the form shows the active project
    And the Category field has an associated required label
    When I open the category selector
    Then category options are readable
    And the category options do not overlap Derived type
    And the category options do not overlap Description
    When I select the UI category
    Then the derived type is shown outside the option list
    And all requirement fields remain aligned
    And Create and Cancel are usable actions

  Scenario: New Category form has aligned fields and category type options
    Given the workspace layout is open
    When I open the New Category form
    Then the Category key field is labelled
    And the Category name field is labelled
    And the Category type radio group is labelled
    And the Functional option is aligned with its radio control
    And the Non-functional option is aligned with its radio control
    When I select Non-functional
    Then only Non-functional is selected
    And Create and Cancel are normal usable buttons
    And no form controls overlap

  Scenario: Requirement tabs have accessible and visible close controls
    Given the workspace layout is open
    And I open requirement FR-UI-0028 in a dedicated tab
    Then the requirement tab is labelled FR-UI-0028
    And the close button is visually separated from the key
    And the close button has an accessible name containing FR-UI-0028
    And the Workspace tab has no close button
    When I close the requirement tab
    Then the Workspace tab is active
