Feature: Review assignment tasks
  Requirements Engineers can assign draft reviews to another engineer and assignees can see pending work in the requirements table.

  Scenario: Requirements Engineer assigns a review task
    Given the backend contains a review-task project named "Review Task Assignment BDD Project" with a draft requirement
    And the Review Engineer has membership in the review-task project
    When I open the review-task requirement review as a Requirements Engineer
    And I assign the review task to "Review Engineer"
    Then review assignments should show "Review Engineer" as "Pending"

  Scenario: Assigned Requirements Engineer sees the pending review in the requirements table
    Given the backend contains a review-task project named "Review Task Table BDD Project" with a pending task for the Review Engineer
    When I open the review-task project requirements as the Review Engineer
    Then the review-task requirement should show a review action
    When I open the review action for the review-task requirement
    Then the review-task requirement review should be open
