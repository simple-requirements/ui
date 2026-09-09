@authentication
Feature: Frontend authentication session

  Scenario: Protected application routes require authentication
    Given initial Administrator bootstrap is complete for frontend authentication
    When I navigate to a protected frontend route
    Then the frontend login page should be visible

  Scenario: User signs in and returns to the requested route
    Given the frontend authentication API accepts valid credentials
    When I navigate to a protected frontend route
    And I sign in through the frontend
    Then the requested protected route should be visible
    And authenticated frontend requests should contain the bearer token

  Scenario: User signs out
    Given I am signed in through the frontend
    When I sign out through the frontend
    Then the frontend login page should be visible
    And the frontend logout endpoint should have been called

  Scenario: Reloading the SPA loses its in-memory session
    Given I am signed in through the frontend
    When I reload the authenticated frontend
    Then the frontend login page should be visible
