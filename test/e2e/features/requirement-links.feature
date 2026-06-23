Feature: Requirement links

    # Covers: FE-FR-REF-0001, FE-FR-REF-0002, FE-FR-VER-0002
    Scenario: Requirement detail shows link panels and history
        Given a temporary project with linked requirements is open
        Then the requirement links section is visible
        And the outgoing links section is visible
        And the incoming links section is visible
        And the link history section is visible
        And the outgoing links include the existing temporary target
        And the incoming links include the existing temporary source

    # Covers: FE-FR-REF-0001, FE-FR-REF-0002, FE-FR-USAB-0002
    Scenario: Create a requirement link by target visible key
        Given a temporary project with linked requirements is open
        When I create a requirement link to the unused temporary target
        Then the outgoing links include the unused temporary target
        And the link history contains a "created" event

    # Covers: FE-FR-REF-0001, FE-NFR-ACC-0001
    Scenario: Invalid requirement link target key is rejected
        Given a temporary project with linked requirements is open
        When I try to create a requirement link to "bad-key"
        Then I see "Enter a valid target key" link feedback

    # Covers: FE-FR-REF-0001, FE-FR-REF-0002, FE-FR-USAB-0002
    Scenario: Correct an outgoing requirement link target
        Given a temporary project with linked requirements is open
        When I correct the existing outgoing link to the unused temporary target
        Then the outgoing links include the unused temporary target
        And the link history contains a "target changed" event

    # Covers: FE-FR-REF-0001, FE-FR-REF-0002, FE-FR-USAB-0002
    Scenario: Remove an outgoing requirement link
        Given a temporary project with linked requirements is open
        When I remove the existing outgoing requirement link
        Then the outgoing links no longer include the existing temporary target
        And the link history contains a "deleted" event

    # Covers: FE-FR-REF-0001, FE-FR-REQ-0002
    Scenario: Open a linked requirement from outgoing links
        Given a temporary project with linked requirements is open
        When I open the existing outgoing linked requirement
        Then the linked target requirement is selected

    # Covers: FE-FR-VER-0002, FE-FR-REF-0001
    Scenario: Revision comparison shows requirement link changes
        Given a temporary project with linked requirements is open
        When I open revision comparison "1..current"
        Then the comparison shows requirement link changes
        And the comparison shows added outgoing requirement links
