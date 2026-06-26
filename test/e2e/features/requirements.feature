Feature: Requirements

    # Covers: FE-FR-SRCH-0001, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Looking for a specific requirement
        Given the workspace layout is open
        When I select the first requirement that is not "FR-INT-0038"
        And I enter "FR-INT-0038" into the search field
        And I "click" on the "Find key" button
        Then only the requirement "FR-INT-0038" is selected
        And the requirement "FR-INT-0038" checkbox is checked
        And a toast message says "Selected FR-INT-0038."

    # Covers: FE-FR-LAY-0004, FE-FR-SRCH-0001, FE-NFR-ACC-0001, FE-NFR-RESP-0001
    Scenario: Requirements action bar controls are aligned
        Given the workspace layout is open
        Then the requirements action bar controls are visible and aligned
        And the project unavailable action-bar text is not visible

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
        And the description editor mode buttons use active primary and inactive secondary outlines
        When I fill the "Description" field in the "New requirement" form with "The system shall keep rendering while I type."
        Then the "Description" field in the "New requirement" form contains "The system shall keep rendering while I type."
        And all fields in the "New requirement" form remain aligned

    # Covers: FE-FR-REQ-0002, FE-FR-VIEW-0001, FE-FR-USAB-0002
    Scenario: Requirement detail is read-only and shows category key only
        Given the workspace layout is open
        When I "click" on "Reporting and Analytics" project
        And I select requirement "NFR-USAB-0043"
        Then the requirement detail category is "USAB"
        And the read-only requirement detail does not show description mode buttons

    # Covers: FE-FR-LIFE-0001, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Deleting a draft requirement uses the reusable confirmation dialog
        Given the workspace layout is open
        When I "click" on "Reporting and Analytics" project
        And I select requirement "NFR-USAB-0043"
        And I "click" on the "Delete" button
        Then the confirmation dialog "Delete draft requirement" is visible
        When I cancel the confirmation dialog
        Then the requirement "NFR-USAB-0043" is selected


    # Covers: FE-FR-REQ-0003, FE-FR-LIFE-0002, FE-FR-LIFE-0003, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Requirement context menu exposes draft lifecycle actions
        Given the workspace layout is open
        When I "click" on "Reporting and Analytics" project
        And I open the context menu for requirement "NFR-USAB-0043"
        Then the context menu offers "Edit"
        And the context menu offers "Approve"
        And the context menu offers "Reject"
        When I choose "Edit" from the context menu
        Then the requirement edit form heading is "NFR-USAB-0043"

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
