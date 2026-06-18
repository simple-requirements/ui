Feature: Demo layout prototype
  Scenario: Startup renders projects and opens a requirement tab
    Given I open the demo workspace
    Then the startup overlay disappears
    And 8 demo projects are visible
    When I double click the first requirement
    Then 1 dedicated requirement tab is visible

  Scenario: Workspace controls and New Requirement form remain aligned
    Given I open the demo workspace
    Then the startup overlay disappears
    Then the New Project button label is centered
    When I open a new requirement form
    Then the complete New Requirement form is visible without pane-level scroll glitches
