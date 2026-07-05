Feature: Project requirements

  Scenario: User opens project requirements
    Given the backend contains a requirement test project named "Requirement BDD Project" with requirements
      | categoryKey | categoryType | categoryName   | description                             | priority | owner | source          |
      | AUTH        | FR           | Authentication | Users can sign in.                     | p1       | Alice | Security policy |
      | PERF        | NFR          | Performance    | The dashboard opens within one second. | p2       | Bob   | SLA             |
    When I open the requirements list for the requirement test project
    Then the requirements table should show the requirements
      | key           | status | description                             | priority | owner |
      | FR-AUTH-0001  | Draft  | Users can sign in.                     | p1       | Alice |
      | NFR-PERF-0001 | Draft  | The dashboard opens within one second. | p2       | Bob   |

  Scenario: User sees the sidebar requirements counter
    Given the backend contains a requirement test project named "Requirement BDD Project" with requirements
      | categoryKey | categoryType | categoryName   | description                             | priority | owner |
      | AUTH        | FR           | Authentication | Users can sign in.                     | p1       | Alice |
      | PERF        | NFR          | Performance    | The dashboard opens within one second. | p2       | Bob   |
    When I open the application
    Then the sidebar should show requirement count 2 for project "Requirement BDD Project"

  Scenario: User selects a requirement
    Given the backend contains a requirement test project named "Requirement BDD Project" with requirements
      | categoryKey | categoryType | categoryName   | description         | priority | owner | source          |
      | AUTH        | FR           | Authentication | Users can sign in. | p1       | Alice | Security policy |
    When I open the requirements list for the requirement test project
    And I select requirement "FR-AUTH-0001"
    Then the requirement details panel should show requirement "FR-AUTH-0001"

  Scenario: User copies a requirement key from the table
    Given the backend contains a requirement test project named "Requirement BDD Project" with requirements
      | categoryKey | categoryType | categoryName   | description         | priority | owner |
      | AUTH        | FR           | Authentication | Users can sign in. | p1       | Alice |
    When I open the requirements list for the requirement test project
    And I copy requirement key "FR-AUTH-0001"
    Then the requirement key copied toast should be visible for requirement "FR-AUTH-0001"

  Scenario: User opens a requirement details tab
    Given the backend contains a requirement test project named "Requirement BDD Project" with requirements
      | categoryKey | categoryType | categoryName   | description         | priority | owner |
      | AUTH        | FR           | Authentication | Users can sign in. | p1       | Alice |
    When I open the requirements list for the requirement test project
    And I double-click requirement "FR-AUTH-0001"
    Then the URL should point to the details route for requirement "FR-AUTH-0001"
    And the tab bar should contain "FR-AUTH-0001"
    And the full requirement details page should show requirement "FR-AUTH-0001"

  Scenario: User closes a requirement details tab
    Given the backend contains a requirement test project named "Requirement BDD Project" with requirements
      | categoryKey | categoryType | categoryName   | description         | priority | owner |
      | AUTH        | FR           | Authentication | Users can sign in. | p1       | Alice |
    And I opened the requirement details tab for requirement "FR-AUTH-0001"
    When I close the "FR-AUTH-0001" tab
    Then the URL should point to the requirements list route
    And the requirements table should be visible again

  Scenario: User opens a requirement details route directly
    Given the backend contains a requirement test project named "Requirement BDD Project" with requirements
      | categoryKey | categoryType | categoryName   | description         | priority | owner |
      | AUTH        | FR           | Authentication | Users can sign in. | p1       | Alice |
    When I open the requirement details URL directly for requirement "FR-AUTH-0001"
    Then the tab bar should contain "FR-AUTH-0001"
    And the full requirement details page should show requirement "FR-AUTH-0001"
