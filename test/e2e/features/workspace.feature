Feature: Workspace UX

    # Covers: FE-FR-LAY-0003, FE-FR-USAB-0002
    Scenario: The loading overlay is visible during startup
        Given the workspace application is starting
        Then the loading overlay is visible

    # Covers: FE-FR-PRJ-0002, FE-FR-LAY-0002, FE-FR-LAY-0005, FE-FR-USAB-0001
    # Requirement gap: Automatically selecting the first project and first requirement is useful behavior, but the exact "first item is automatically selected" rule is not explicitly stated in the frontend requirements catalogue.
    Scenario: The first project in the list is automatically selected
        Given the workspace layout is open
        Then the first project in the list is selected
        And the "Requirements" action is selected
        And the first requirement is selected

    # Covers: FE-FR-PRJ-0002, FE-FR-LAY-0005, FE-FR-USAB-0001
    Scenario: Selecting a project from the sidebar
        Given the workspace layout is open
        When I "click" on "Customer Portal" project
        Then the "Customer Portal" project is selected
        And the first requirement is selected

    # Covers: FE-FR-SRCH-0001, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Looking for a specific requirement
        Given the workspace layout is open
        When I enter "FR-INT-0038" into the search field
        And I "click" on the "Find key" button
        Then the requirement "FR-INT-0038" is selected

    # Covers: FE-FR-LAY-0003, FE-FR-PRJ-0001, FE-FR-NAV-0002
    # Note: The exact count of 8 projects is test-fixture coverage for FE-FR-PRJ-0001, not a product requirement.
    Scenario: Startup renders projects and opens a requirement tab
        Given the workspace layout is open
        And 8 projects are visible
        When I "double click" on the 1st requirement
        Then 1 dedicated requirement tab is visible

    # Covers: FE-FR-PRJ-0003, FE-FR-USAB-0002, FE-NFR-ACC-0001, FE-NFR-RESP-0001
    # Indirect coverage: The primary/secondary button hierarchy is covered only through general UX/accessibility/responsive requirements.
    # Add a dedicated form-action hierarchy requirement if stricter traceability is desired.
    Scenario: New Project form creates a backend project and keeps clear actions
        Given the workspace layout is open
        When I "click" on the "New Project" button
        Then the "New Project" form controls are aligned
        When I submit the "New Project" form with a unique cleanup project name
        Then the created cleanup project is visible in the sidebar

    # Covers: FE-FR-LAY-0004, FE-FR-SRCH-0001, FE-NFR-ACC-0001, FE-NFR-RESP-0001
    Scenario: Requirements action bar controls are aligned
        Given the workspace layout is open
        Then the requirements action bar controls are visible and aligned

    # Covers: FE-FR-LAY-0004, FE-FR-USAB-0002, FE-NFR-ACC-0001
    # Requirement gap: A "Copy key" action is not explicitly named in the frontend requirements catalogue. It is only indirectly covered as a contextual action with success/error feedback.
    Scenario: Copy key reports clipboard success and failure
        Given the workspace layout is open
        And clipboard writing succeeds
        When I "click" on the "Copy key" button
        Then I see "Key copied." copy feedback
        When clipboard writing fails
        And I "click" on the "Copy key" button
        Then I see "Could not copy the key." copy feedback

    # Covers: FE-FR-REQ-0001, FE-FR-PRJ-0005, FE-FR-USAB-0002, FE-FR-USAB-0003, FE-NFR-ACC-0001, FE-NFR-RESP-0001
    Scenario: New Requirement form has stable field layout
        Given the workspace layout is open
        When I "click" on "Reporting and Analytics" project
        And I "click" on the "New requirement" button
        Then the "New requirement" form shows active project "Reporting and Analytics"
        And the "Category" field in the "New requirement" form is required and labelled
        When I open the dropdown identified by "Category-Dropdown" in the "New requirement" form
        Then category options include "UI — User Interface — FR"
        And category options include "PERF — Performance — NFR"
        When I select the "UI — User Interface — FR" category option
        Then the derived type is "FR" in the "New requirement" form
        And all fields in the "New requirement" form remain aligned

    # Covers: FE-FR-CAT-0002, FE-FR-LAY-0002, FE-FR-USAB-0002, FE-NFR-ACC-0001, FE-NFR-RESP-0001
    Scenario: New Category form has aligned fields and category type options
        Given the workspace layout is open
        When I "click" on the "Categories" button
        And I "click" on the "New category" button
        Then the "Category key" field in the "New Category" form is labelled
        And the "Category name" field in the "New Category" form is labelled
        And the "Category type" radio group in the "New Category" form is labelled
        When I select "Non-functional (NFR)" in the "New Category" form
        Then only "Non-functional (NFR)" is selected in the "New Category" form

    # Covers: FE-FR-NAV-0002, FE-FR-LAY-0004, FE-NFR-ACC-0001, FE-NFR-RESP-0001
    # Reworked: This uses the accessible "Open in tab" action path. The double-click tab-opening path is already covered by "Startup renders projects and opens a requirement tab".
    Scenario: Requirement tabs have accessible and visible close controls
        Given the workspace layout is open
        When I select requirement "FR-INT-0038"
        And I "click" on the "Open in tab" button
        Then the requirement tab "FR-INT-0038" is visible
        And the "Workspace" tab has no close button
        When I close the requirement tab "FR-INT-0038"
        Then the "Workspace" tab is active
