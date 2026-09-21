@project-membership-administration
Feature: Project membership administration
  Administrators manage project memberships using each account's single role.

  Scenario: Assign and remove project memberships
    Given the frontend project-membership administration API is available
    When I sign in as a frontend Administrator
    And I open frontend project membership administration
    And I select the administration project "Project Alpha"
    Then "Viewer" should have the project role "Viewer"
    When I assign "Developer" to the project
    Then "Developer" should have the project role "Developer"
    When I remove "Viewer" from the project
    Then "Viewer" should no longer have a project membership
