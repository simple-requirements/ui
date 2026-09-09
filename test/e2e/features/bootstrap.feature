@bootstrap
Feature: Initial Administrator bootstrap

  Scenario: First startup offers initial Administrator registration
    Given initial Administrator bootstrap is available to the frontend
    When I open the frontend authentication entry
    Then the initial Administrator form should be visible

  Scenario: Initial Administrator registration requires email verification
    Given initial Administrator bootstrap is available to the frontend
    When I open the frontend authentication entry
    And I register the initial Administrator through the frontend
    Then the initial Administrator email-verification instruction should be visible
    When I continue from initial Administrator registration
    Then the frontend login page should be visible

  Scenario: A concurrent bootstrap completion switches to normal login
    Given initial Administrator bootstrap becomes unavailable during frontend registration
    When I open the frontend authentication entry
    And I register the initial Administrator through the frontend
    Then the frontend login page should be visible
    And the completed-bootstrap notice should be visible
