Feature: Workspace shell

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
