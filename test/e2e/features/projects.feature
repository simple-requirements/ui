Feature: Projects

    # Covers: FE-FR-PRJ-0002, FE-FR-LAY-0005, FE-FR-USAB-0001
    Scenario: Selecting a project from the sidebar
        Given the workspace layout is open
        When I "click" on "Customer Portal" project
        Then the "Customer Portal" project is selected
        And the first requirement is selected

    # Covers: FE-FR-LAY-0003, FE-FR-PRJ-0001, FE-FR-NAV-0002
    # Note: The exact count of 8 projects is test-fixture coverage for FE-FR-PRJ-0001, not a product requirement.
    Scenario: Startup renders projects and opens a requirement tab
        Given the workspace layout is open
        And 8 projects are visible
        When I "double click" on the 1st requirement
        Then 1 dedicated requirement tab is visible

    # Covers: FE-FR-PRJ-0003, FE-FR-USAB-0002, FE-NFR-ACC-0001, FE-NFR-RESP-0001
    Scenario: New Project panel can be cancelled
        Given the workspace layout is open
        When I "click" on the "New Project" button
        Then the "New Project" form controls are aligned
        When I cancel the "New Project" form
        Then the "New Project" form is closed

    # Covers: FE-FR-PRJ-0003, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: New Project form reports an empty name
        Given the workspace layout is open
        When I "click" on the "New Project" button
        Then the "New Project" form controls are aligned
        When I click "Create" in the "New Project" form
        Then the "Project name" field reports a missing value in the "New Project" form

    # Covers: FE-FR-PRJ-0003, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: New Project form creates a backend project
        Given the workspace layout is open
        When I "click" on the "New Project" button
        Then the "New Project" form controls are aligned
        When I fill the "Project name" field in the "New Project" form with "Test project"
        And I click "Create" in the "New Project" form
        Then the "Test project" project is visible in the sidebar
