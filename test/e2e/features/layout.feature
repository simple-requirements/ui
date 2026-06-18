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

  Scenario: New Project form uses safe errors and stable responsive layout
    Given I open the demo workspace
    Then the startup overlay disappears
    When I open a new project form
    Then the New Project form matches the desktop snapshot
    When I submit the New Project form with "Contract Gap Project"
    Then project creation shows a safe unavailable error
    And the New Project error state matches the desktop snapshot
    When I resize the viewport to 1024 by 768
    Then the New Project form matches the narrow snapshot
