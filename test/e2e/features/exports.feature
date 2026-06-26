Feature: Exports

    # Covers: FE-FR-IMEX-0001, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Project context menu opens the project export dialog
        Given the workspace layout is open
        When I open the context menu for "Customer Portal" project
        Then the context menu offers "Export project"
        And the context menu offers "Export all projects"
        When I choose "Export project" from the context menu
        Then the export dialog "Export project Customer Portal" is visible
        And the export dialog offers "GitHub-flavored Markdown"
        And the export dialog offers "AsciiDoc"

    # Covers: FE-FR-IMEX-0001, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Project context menu opens the all-projects export dialog
        Given the workspace layout is open
        When I open the context menu for "Customer Portal" project
        And I choose "Export all projects" from the context menu
        Then the export dialog "Export all projects" is visible
        And the export dialog offers "JSON"

    # Covers: FE-FR-IMEX-0001, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Requirement context menu opens the requirement selection export dialog
        Given the workspace layout is open
        When I open the context menu for requirement "FR-INT-0038"
        Then the context menu offers "Export requirement(s)"
        And the context menu offers "Export all requirements"
        When I choose "Export requirement(s)" from the context menu
        Then the export dialog "Export FR-INT-0038" is visible
        And the export dialog offers "GitHub-flavored Markdown"
        And the export dialog offers "AsciiDoc"

    # Covers: FE-FR-IMEX-0001, FE-FR-USAB-0002, FE-NFR-ACC-0001
    Scenario: Requirement context menu opens the all-requirements export dialog
        Given the workspace layout is open
        When I open the context menu for requirement "FR-INT-0038"
        And I choose "Export all requirements" from the context menu
        Then the export dialog "Export all requirements" is visible
        And the export dialog offers "JSON"
