Feature: Projects

  Scenario: Projects are shown in the sidebar
    Given the backend contains the projects
      | name          |
      | Alpha Project |
      | Beta Project  |
      | Zeta Project  |
    When I open the application
    Then the sidebar should show the projects in this order
      | name          |
      | Alpha Project |
      | Beta Project  |
      | Zeta Project  |

  Scenario: User creates a project
    Given the backend contains no projects
    And I open the application
    When I create a project named "BDD Created Project"
    Then the sidebar should contain the project "BDD Created Project"

  Scenario: User renames a project from the sidebar context menu
    Given the backend contains a project named "Old BDD Project"
    And I open the application
    When I open the context menu for project "Old BDD Project"
    And I choose "Rename project"
    And I rename the project to "Renamed BDD Project"
    Then the sidebar should contain the project "Renamed BDD Project"
    And the sidebar should not contain the project "Old BDD Project"

  Scenario: User cannot rename a project to an empty name
    Given the backend contains a project named "Rename Validation Project"
    And I open the application
    When I open the context menu for project "Rename Validation Project"
    And I choose "Rename project"
    And I submit the project dialog with an empty name
    Then the project dialog should show "Project name is required."