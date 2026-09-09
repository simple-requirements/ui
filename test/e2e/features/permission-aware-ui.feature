@permission-aware-ui
Feature: Permission-aware frontend

  Scenario: Viewer sees assigned project data without mutation controls
    Given the permission-aware frontend signs me in as "Viewer"
    When I open the permission test requirement details
    Then only the assigned permission test project should be visible
    And project creation should not be visible
    And requirement mutation actions should not be visible
    And implementation ticket mutation actions should not be visible

  Scenario: Developer can manage implementation tickets but not requirements
    Given the permission-aware frontend signs me in as "Developer"
    When I open the permission test requirement details
    Then requirement mutation actions should not be visible
    And implementation ticket mutation actions should be visible

  Scenario: Requirements Engineer can mutate project requirements but cannot administer projects
    Given the permission-aware frontend signs me in as "Requirements Engineer"
    When I open the permission test requirement details
    Then project creation should not be visible
    And requirement mutation actions should be visible
    And implementation ticket mutation actions should be visible

  Scenario: Administrator without project membership has global project administration but read-only requirement access
    Given the permission-aware frontend signs me in as "Administrator"
    When I open the permission test requirement details
    Then project creation should be visible
    And requirement mutation actions should not be visible
    And implementation ticket mutation actions should not be visible
