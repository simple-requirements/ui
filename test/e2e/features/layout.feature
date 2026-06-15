Feature: Demo layout prototype
  Scenario: Startup renders projects and opens a requirement tab
    Given I open the demo workspace
    Then the startup overlay disappears
    And eight demo projects are visible
    When I double click the first requirement
    Then a dedicated requirement tab is visible
