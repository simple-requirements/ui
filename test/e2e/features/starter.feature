Feature: Starter smoke check
  Scenario: The demo workspace starts
    Given I open the demo workspace
    Then the startup overlay disappears
    And 8 demo projects are visible
