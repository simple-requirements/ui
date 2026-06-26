Feature: Categories

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
