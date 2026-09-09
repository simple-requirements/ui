@project-membership-administration
Feature: Project membership administration
  Administrators assign project-scoped roles to registered users.

  Scenario: Assign, change, and remove project memberships
    Given the frontend project-membership administration API is available
    When I sign in as a frontend Administrator
    And I open frontend project membership administration
    And I select the administration project "Project Alpha"
    Then "Alice Member" should have the project role "Viewer"
    When I assign "Bob Builder" the project roles "Requirements Engineer, Developer"
    Then "Bob Builder" should have the project roles "Requirements Engineer, Developer"
    When I change "Bob Builder" to the project role "Viewer"
    Then "Bob Builder" should have the project role "Viewer"
    When I remove "Alice Member" from the project
    Then "Alice Member" should no longer have a project membership
