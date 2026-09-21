@bootstrap
Feature: Initial Administrator bootstrap

  Scenario: Authentication entry reflects the real bootstrap status
    Given the real bootstrap API is available
    When I open the frontend authentication entry
    Then either the initial Administrator form or the sign-in form should be visible
