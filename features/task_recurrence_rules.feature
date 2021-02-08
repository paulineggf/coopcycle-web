Feature: Task recurrence rules

  Scenario: Create recurrence rule (single task, existing address)
    Given the fixtures files are loaded:
      | sylius_channels.yml |
      | users.yml           |
      | addresses.yml       |
    And the user "bob" has role "ROLE_ADMIN"
    And the user "bob" is authenticated
    When I add "Content-Type" header equal to "application/ld+json"
    And I add "Accept" header equal to "application/ld+json"
    And the user "bob" sends a "POST" request to "/api/task_recurrence_rules" with body:
      """
      {
        "rule":"FREQ=WEEKLY;",
        "startDate": "2021-02-09 11:30:00",
        "endDate": "2021-02-09 12:00:00",
        "template": {
          "@type":"Task",
          "address": "/api/addresses/1",
          "after":"11:30",
          "before":"12:00"
        }
      }
      """
    Then the response status code should be 201
    And the response should be in JSON
    And the JSON should match:
      """
      {
        "@context":"/api/contexts/TaskRecurrenceRule",
        "@id":@string@,
        "@type":"TaskRecurrenceRule",
        "rule":"FREQ=WEEKLY",
        "startDate":"2021-02-09T11:30:00+01:00",
        "endDate":"2021-02-09T12:00:00+01:00",
        "template":{
          "@type":"Task",
          "address": {
            "@id": @string@,
            "streetAddress": "272, rue Saint Honoré 75001 Paris 1er"
          },
          "after":"11:30",
          "before":"12:00"
        }
      }
      """

  Scenario: Create recurrence rule (single task, new address)
    Given the fixtures files are loaded:
      | sylius_channels.yml |
      | users.yml           |
    And the user "bob" has role "ROLE_ADMIN"
    And the user "bob" is authenticated
    When I add "Content-Type" header equal to "application/ld+json"
    And I add "Accept" header equal to "application/ld+json"
    And the user "bob" sends a "POST" request to "/api/task_recurrence_rules" with body:
      """
      {
        "rule":"FREQ=WEEKLY;",
        "startDate": "2021-02-09 11:30:00",
        "endDate": "2021-02-09 12:00:00",
        "template": {
          "@type":"Task",
          "address": {
            "streetAddress": "1, Rue de Rivoli, 75004 Paris"
          },
          "after":"11:30",
          "before":"12:00"
        }
      }
      """
    Then the response status code should be 201
    And the response should be in JSON
    And the JSON should match:
      """
      {
        "@context":"/api/contexts/TaskRecurrenceRule",
        "@id":"/api/task_recurrence_rules/1",
        "@type":"TaskRecurrenceRule",
        "rule":"FREQ=WEEKLY",
        "startDate":"2021-02-09T11:30:00+01:00",
        "endDate":"2021-02-09T12:00:00+01:00",
        "template":{
          "@type":"Task",
          "address": {
            "@id": @string@,
            "streetAddress": "1 Rue de Rivoli, 75004 Paris"
          },
          "after":"11:30",
          "before":"12:00"
        }
      }
      """

  Scenario: Create recurrence rule (multiple tasks, existing address)
    Given the fixtures files are loaded:
      | sylius_channels.yml |
      | users.yml           |
      | addresses.yml       |
    And the user "bob" has role "ROLE_ADMIN"
    And the user "bob" is authenticated
    When I add "Content-Type" header equal to "application/ld+json"
    And I add "Accept" header equal to "application/ld+json"
    And the user "bob" sends a "POST" request to "/api/task_recurrence_rules" with body:
      """
      {
        "rule":"FREQ=WEEKLY;",
        "startDate": "2021-02-09 11:30:00",
        "endDate": "2021-02-09 12:00:00",
        "template": {
          "@type":"hydra:Collection",
          "hydra:member": [
            {
              "@type":"Task",
              "address": "/api/addresses/1",
              "after":"11:30",
              "before":"12:00"
            },
            {
              "@type":"Task",
              "address": "/api/addresses/2",
              "after":"12:00",
              "before":"12:30"
            }
          ]
        }
      }
      """
    Then the response status code should be 201
    And the response should be in JSON
    And the JSON should match:
      """
      {
        "@context":"/api/contexts/TaskRecurrenceRule",
        "@id":"/api/task_recurrence_rules/1",
        "@type":"TaskRecurrenceRule",
        "rule":"FREQ=WEEKLY",
        "startDate":"2021-02-09T11:30:00+01:00",
        "endDate":"2021-02-09T12:00:00+01:00",
        "template": {
          "@type":"hydra:Collection",
          "hydra:member": [
            {
              "@type":"Task",
              "address": {
                "@id": @string@,
                "streetAddress": @string@
              },
              "after":"11:30",
              "before":"12:00"
            },
            {
              "@type":"Task",
              "address": {
                "@id": @string@,
                "streetAddress": @string@
              },
              "after":"12:00",
              "before":"12:30"
            }
          ]
        }
      }
      """

  Scenario: Create recurrence rule (multiple tasks, new address)
    Given the fixtures files are loaded:
      | sylius_channels.yml |
      | users.yml           |
    And the user "bob" has role "ROLE_ADMIN"
    And the user "bob" is authenticated
    When I add "Content-Type" header equal to "application/ld+json"
    And I add "Accept" header equal to "application/ld+json"
    And the user "bob" sends a "POST" request to "/api/task_recurrence_rules" with body:
      """
      {
        "rule":"FREQ=WEEKLY;",
        "startDate": "2021-02-09 11:30:00",
        "endDate": "2021-02-09 12:00:00",
        "template": {
          "@type":"hydra:Collection",
          "hydra:member": [
            {
              "@type":"Task",
              "address": {
                "streetAddress": "1, Rue de Rivoli, 75004 Paris"
              },
              "after":"11:30",
              "before":"12:00"
            },
            {
              "@type":"Task",
              "address": {
                "streetAddress": "1, Rue de Rivoli, 75004 Paris"
              },
              "after":"12:00",
              "before":"12:30"
            }
          ]
        }
      }
      """
    Then the response status code should be 201
    And the response should be in JSON
    And the JSON should match:
      """
      {
        "@context":"/api/contexts/TaskRecurrenceRule",
        "@id":"/api/task_recurrence_rules/1",
        "@type":"TaskRecurrenceRule",
        "rule":"FREQ=WEEKLY",
        "startDate":"2021-02-09T11:30:00+01:00",
        "endDate":"2021-02-09T12:00:00+01:00",
        "template": {
          "@type":"hydra:Collection",
          "hydra:member": [
            {
              "@type":"Task",
              "address": {
                "@id": @string@,
                "streetAddress": "1 Rue de Rivoli, 75004 Paris"
              },
              "after":"11:30",
              "before":"12:00"
            },
            {
              "@type":"Task",
              "address": {
                "@id": @string@,
                "streetAddress": "1 Rue de Rivoli, 75004 Paris"
              },
              "after":"12:00",
              "before":"12:30"
            }
          ]
        }
      }
      """

  Scenario: Update recurrence rule (single task, existing address)
    Given the fixtures files are loaded:
      | sylius_channels.yml       |
      | users.yml                 |
      | addresses.yml             |
      | task_recurrence_rules.yml |
    And the user "bob" has role "ROLE_ADMIN"
    And the user "bob" is authenticated
    When I add "Content-Type" header equal to "application/ld+json"
    And I add "Accept" header equal to "application/ld+json"
    And the user "bob" sends a "PUT" request to "/api/task_recurrence_rules/1" with body:
      """
      {
        "template": {
          "@type":"Task",
          "address": "/api/addresses/2",
          "after":"11:30",
          "before":"12:30"
        }
      }
      """
    Then the response status code should be 200
    And the response should be in JSON
    And the JSON should match:
      """
      {
        "@context":"/api/contexts/TaskRecurrenceRule",
        "@id":"/api/task_recurrence_rules/1",
        "@type":"TaskRecurrenceRule",
        "rule":"FREQ=WEEKLY",
        "startDate":"2021-02-09T10:30:00+01:00",
        "endDate":"2021-02-09T11:00:00+01:00",
        "template":{
          "@type":"Task",
          "address": {
            "@id": "/api/addresses/2",
            "streetAddress": @string@
          },
          "after":"11:30",
          "before":"12:30"
        }
      }
      """

  Scenario: Update recurrence rule (single task, new address)
    Given the fixtures files are loaded:
      | sylius_channels.yml       |
      | users.yml                 |
      | addresses.yml             |
      | task_recurrence_rules.yml |
    And the user "bob" has role "ROLE_ADMIN"
    And the user "bob" is authenticated
    When I add "Content-Type" header equal to "application/ld+json"
    And I add "Accept" header equal to "application/ld+json"
    And the user "bob" sends a "PUT" request to "/api/task_recurrence_rules/1" with body:
      """
      {
        "template": {
          "@type":"Task",
          "address": {
            "streetAddress": "52, Rue de Rivoli, 75004 Paris"
          },
          "after":"11:30",
          "before":"12:30"
        }
      }
      """
    Then the response status code should be 200
    And the response should be in JSON
    And the JSON should match:
      """
      {
        "@context":"/api/contexts/TaskRecurrenceRule",
        "@id":"/api/task_recurrence_rules/1",
        "@type":"TaskRecurrenceRule",
        "rule":"FREQ=WEEKLY",
        "startDate":@string@,
        "endDate":@string@,
        "template":{
          "@type":"Task",
          "address": {
            "@id": @string@,
            "streetAddress": "52 Rue de Rivoli, 75004 Paris"
          },
          "after":"11:30",
          "before":"12:30"
        }
      }
      """

  Scenario: Apply recurrence rule
    Given the fixtures files are loaded:
      | sylius_channels.yml       |
      | users.yml                 |
      | addresses.yml             |
      | task_recurrence_rules.yml |
    And the user "bob" has role "ROLE_ADMIN"
    And the user "bob" is authenticated
    When I add "Content-Type" header equal to "application/ld+json"
    And I add "Accept" header equal to "application/ld+json"
    And the user "bob" sends a "POST" request to "/api/task_recurrence_rules/2/between" with body:
      """
      {
        "after": "2021-02-12 00:00:00",
        "before": "2021-02-12 23:59:59"
      }
      """
    Then the response status code should be 201
    And the response should be in JSON
    And the JSON should match:
      """
      {
        "@context":"/api/contexts/TaskRecurrenceRule",
        "@id":"/api/task_recurrence_rules",
        "@type":"hydra:Collection",
        "hydra:member":[
          {
            "@id":"/api/tasks/1",
            "@type":"Task"
          },
          {
            "@id":"/api/tasks/2",
            "@type":"Task"
          }
        ],
        "hydra:totalItems":2
      }
      """
