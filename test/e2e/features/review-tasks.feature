Feature: Review assignment tasks
  Requirements Engineers can assign draft reviews to another engineer and assignees can manage their pending work.

  Scenario: Requirements Engineer assigns a review task
    Given the backend contains a review-task project named "Review Task Assignment BDD Project" with a draft requirement
    And the Review Engineer has membership in the review-task project
    When I open the review-task requirement review as a Requirements Engineer
    And I assign the review task to "Review Engineer"
    Then review assignments should show "Review Engineer" as "Pending"

  Scenario: Assigned Requirements Engineer sees and completes a pending task
    Given the backend contains a review-task project named "Review Task Inbox BDD Project" with a pending task for the Review Engineer
    When I open my review tasks as the Review Engineer
    Then my review tasks should contain the review-task requirement
    When I mark the review-task requirement completed
    And I show completed review tasks
    Then my review tasks should show the review-task requirement as "completed"
