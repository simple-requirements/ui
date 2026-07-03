Feature: Project categories

  Scenario: User opens project categories
    Given the backend contains a category test project named "Category BDD Project" with categories
      | key  | type | name           |
      | AUTH | FR   | Authentication |
      | PERF | NFR  | Performance    |
    When I open the category list for the category test project
    Then the categories table should show the categories
      | key  | type | name           | requirements |
      | AUTH | FR   | Authentication | 0            |
      | PERF | NFR  | Performance    | 0            |

  Scenario: User selects a category
    Given the backend contains a category test project named "Category BDD Project" with categories
      | key  | type | name           |
      | AUTH | FR   | Authentication |
      | PERF | NFR  | Performance    |
    When I open the category list for the category test project
    And I select category "AUTH"
    Then the category details panel should show category "AUTH"

  Scenario: User opens a category details tab
    Given the backend contains a category test project named "Category BDD Project" with categories
      | key  | type | name           |
      | AUTH | FR   | Authentication |
    When I open the category list for the category test project
    And I double-click category "AUTH"
    Then the URL should point to the details route for category "AUTH"
    And the tab bar should contain "Category AUTH"
    And the full category details page should show category "AUTH"

  Scenario: User closes a category details tab
    Given the backend contains a category test project named "Category BDD Project" with categories
      | key  | type | name           |
      | AUTH | FR   | Authentication |
    And I opened the category details tab for category "AUTH"
    When I close the "Category AUTH" tab
    Then the URL should point to the category list route
    And the categories table should be visible again

  Scenario: User opens a category details route directly
    Given the backend contains a category test project named "Category BDD Project" with categories
      | key  | type | name           |
      | AUTH | FR   | Authentication |
    When I open the category details URL directly for category "AUTH"
    Then the tab bar should contain "Category AUTH"
    And the full category details page should show category "AUTH"
