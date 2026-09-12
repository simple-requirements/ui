@project-membership-administration
Feature: Project membership administration
  Administrators assign project-scoped roles to registered users.

  Scenario: Assign, change, and remove project memberships
    Given the frontend project-membership administration API is available
    When I sign in as a frontend Administrator
    And I open frontend project membership administration
    And I select the administration project "Project Alpha"
    Then "Viewer" should have the project role "Viewer"
    When I assign "Developer" the project roles "Requirements Engineer, Developer"
    Then "Developer" should have the project roles "Requirements Engineer, Developer"
    When I change "Developer" to the project role "Viewer"
    Then "Developer" should have the project role "Viewer"
    When I remove "Viewer" from the project
    Then "Viewer" should no longer have a project membership
