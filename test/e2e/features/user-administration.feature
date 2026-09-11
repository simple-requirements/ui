@user-administration
Feature: User and session administration
  Administrators inspect real users and sessions through the backend API.

  Scenario: Open user and session administration
    Given a real frontend Administrator session is available
    When I open frontend user administration as a real Administrator
    And I select the E2E Administrator user
    Then the selected user sessions should be visible
