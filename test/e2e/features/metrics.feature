Feature: Project metrics

  Scenario: Requirements Engineer manages a metric
    Given the backend contains a metric test project named "Metric BDD Project"
    When I open the metric list for the metric test project as a Requirements Engineer
    And I create a metric with value "2000 ms" and description "Maximum response time"
    Then metric "MET-0001" should be visible with value "2000 ms"
    When I edit metric "MET-0001" to value "1000 ms" and description "Updated response time"
    Then metric "MET-0001" should be visible with value "1000 ms"
    When I deactivate metric "MET-0001"
    Then metric "MET-0001" should be shown as deactivated

  Scenario Outline: Read-only project roles cannot mutate metrics
    Given the backend contains a metric test project named "Metric read-only BDD Project" with a metric
    And the <role> has membership in the metric test project
    When I open the metric list for the metric test project as the <role>
    Then metric "MET-0001" should be visible with value "2000 ms"
    And metric mutation controls should not be visible

    Examples:
      | role      |
      | Developer |
      | Viewer    |

  Scenario: Administrator cannot access project metrics
    Given the backend contains a metric test project named "Metric administrator BDD Project" with a metric
    When I open the metric list for the metric test project as an Administrator
    Then project metric content should not be accessible

  Scenario: Current requirement metric values navigate to usage details and refresh after edits
    Given the backend contains a metric integration project named "Metric reference BDD Project" with two referencing requirements
    When I open the requirements for the metric integration project as a Requirements Engineer
    Then metric reference "MET-0001" should render current value "2000 ms"
    When I open metric reference "MET-0001" from the requirement
    Then the metric detail should show usage count 2
    And the metric detail should list referencing requirements "NFR-PERF-0001" and "NFR-PERF-0002"
    When I update the open metric value to "1000 ms"
    And I open referencing requirement "NFR-PERF-0001" from the metric detail
    Then the requirement detail should render metric value "1000 ms"

  Scenario: Existing references to deactivated metrics still render
    Given the backend contains a metric integration project named "Deactivated metric reference BDD Project" with a deactivated referenced metric
    When I open the requirements for the metric integration project as a Requirements Engineer
    Then metric reference "MET-0001" should render current value "2000 ms"

  Scenario: Review exposes unresolved metric references
    Given the backend contains a metric integration project named "Unresolved metric BDD Project" with an unresolved metric requirement
    When I open the unresolved requirement review as a Requirements Engineer
    Then the review should show unresolved metric reference "MET-9999"
