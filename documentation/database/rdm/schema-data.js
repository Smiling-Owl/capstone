window.SCHEMA_DATA = {
  "title": "Disaster Situation Record Management and Situation Report Generation System",
  "generatedAt": "2026-09-08T15:57:06.704Z",
  "sqlFile": "../../../development/supabase/migrations/202609080001_initial_domain_schema.sql",
  "tables": [
    {
      "schema": "auth",
      "name": "users",
      "group": "Accounts and jurisdiction",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "account",
      "group": "Accounts and jurisdiction",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "auth_user_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "level",
          "type": "account_level",
          "nullable": false,
          "default": null
        },
        {
          "name": "username",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "address",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "first_name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "middle_name",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "last_name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "designation",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "official_email",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "official_mobile",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "status",
          "type": "account_status",
          "nullable": false,
          "default": "'active'::account_status"
        },
        {
          "name": "created_by_account_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        },
        {
          "name": "deactivated_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "deactivation_reason",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "account_auth_user_id_fkey",
          "columns": [
            "auth_user_id"
          ],
          "targetSchema": "auth",
          "targetTable": "users",
          "targetColumns": [
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "account_tenant_id_created_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "created_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "account_tenant_id_fkey",
          "columns": [
            "tenant_id"
          ],
          "targetSchema": "public",
          "targetTable": "tenant",
          "targetColumns": [
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "auth_user_id"
        ],
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": [
        "CHECK ((status = 'deactivated'::account_status) = (deactivated_at IS NOT NULL))",
        "CHECK (status <> 'deactivated'::account_status OR NULLIF(btrim(deactivation_reason), ''::text) IS NOT NULL)",
        "CHECK (btrim(first_name) <> ''::text)",
        "CHECK (btrim(last_name) <> ''::text)",
        "CHECK (username ~ '^[A-Za-z0-9_.-]{3,64}$'::text)"
      ]
    },
    {
      "schema": "public",
      "name": "affected_population",
      "group": "Incident reporting",
      "comment": "Family and person totals have independent states so a known count is never inferred from an unknown value.",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "effect_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "population_category",
          "type": "text",
          "nullable": false,
          "default": "'all affected'::text"
        },
        {
          "name": "family_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "family_count_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "person_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "person_count_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "current_or_cumulative",
          "type": "text",
          "nullable": false,
          "default": "'current'::text"
        }
      ],
      "primaryKey": [
        "effect_item_id"
      ],
      "foreignKeys": [
        {
          "name": "affected_population_tenant_id_effect_item_id_fkey",
          "columns": [
            "tenant_id",
            "effect_item_id"
          ],
          "targetSchema": "public",
          "targetTable": "report_effect_item",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "effect_item_id"
        ]
      ],
      "checks": [
        "CHECK (valid_count_state(family_count, family_count_state))",
        "CHECK (valid_count_state(person_count, person_count_state))",
        "CHECK (current_or_cumulative = ANY (ARRAY['current'::text, 'cumulative'::text]))"
      ]
    },
    {
      "schema": "public",
      "name": "audit_event",
      "group": "Evidence and audit",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "bigint",
          "nullable": false,
          "default": null
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "actor_account_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "action",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "entity_type",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "entity_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "previous_state",
          "type": "jsonb",
          "nullable": true,
          "default": null
        },
        {
          "name": "new_state",
          "type": "jsonb",
          "nullable": true,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "occurred_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "audit_event_tenant_id_actor_account_id_fkey",
          "columns": [
            "tenant_id",
            "actor_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "audit_event_tenant_id_fkey",
          "columns": [
            "tenant_id"
          ],
          "targetSchema": "public",
          "targetTable": "tenant",
          "targetColumns": [
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "barangay_account",
      "group": "Accounts and jurisdiction",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "barangay_unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "account_id"
      ],
      "foreignKeys": [
        {
          "name": "barangay_account_tenant_id_account_id_fkey",
          "columns": [
            "tenant_id",
            "account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "barangay_account_tenant_id_barangay_unit_id_fkey",
          "columns": [
            "tenant_id",
            "barangay_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "account_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "barangay_profile_source",
      "group": "Monthly CDRA profiles",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "barangay_profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "purok_profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "purok_profile_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "disposition",
          "type": "source_disposition",
          "nullable": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "reconciliation_notes",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "added_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "tenant_id",
        "barangay_profile_version_id",
        "purok_profile_version_id"
      ],
      "foreignKeys": [
        {
          "name": "barangay_profile_source_tenant_id_barangay_profile_version_fkey",
          "columns": [
            "tenant_id",
            "barangay_profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "barangay_profile_source_tenant_id_purok_profile_version_id_fkey",
          "columns": [
            "tenant_id",
            "purok_profile_version_id",
            "purok_profile_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id",
            "profile_id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "barangay_profile_version_id",
          "purok_profile_id"
        ]
      ],
      "checks": [
        "CHECK (disposition = 'included'::source_disposition OR NULLIF(btrim(reason), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "barangay_report_source",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "barangay_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "purok_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "purok_report_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "disposition",
          "type": "source_disposition",
          "nullable": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "reconciliation_notes",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "added_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "tenant_id",
        "barangay_report_version_id",
        "purok_report_version_id"
      ],
      "foreignKeys": [
        {
          "name": "barangay_report_source_tenant_id_barangay_report_version_i_fkey",
          "columns": [
            "tenant_id",
            "barangay_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "barangay_report_source_tenant_id_purok_report_version_id_p_fkey",
          "columns": [
            "tenant_id",
            "purok_report_version_id",
            "purok_report_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id",
            "report_id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "barangay_report_version_id",
          "purok_report_id"
        ]
      ],
      "checks": [
        "CHECK (disposition = 'included'::source_disposition OR NULLIF(btrim(reason), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "casualty_summary",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "effect_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "dead_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "dead_count_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "injured_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "injured_count_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "ill_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "ill_count_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "missing_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "missing_count_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "validation_classification",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "cause",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "medical_assistance_summary",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "restricted_register_reference",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "effect_item_id"
      ],
      "foreignKeys": [
        {
          "name": "casualty_summary_tenant_id_effect_item_id_fkey",
          "columns": [
            "tenant_id",
            "effect_item_id"
          ],
          "targetSchema": "public",
          "targetTable": "report_effect_item",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "effect_item_id"
        ]
      ],
      "checks": [
        "CHECK (valid_count_state(dead_count, dead_count_state))",
        "CHECK (valid_count_state(injured_count, injured_count_state))",
        "CHECK (valid_count_state(ill_count, ill_count_state))",
        "CHECK (valid_count_state(missing_count, missing_count_state))",
        "CHECK (validation_classification = ANY (ARRAY['validated'::text, 'for_validation'::text]))"
      ]
    },
    {
      "schema": "public",
      "name": "damage_assessment",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "effect_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "damage_category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "asset_or_facility_name",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "owner_or_responsible_party",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "assessment_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "validating_agency",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "operational_status",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "commodity",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "farmers_affected",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "fisherfolk_affected",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "livestock_owners_affected",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "livestock_affected",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "aquaculture_area_affected",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "production_lost",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "production_unit",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "estimated_repair_cost",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "damage_classification",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "partially_damaged_quantity",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "partially_damaged_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "totally_damaged_quantity",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "totally_damaged_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "affected_area",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "affected_area_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "measurement_unit",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "estimated_damage",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "estimated_damage_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "estimated_loss",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "estimated_loss_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "effect_item_id"
      ],
      "foreignKeys": [
        {
          "name": "damage_assessment_tenant_id_effect_item_id_fkey",
          "columns": [
            "tenant_id",
            "effect_item_id"
          ],
          "targetSchema": "public",
          "targetTable": "report_effect_item",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "effect_item_id"
        ]
      ],
      "checks": [
        "CHECK (affected_area IS NULL OR affected_area >= 0::numeric)",
        "CHECK (aquaculture_area_affected >= 0::numeric)",
        "CHECK (valid_numeric_state(partially_damaged_quantity, partially_damaged_state))",
        "CHECK (valid_numeric_state(totally_damaged_quantity, totally_damaged_state))",
        "CHECK (valid_numeric_state(affected_area, affected_area_state))",
        "CHECK (valid_numeric_state(estimated_damage, estimated_damage_state))",
        "CHECK (valid_numeric_state(estimated_loss, estimated_loss_state))",
        "CHECK (estimated_damage IS NULL OR estimated_damage >= 0::numeric)",
        "CHECK (estimated_loss IS NULL OR estimated_loss >= 0::numeric)",
        "CHECK (estimated_repair_cost >= 0::numeric)",
        "CHECK (farmers_affected >= 0)",
        "CHECK (fisherfolk_affected >= 0)",
        "CHECK (livestock_affected >= 0)",
        "CHECK (livestock_owners_affected >= 0)",
        "CHECK (partially_damaged_quantity IS NULL OR partially_damaged_quantity >= 0::numeric)",
        "CHECK (production_lost >= 0::numeric)",
        "CHECK (totally_damaged_quantity IS NULL OR totally_damaged_quantity >= 0::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "drrm_account",
      "group": "Accounts and jurisdiction",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "city_unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "account_id"
      ],
      "foreignKeys": [
        {
          "name": "drrm_account_tenant_id_account_id_fkey",
          "columns": [
            "tenant_id",
            "account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "drrm_account_tenant_id_city_unit_id_fkey",
          "columns": [
            "tenant_id",
            "city_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "account_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "evacuation_center",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "managing_organization",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "capacity_persons",
          "type": "bigint",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "evacuation_center_tenant_id_unit_id_fkey",
          "columns": [
            "tenant_id",
            "unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": [
        "CHECK (capacity_persons >= 0)"
      ]
    },
    {
      "schema": "public",
      "name": "evidence",
      "group": "Evidence and audit",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_type",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "storage_path",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "captured_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "latitude",
          "type": "numeric(9,6)",
          "nullable": true,
          "default": null
        },
        {
          "name": "longitude",
          "type": "numeric(9,6)",
          "nullable": true,
          "default": null
        },
        {
          "name": "caption",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "privacy_classification",
          "type": "text",
          "nullable": false,
          "default": "'restricted'::text"
        },
        {
          "name": "integrity_checksum",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "uploaded_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "uploaded_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "evidence_tenant_id_uploaded_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "uploaded_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "storage_path"
        ]
      ],
      "checks": [
        "CHECK (latitude IS NULL OR latitude >= '-90'::integer::numeric AND latitude <= 90::numeric)",
        "CHECK (longitude IS NULL OR longitude >= '-180'::integer::numeric AND longitude <= 180::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "hazard_characteristic",
      "group": "Hazards",
      "comment": "Typed hazard condition fields; the linked hazard_version preserves identification, time, description and severity.",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "intensity_or_magnitude",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "intensity_unit",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "duration_hours",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "alert_level",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "current_status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "advisory_agency",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "advisory_number",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "advisory_issued_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "expected_development",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "hazard_version_id"
      ],
      "foreignKeys": [
        {
          "name": "hazard_characteristic_tenant_id_hazard_version_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "hazard_characteristic_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "hazard_version_id"
        ]
      ],
      "checks": [
        "CHECK (intensity_or_magnitude IS NULL OR NULLIF(btrim(intensity_unit), ''::text) IS NOT NULL)",
        "CHECK (duration_hours >= 0::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "hazard_record",
      "group": "Hazards",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_type_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "reference_number",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "hazard_record_tenant_id_created_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "created_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "hazard_record_tenant_id_hazard_type_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_type_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_type",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "hazard_record_tenant_id_unit_id_fkey",
          "columns": [
            "tenant_id",
            "unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "reference_number"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "hazard_review_decision",
      "group": "Hazards",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "reviewer_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "outcome",
          "type": "review_outcome",
          "nullable": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "correction_request",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "accepted_limitations",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "decided_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "hazard_review_decision_tenant_id_hazard_version_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "hazard_review_decision_tenant_id_reviewer_account_id_fkey",
          "columns": [
            "tenant_id",
            "reviewer_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "hazard_version_id"
        ],
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": [
        "CHECK (outcome = 'verified'::review_outcome OR NULLIF(btrim(reason), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "hazard_type",
      "group": "Hazards",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "code",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "definition",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "authority_reference",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "active",
          "type": "boolean",
          "nullable": false,
          "default": "true"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "hazard_type_tenant_id_fkey",
          "columns": [
            "tenant_id"
          ],
          "targetSchema": "public",
          "targetTable": "tenant",
          "targetColumns": [
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "code"
        ],
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "hazard_version",
      "group": "Hazards",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_record_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "parent_version_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "version_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "landmark",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "geometry",
          "type": "jsonb",
          "nullable": true,
          "default": null
        },
        {
          "name": "assessment_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "onset_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "end_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "observed_or_forecast",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "severity",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "confidence_level",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "state",
          "type": "record_state",
          "nullable": false,
          "default": "'draft'::record_state"
        },
        {
          "name": "prepared_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "submitted_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "submission_key",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "content_hash",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "hazard_version_tenant_id_hazard_record_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_record_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_record",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "hazard_version_tenant_id_parent_version_id_fkey",
          "columns": [
            "tenant_id",
            "parent_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "hazard_version_tenant_id_prepared_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "prepared_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "hazard_record_id",
          "version_number"
        ],
        [
          "tenant_id",
          "id",
          "hazard_record_id"
        ],
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "prepared_by_account_id",
          "submission_key"
        ]
      ],
      "checks": [
        "CHECK (end_at IS NULL OR onset_at IS NULL OR end_at >= onset_at)",
        "CHECK (state = 'draft'::record_state AND submitted_at IS NULL AND submission_key IS NULL AND content_hash IS NULL OR state = 'submitted'::record_state AND submitted_at IS NOT NULL AND submission_key IS NOT NULL AND content_hash IS NOT NULL)",
        "CHECK (version_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "hazard_version_evidence",
      "group": "Hazards",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_role",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "hazard_version_id",
        "evidence_id"
      ],
      "foreignKeys": [
        {
          "name": "hazard_version_evidence_tenant_id_evidence_id_fkey",
          "columns": [
            "tenant_id",
            "evidence_id"
          ],
          "targetSchema": "public",
          "targetTable": "evidence",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "hazard_version_evidence_tenant_id_hazard_version_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "incident",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "incident_type_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "reference_number",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "nullable": false,
          "default": "'open'::text"
        },
        {
          "name": "created_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        },
        {
          "name": "closed_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "incident_tenant_id_created_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "created_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "incident_tenant_id_incident_type_id_fkey",
          "columns": [
            "tenant_id",
            "incident_type_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_type",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "reference_number"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "incident_hazard",
      "group": "Hazards",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "incident_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "relationship_type",
          "type": "text",
          "nullable": false,
          "default": "'primary'::text"
        },
        {
          "name": "description",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "incident_id",
        "hazard_version_id"
      ],
      "foreignKeys": [
        {
          "name": "incident_hazard_tenant_id_hazard_version_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "incident_hazard_tenant_id_incident_id_fkey",
          "columns": [
            "tenant_id",
            "incident_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "incident_report",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "incident_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "reporting_unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "level",
          "type": "report_level",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "incident_report_tenant_id_created_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "created_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "incident_report_tenant_id_incident_id_fkey",
          "columns": [
            "tenant_id",
            "incident_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "incident_report_tenant_id_reporting_unit_id_fkey",
          "columns": [
            "tenant_id",
            "reporting_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "incident_id",
          "reporting_unit_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "incident_report_version",
      "group": "Incident reporting",
      "comment": "Purok versions are always Initial; Barangay versions may be Initial, Progress, Terminal, or Final. Submitted content is immutable.",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "parent_version_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "version_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "stage",
          "type": "report_stage",
          "nullable": false,
          "default": null
        },
        {
          "name": "occurrence_or_observation_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "occurrence_time_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "landmark",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "as_of_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "consolidation_cutoff_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "prevailing_situation",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "urgent_needs_remarks",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "limitations",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "state",
          "type": "record_state",
          "nullable": false,
          "default": "'draft'::record_state"
        },
        {
          "name": "prepared_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "submitted_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "received_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "submission_key",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "content_hash",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "incident_report_version_tenant_id_parent_version_id_fkey",
          "columns": [
            "tenant_id",
            "parent_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "incident_report_version_tenant_id_prepared_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "prepared_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "incident_report_version_tenant_id_report_id_fkey",
          "columns": [
            "tenant_id",
            "report_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "id",
          "report_id"
        ],
        [
          "tenant_id",
          "prepared_by_account_id",
          "submission_key"
        ],
        [
          "tenant_id",
          "report_id",
          "version_number"
        ]
      ],
      "checks": [
        "CHECK ((occurrence_time_state = ANY (ARRAY['unknown'::value_state, 'not_applicable'::value_state])) AND occurrence_or_observation_at IS NULL OR (occurrence_time_state <> ALL (ARRAY['unknown'::value_state, 'not_applicable'::value_state])) AND occurrence_or_observation_at IS NOT NULL)",
        "CHECK (state = 'draft'::record_state AND submitted_at IS NULL AND submission_key IS NULL AND content_hash IS NULL OR state = 'submitted'::record_state AND submitted_at IS NOT NULL AND submission_key IS NOT NULL AND content_hash IS NOT NULL)",
        "CHECK (btrim(location_description) <> ''::text)",
        "CHECK (btrim(prevailing_situation) <> ''::text)",
        "CHECK (version_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "incident_type",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "code",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "active",
          "type": "boolean",
          "nullable": false,
          "default": "true"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "incident_type_tenant_id_fkey",
          "columns": [
            "tenant_id"
          ],
          "targetSchema": "public",
          "targetTable": "tenant",
          "targetColumns": [
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "code"
        ],
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "information_source",
      "group": "Evidence and audit",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_type",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_organization",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "reference_number",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "reference_url",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "observed_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "received_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        },
        {
          "name": "confidentiality_classification",
          "type": "text",
          "nullable": false,
          "default": "'internal'::text"
        },
        {
          "name": "reliability_notes",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "created_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "information_source_tenant_id_created_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "created_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": [
        "CHECK (btrim(source_name) <> ''::text)",
        "CHECK (btrim(source_type) <> ''::text)"
      ]
    },
    {
      "schema": "public",
      "name": "organization_unit",
      "group": "Reference and administration",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "parent_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "kind",
          "type": "unit_kind",
          "nullable": false,
          "default": null
        },
        {
          "name": "code",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "geographic_code",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "province_name",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "boundary_reference",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "active",
          "type": "boolean",
          "nullable": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "organization_unit_tenant_id_fkey",
          "columns": [
            "tenant_id"
          ],
          "targetSchema": "public",
          "targetTable": "tenant",
          "targetColumns": [
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "organization_unit_tenant_id_parent_id_fkey",
          "columns": [
            "tenant_id",
            "parent_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "code"
        ],
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": [
        "CHECK (btrim(code) <> ''::text)",
        "CHECK (btrim(name) <> ''::text)"
      ]
    },
    {
      "schema": "public",
      "name": "profile",
      "group": "Monthly CDRA profiles",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "level",
          "type": "profile_level",
          "nullable": false,
          "default": null
        },
        {
          "name": "reporting_month",
          "type": "date",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "profile_tenant_id_unit_id_fkey",
          "columns": [
            "tenant_id",
            "unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "unit_id",
          "reporting_month"
        ]
      ],
      "checks": [
        "CHECK (EXTRACT(day FROM reporting_month) = 1::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "profile_demographic",
      "group": "Monthly CDRA profiles",
      "comment": "Aggregate categories may overlap. Record the adopted age/group definition; do not sum vulnerability groups into total population.",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "person_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "person_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "category_definition",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "profile_version_id",
        "category"
      ],
      "foreignKeys": [
        {
          "name": "profile_demographic_tenant_id_profile_version_id_fkey",
          "columns": [
            "tenant_id",
            "profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_demographic_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": [
        "CHECK (category = ANY (ARRAY['infants'::text, 'children'::text, 'adults'::text, 'senior_citizens'::text, 'persons_with_disabilities'::text, 'pregnant_women'::text, 'lactating_women'::text]))",
        "CHECK (btrim(category_definition) <> ''::text)",
        "CHECK (valid_count_state(person_count, person_count_state))"
      ]
    },
    {
      "schema": "public",
      "name": "profile_exposed_group",
      "group": "Monthly CDRA profiles",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "exposure_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "group_name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "person_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "person_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        }
      ],
      "primaryKey": [
        "tenant_id",
        "exposure_id",
        "group_name"
      ],
      "foreignKeys": [
        {
          "name": "profile_exposed_group_tenant_id_exposure_id_fkey",
          "columns": [
            "tenant_id",
            "exposure_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_hazard_exposure",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": [
        "CHECK (valid_count_state(person_count, person_count_state))"
      ]
    },
    {
      "schema": "public",
      "name": "profile_hazard_exposure",
      "group": "Monthly CDRA profiles",
      "comment": "Baseline exposure by hazard, not observed disaster impact. Multi-hazard exposed populations must not be summed across hazards.",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_type_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "exposed_family_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "exposed_family_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "exposed_household_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "exposed_household_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "exposed_person_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "exposed_person_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "exposure_basis",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "map_reference",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "remarks",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "profile_hazard_exposure_tenant_id_hazard_type_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_type_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_type",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_hazard_exposure_tenant_id_profile_version_id_fkey",
          "columns": [
            "tenant_id",
            "profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_hazard_exposure_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "profile_version_id",
          "hazard_type_id"
        ]
      ],
      "checks": [
        "CHECK (valid_count_state(exposed_family_count, exposed_family_count_state))",
        "CHECK (valid_count_state(exposed_household_count, exposed_household_count_state))",
        "CHECK (valid_count_state(exposed_person_count, exposed_person_count_state))"
      ]
    },
    {
      "schema": "public",
      "name": "profile_housing",
      "group": "Monthly CDRA profiles",
      "comment": "Light materials, near water, and near fault categories overlap; their sum is not total housing.",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "housing_unit_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "housing_unit_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "light_material_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "light_material_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "near_water_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "near_water_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "near_fault_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "near_fault_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "profile_version_id"
      ],
      "foreignKeys": [
        {
          "name": "profile_housing_tenant_id_profile_version_id_fkey",
          "columns": [
            "tenant_id",
            "profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_housing_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "profile_version_id"
        ]
      ],
      "checks": [
        "CHECK (valid_count_state(housing_unit_count, housing_unit_count_state))",
        "CHECK (valid_count_state(light_material_count, light_material_count_state))",
        "CHECK (valid_count_state(near_water_count, near_water_count_state))",
        "CHECK (valid_count_state(near_fault_count, near_fault_count_state))",
        "CHECK (light_material_count IS NULL OR housing_unit_count IS NULL OR light_material_count <= housing_unit_count)",
        "CHECK (near_water_count IS NULL OR housing_unit_count IS NULL OR near_water_count <= housing_unit_count)",
        "CHECK (near_fault_count IS NULL OR housing_unit_count IS NULL OR near_fault_count <= housing_unit_count)"
      ]
    },
    {
      "schema": "public",
      "name": "profile_population",
      "group": "Monthly CDRA profiles",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "population_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "population_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "household_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "household_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "family_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "family_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "male_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "male_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "female_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "female_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "profile_version_id"
      ],
      "foreignKeys": [
        {
          "name": "profile_population_tenant_id_profile_version_id_fkey",
          "columns": [
            "tenant_id",
            "profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_population_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "profile_version_id"
        ]
      ],
      "checks": [
        "CHECK (valid_count_state(population_count, population_count_state))",
        "CHECK (valid_count_state(household_count, household_count_state))",
        "CHECK (valid_count_state(family_count, family_count_state))",
        "CHECK (valid_count_state(male_count, male_count_state))",
        "CHECK (valid_count_state(female_count, female_count_state))",
        "CHECK (male_count IS NULL OR population_count IS NULL OR male_count <= population_count)",
        "CHECK (female_count IS NULL OR population_count IS NULL OR female_count <= population_count)",
        "CHECK (male_count IS NULL OR female_count IS NULL OR population_count IS NULL OR (male_count + female_count) <= population_count)"
      ]
    },
    {
      "schema": "public",
      "name": "profile_review_decision",
      "group": "Monthly CDRA profiles",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "reviewer_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "outcome",
          "type": "review_outcome",
          "nullable": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "correction_request",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "accepted_limitations",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "decided_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "profile_review_decision_tenant_id_profile_version_id_fkey",
          "columns": [
            "tenant_id",
            "profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_review_decision_tenant_id_reviewer_account_id_fkey",
          "columns": [
            "tenant_id",
            "reviewer_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "profile_version_id"
        ]
      ],
      "checks": [
        "CHECK (outcome = 'verified'::review_outcome OR NULLIF(btrim(reason), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "profile_version",
      "group": "Monthly CDRA profiles",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "profile_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "parent_version_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "version_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "as_of_date",
          "type": "date",
          "nullable": false,
          "default": null
        },
        {
          "name": "methodology_notes",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "data_gap_notes",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "limitations",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "state",
          "type": "record_state",
          "nullable": false,
          "default": "'draft'::record_state"
        },
        {
          "name": "prepared_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "submitted_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "submission_key",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "content_hash",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "profile_version_tenant_id_parent_version_id_fkey",
          "columns": [
            "tenant_id",
            "parent_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_version_tenant_id_prepared_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "prepared_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_version_tenant_id_profile_id_fkey",
          "columns": [
            "tenant_id",
            "profile_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "id",
          "profile_id"
        ],
        [
          "tenant_id",
          "prepared_by_account_id",
          "submission_key"
        ],
        [
          "tenant_id",
          "profile_id",
          "version_number"
        ]
      ],
      "checks": [
        "CHECK (state = 'draft'::record_state AND submitted_at IS NULL AND submission_key IS NULL AND content_hash IS NULL OR state = 'submitted'::record_state AND submitted_at IS NOT NULL AND submission_key IS NOT NULL AND content_hash IS NOT NULL)",
        "CHECK (version_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "profile_version_evidence",
      "group": "Monthly CDRA profiles",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "profile_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_role",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "profile_version_id",
        "evidence_id"
      ],
      "foreignKeys": [
        {
          "name": "profile_version_evidence_tenant_id_evidence_id_fkey",
          "columns": [
            "tenant_id",
            "evidence_id"
          ],
          "targetSchema": "public",
          "targetTable": "evidence",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "profile_version_evidence_tenant_id_profile_version_id_fkey",
          "columns": [
            "tenant_id",
            "profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "purok_account",
      "group": "Accounts and jurisdiction",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "purok_unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "account_id"
      ],
      "foreignKeys": [
        {
          "name": "purok_account_tenant_id_account_id_fkey",
          "columns": [
            "tenant_id",
            "account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "purok_account_tenant_id_purok_unit_id_fkey",
          "columns": [
            "tenant_id",
            "purok_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "account_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "report_effect_item",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "effect_kind",
          "nullable": false,
          "default": null
        },
        {
          "name": "affected_location",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "information_as_of_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "remarks",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "report_effect_item_tenant_id_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "report_effect_item_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "report_review_decision",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "reviewer_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "outcome",
          "type": "review_outcome",
          "nullable": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "correction_request",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "accepted_limitations",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "decided_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "report_review_decision_tenant_id_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "report_review_decision_tenant_id_reviewer_account_id_fkey",
          "columns": [
            "tenant_id",
            "reviewer_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "report_version_id"
        ]
      ],
      "checks": [
        "CHECK (outcome = 'verified'::review_outcome OR NULLIF(btrim(reason), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "report_version_evidence",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_role",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "report_version_id",
        "evidence_id"
      ],
      "foreignKeys": [
        {
          "name": "report_version_evidence_tenant_id_evidence_id_fkey",
          "columns": [
            "tenant_id",
            "evidence_id"
          ],
          "targetSchema": "public",
          "targetTable": "evidence",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "report_version_evidence_tenant_id_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "report_version_source",
      "group": "Incident reporting",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_role",
          "type": "text",
          "nullable": false,
          "default": "'reporting source'::text"
        },
        {
          "name": "source_citation_snapshot",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_received_at_snapshot",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "source_notes",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "report_version_source_tenant_id_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "report_version_source_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "report_version_id",
          "source_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "role_assignment",
      "group": "Accounts and jurisdiction",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "role",
          "type": "role_code",
          "nullable": false,
          "default": null
        },
        {
          "name": "valid_from",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        },
        {
          "name": "valid_until",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "assigned_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "assignment_reason",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "role_assignment_tenant_id_account_id_fkey",
          "columns": [
            "tenant_id",
            "account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "role_assignment_tenant_id_assigned_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "assigned_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "role_assignment_tenant_id_unit_id_fkey",
          "columns": [
            "tenant_id",
            "unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": [
        "CHECK (valid_until IS NULL OR valid_until > valid_from)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_annex",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "sequence_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "annex_code",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "storage_path",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "integrity_checksum",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_annex_tenant_id_situation_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "situation_report_version_id",
          "sequence_number"
        ]
      ],
      "checks": [
        "CHECK (sequence_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_assistance_provided",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'assistance_provided'::sitrep_content_kind"
        },
        {
          "name": "recipient_group",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "recipient_unit_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "assistance_category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "assistance_item",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "provider",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "quantity",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "quantity_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "measurement_unit",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "unit_cost",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "total_cost",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "funding_or_resource_source",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "distributed_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "families_served",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "families_served_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "persons_served",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "persons_served_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "distribution_status",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_assistance_provided_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_assistance_provided_tenant_id_recipient_unit_id_fkey",
          "columns": [
            "tenant_id",
            "recipient_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (valid_numeric_state(quantity, quantity_state))",
        "CHECK (valid_count_state(families_served, families_served_state))",
        "CHECK (valid_count_state(persons_served, persons_served_state))",
        "CHECK (total_cost >= 0::numeric)",
        "CHECK (unit_cost >= 0::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_calamity_declaration",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'calamity_declaration'::sitrep_content_kind"
        },
        {
          "name": "geographic_coverage",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "declaration_level",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "declaring_body",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "resolution_or_ordinance_number",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "resolution_date",
          "type": "date",
          "nullable": true,
          "default": null
        },
        {
          "name": "effective_date",
          "type": "date",
          "nullable": true,
          "default": null
        },
        {
          "name": "declaration_reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "executive_order_number",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_calamity_declaration_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_chronology",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'chronology'::sitrep_content_kind"
        },
        {
          "name": "event_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "event_type",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "reported_by",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_chronology_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_class_work_suspension",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'class_work_suspension'::sitrep_content_kind"
        },
        {
          "name": "suspension_category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "sector",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "education_level",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "geographic_coverage",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "suspension_start_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "resumption_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "issuing_authority",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "order_or_advisory_number",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_class_work_suspension_tenant_id_content_item_id_kin_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (resumption_at IS NULL OR resumption_at >= suspension_start_at)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_content_evidence",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "sitrep_content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evidence_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "sitrep_content_item_id",
        "evidence_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_content_evidence_tenant_id_evidence_id_fkey",
          "columns": [
            "tenant_id",
            "evidence_id"
          ],
          "targetSchema": "public",
          "targetTable": "evidence",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_content_evidence_tenant_id_sitrep_content_item_id_fkey",
          "columns": [
            "tenant_id",
            "sitrep_content_item_id"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_content_item",
      "group": "Situation reports",
      "comment": "DRRM-owned formal Situation Report content. Population, casualty, and damage remain derived data points with source lineage.",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": false,
          "default": null
        },
        {
          "name": "sequence_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "information_as_of_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "value_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "recorded_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "remarks",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_content_item_tenant_id_recorded_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "recorded_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_content_item_tenant_id_situation_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_content_item_tenant_id_source_id_fkey",
          "columns": [
            "tenant_id",
            "source_id"
          ],
          "targetSchema": "public",
          "targetTable": "information_source",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "id",
          "kind"
        ],
        [
          "tenant_id",
          "situation_report_version_id",
          "kind",
          "sequence_number"
        ]
      ],
      "checks": [
        "CHECK (sequence_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_data_point",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "section_code",
          "type": "text",
          "nullable": false,
          "default": "'consolidated_effects'::text"
        },
        {
          "name": "field_code",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "label",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "numeric_value",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "text_value",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "measurement_unit",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "value_state",
          "type": "value_state",
          "nullable": false,
          "default": null
        },
        {
          "name": "aggregation_method",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_coverage_complete",
          "type": "boolean",
          "nullable": false,
          "default": null
        },
        {
          "name": "source_coverage_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "derivation_hash",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "remarks",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_data_point_tenant_id_situation_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "situation_report_version_id",
          "field_code"
        ]
      ],
      "checks": [
        "CHECK (source_coverage_complete OR (value_state <> ALL (ARRAY['verified'::value_state, 'reported_zero'::value_state])))",
        "CHECK ((value_state = ANY (ARRAY['unknown'::value_state, 'not_applicable'::value_state])) AND num_nonnulls(numeric_value, text_value) = 0 OR value_state = 'reported_zero'::value_state AND numeric_value IS NOT NULL AND numeric_value = 0::numeric AND text_value IS NULL OR (value_state = ANY (ARRAY['provisional'::value_state, 'for_validation'::value_state, 'verified'::value_state, 'disputed'::value_state])) AND num_nonnulls(numeric_value, text_value) = 1)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_data_point_source",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "sitrep_data_point_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_effect_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "contribution_description",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "sitrep_data_point_id",
        "report_effect_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_data_point_source_tenant_id_report_effect_item_id_fkey",
          "columns": [
            "tenant_id",
            "report_effect_item_id"
          ],
          "targetSchema": "public",
          "targetTable": "report_effect_item",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_data_point_source_tenant_id_sitrep_data_point_id_fkey",
          "columns": [
            "tenant_id",
            "sitrep_data_point_id"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_data_point",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_decision",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "stage",
          "type": "sitrep_decision_stage",
          "nullable": false,
          "default": null
        },
        {
          "name": "decision",
          "type": "sitrep_decision_value",
          "nullable": false,
          "default": null
        },
        {
          "name": "comments",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "decided_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "decided_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_decision_tenant_id_decided_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "decided_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_decision_tenant_id_situation_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "situation_report_version_id",
          "stage"
        ]
      ],
      "checks": [
        "CHECK (decision = 'accepted'::sitrep_decision_value OR NULLIF(btrim(comments), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_displaced_population",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'displaced_population'::sitrep_content_kind"
        },
        {
          "name": "unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "evacuation_center_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "accommodation",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "family_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "family_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "person_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "person_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "count_basis",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "center_opened_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "center_closed_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "managing_organization",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_displaced_population_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_displaced_population_tenant_id_evacuation_center_id_fkey",
          "columns": [
            "tenant_id",
            "evacuation_center_id"
          ],
          "targetSchema": "public",
          "targetTable": "evacuation_center",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_displaced_population_tenant_id_unit_id_fkey",
          "columns": [
            "tenant_id",
            "unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (accommodation = ANY (ARRAY['inside_center'::text, 'outside_center'::text]))",
        "CHECK (valid_count_state(family_count, family_count_state))",
        "CHECK (valid_count_state(person_count, person_count_state))",
        "CHECK (accommodation <> 'inside_center'::text OR evacuation_center_id IS NOT NULL)",
        "CHECK (center_closed_at IS NULL OR center_opened_at IS NULL OR center_closed_at >= center_opened_at)",
        "CHECK (count_basis = ANY (ARRAY['current'::text, 'cumulative'::text]))"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_export",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "format",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "filename",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "storage_path",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "watermarked",
          "type": "boolean",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_hash",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "generated_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "generated_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_export_tenant_id_generated_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "generated_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_export_tenant_id_situation_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ]
      ],
      "checks": [
        "CHECK (format = ANY (ARRAY['pdf'::text, 'docx'::text]))"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_exposure_summary",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'exposure_summary'::sitrep_content_kind"
        },
        {
          "name": "unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_type_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "exposure_category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "baseline_profile_version_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "baseline_quantity",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "baseline_quantity_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "affected_quantity",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "affected_quantity_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "damaged_quantity",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "damaged_quantity_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "measurement_unit",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "impact_severity",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_exposure_summary_tenant_id_baseline_profile_version_fkey",
          "columns": [
            "tenant_id",
            "baseline_profile_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "profile_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_exposure_summary_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_exposure_summary_tenant_id_hazard_type_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_type_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_type",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_exposure_summary_tenant_id_unit_id_fkey",
          "columns": [
            "tenant_id",
            "unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (valid_numeric_state(baseline_quantity, baseline_quantity_state))",
        "CHECK (valid_numeric_state(affected_quantity, affected_quantity_state))",
        "CHECK (valid_numeric_state(damaged_quantity, damaged_quantity_state))"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_geographic_coverage",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'geographic_coverage'::sitrep_content_kind"
        },
        {
          "name": "unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "landmark",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "affected_area",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "area_unit",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "accessibility",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_geographic_coverage_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_geographic_coverage_tenant_id_unit_id_fkey",
          "columns": [
            "tenant_id",
            "unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (affected_area >= 0::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_hazard_condition",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'hazard_condition'::sitrep_content_kind"
        },
        {
          "name": "hazard_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "severity",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "intensity",
          "type": "numeric",
          "nullable": true,
          "default": null
        },
        {
          "name": "intensity_unit",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "alert_level",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "advisory_agency",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "advisory_number",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "advisory_issued_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "expected_development",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_hazard_condition_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_hazard_condition_tenant_id_hazard_version_id_fkey",
          "columns": [
            "tenant_id",
            "hazard_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_incident_overview",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'incident_overview'::sitrep_content_kind"
        },
        {
          "name": "incident_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "incident_name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "primary_hazard",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "onset_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "discovered_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "current_status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "incident_scale",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_incident_overview_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_incident_overview_tenant_id_incident_id_fkey",
          "columns": [
            "tenant_id",
            "incident_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_issue_concern",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'issue_concern'::sitrep_content_kind"
        },
        {
          "name": "reference_number",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "affected_location",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "identified_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "cause",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "severity",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "urgency",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "assistance_required",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "responsible_organization",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_issue_concern_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_lifeline_status",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'lifeline_status'::sitrep_content_kind"
        },
        {
          "name": "category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "service_provider",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "affected_unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "service_status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "interrupted_service_percent",
          "type": "numeric(5,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "interrupted_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "restored_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "expected_restoration_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "cause",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "advisory_number",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_lifeline_status_tenant_id_affected_unit_id_fkey",
          "columns": [
            "tenant_id",
            "affected_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_lifeline_status_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (restored_at IS NULL OR interrupted_at IS NULL OR restored_at >= interrupted_at)",
        "CHECK (interrupted_service_percent >= 0::numeric AND interrupted_service_percent <= 100::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_preemptive_evacuation",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'preemptive_evacuation'::sitrep_content_kind"
        },
        {
          "name": "hazard_basis",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "evacuation_order",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "evacuation_center_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "family_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "family_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "person_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "person_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "animal_count",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "animal_count_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "started_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "ended_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_preemptive_evacuation_tenant_id_content_item_id_kin_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_preemptive_evacuation_tenant_id_evacuation_center_i_fkey",
          "columns": [
            "tenant_id",
            "evacuation_center_id"
          ],
          "targetSchema": "public",
          "targetTable": "evacuation_center",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (valid_count_state(family_count, family_count_state))",
        "CHECK (valid_count_state(person_count, person_count_state))",
        "CHECK (valid_count_state(animal_count, animal_count_state))",
        "CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_preparedness_measure",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'preparedness_measure'::sitrep_content_kind"
        },
        {
          "name": "category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "responsible_agency",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "measure_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "location_covered",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "initiated_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "response_units_on_standby",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "evacuation_center_status",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "dissemination_method",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "dissemination_reach",
          "type": "bigint",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_preparedness_measure_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (dissemination_reach >= 0)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_recommendation",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'recommendation'::sitrep_content_kind"
        },
        {
          "name": "reference_number",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "related_issue_content_item_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "recommended_action",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "basis",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "target_organization",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "priority",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "required_resources",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "estimated_budget",
          "type": "numeric(18,2)",
          "nullable": true,
          "default": null
        },
        {
          "name": "target_date",
          "type": "date",
          "nullable": true,
          "default": null
        },
        {
          "name": "expected_outcome",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "decision_authority",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "approval_status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "implementation_status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "result",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_recommendation_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_recommendation_tenant_id_related_issue_content_item_fkey",
          "columns": [
            "tenant_id",
            "related_issue_content_item_id"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_issue_concern",
          "targetColumns": [
            "tenant_id",
            "content_item_id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (estimated_budget >= 0::numeric)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_related_incident",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'related_incident'::sitrep_content_kind"
        },
        {
          "name": "incident_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "relationship_to_primary",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "location_description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "landmark",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "occurred_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "effects",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "actions_taken",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "current_status",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_related_incident_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_related_incident_tenant_id_incident_id_fkey",
          "columns": [
            "tenant_id",
            "incident_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "sitrep_response_action",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "content_item_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "sitrep_content_kind",
          "nullable": true,
          "default": "'response_action'::sitrep_content_kind"
        },
        {
          "name": "response_phase",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "response_cluster",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "action_category",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "responsible_organization",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "involved_agencies",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "responsible_team",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "affected_unit_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "started_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "completed_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "persons_served",
          "type": "bigint",
          "nullable": true,
          "default": null
        },
        {
          "name": "persons_served_state",
          "type": "value_state",
          "nullable": false,
          "default": "'unknown'::value_state"
        },
        {
          "name": "coverage_description",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "resources_used",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "operation_result",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "remaining_gap",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "next_planned_action",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "content_item_id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_response_action_tenant_id_affected_unit_id_fkey",
          "columns": [
            "tenant_id",
            "affected_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_response_action_tenant_id_content_item_id_kind_fkey",
          "columns": [
            "tenant_id",
            "content_item_id",
            "kind"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_content_item",
          "targetColumns": [
            "tenant_id",
            "id",
            "kind"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "content_item_id"
        ]
      ],
      "checks": [
        "CHECK (valid_count_state(persons_served, persons_served_state))",
        "CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_signatory",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "sequence_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "signatory_role",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "display_name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "designation",
          "type": "text",
          "nullable": false,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_signatory_tenant_id_situation_report_version_id_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "situation_report_version_id",
          "sequence_number"
        ]
      ],
      "checks": [
        "CHECK (sequence_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_source_snapshot",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "cutoff_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "coverage_status",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "limitations",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "frozen_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "frozen_by_account_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "snapshot_hash",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_source_snapshot_tenant_id_frozen_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "frozen_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_source_snapshot_tenant_id_situation_report_version__fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "situation_report_version_id"
        ]
      ],
      "checks": [
        "CHECK (frozen_at IS NULL AND frozen_by_account_id IS NULL AND snapshot_hash IS NULL OR frozen_at IS NOT NULL AND frozen_by_account_id IS NOT NULL AND snapshot_hash IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "sitrep_value_override",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "sitrep_data_point_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "original_value",
          "type": "jsonb",
          "nullable": false,
          "default": null
        },
        {
          "name": "original_derivation_hash",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "replacement_value",
          "type": "jsonb",
          "nullable": false,
          "default": null
        },
        {
          "name": "justification",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "requested_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "requested_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        },
        {
          "name": "approved_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "approved_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "sitrep_value_override_tenant_id_approved_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "approved_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_value_override_tenant_id_requested_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "requested_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "sitrep_value_override_tenant_id_sitrep_data_point_id_fkey",
          "columns": [
            "tenant_id",
            "sitrep_data_point_id"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_data_point",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "sitrep_data_point_id"
        ]
      ],
      "checks": [
        "CHECK (approved_by_account_id <> requested_by_account_id)",
        "CHECK (btrim(justification) <> ''::text)"
      ]
    },
    {
      "schema": "public",
      "name": "situation_report",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "city_unit_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_number",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "document_type",
          "type": "text",
          "nullable": false,
          "default": "'Situation Report'::text"
        },
        {
          "name": "title",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        },
        {
          "name": "archived_at",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "situation_report_tenant_id_city_unit_id_fkey",
          "columns": [
            "tenant_id",
            "city_unit_id"
          ],
          "targetSchema": "public",
          "targetTable": "organization_unit",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "situation_report_tenant_id_created_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "created_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "report_number"
        ]
      ],
      "checks": []
    },
    {
      "schema": "public",
      "name": "situation_report_incident",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "incident_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "inclusion_role",
          "type": "text",
          "nullable": false,
          "default": "'covered incident'::text"
        },
        {
          "name": "incident_reference_snapshot",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "incident_title_snapshot",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "inclusion_notes",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "situation_report_version_id",
        "incident_id"
      ],
      "foreignKeys": [
        {
          "name": "situation_report_incident_tenant_id_incident_id_fkey",
          "columns": [
            "tenant_id",
            "incident_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "situation_report_incident_tenant_id_situation_report_versi_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": []
    },
    {
      "schema": "public",
      "name": "situation_report_section",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "section_code",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "heading",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "section_status",
          "type": "text",
          "nullable": false,
          "default": "'pending'::text"
        },
        {
          "name": "status_reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "sequence_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "content",
          "type": "text",
          "nullable": false,
          "default": "''::text"
        },
        {
          "name": "last_edited_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "last_edited_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "situation_report_section_tenant_id_last_edited_by_account__fkey",
          "columns": [
            "tenant_id",
            "last_edited_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "situation_report_section_tenant_id_situation_report_versio_fkey",
          "columns": [
            "tenant_id",
            "situation_report_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "situation_report_version_id",
          "sequence_number"
        ],
        [
          "tenant_id",
          "situation_report_version_id",
          "section_code"
        ]
      ],
      "checks": [
        "CHECK ((section_status = ANY (ARRAY['pending'::text, 'provided'::text])) OR NULLIF(btrim(status_reason), ''::text) IS NOT NULL)",
        "CHECK (section_code = ANY (ARRAY['situation_overview'::text, 'preparedness_measures'::text, 'consolidated_effects'::text, 'response_actions'::text, 'issues_and_concerns'::text, 'recommendations'::text]))",
        "CHECK (section_status = ANY (ARRAY['pending'::text, 'provided'::text, 'none_reported'::text, 'unknown'::text, 'not_applicable'::text]))",
        "CHECK (sequence_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "situation_report_version",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "situation_report_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "parent_version_id",
          "type": "uuid",
          "nullable": true,
          "default": null
        },
        {
          "name": "version_number",
          "type": "integer",
          "nullable": false,
          "default": null
        },
        {
          "name": "operational_period_start",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "operational_period_end",
          "type": "timestamp with time zone",
          "nullable": true,
          "default": null
        },
        {
          "name": "as_of_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "data_cutoff_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": null
        },
        {
          "name": "change_summary",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "state",
          "type": "sitrep_state",
          "nullable": false,
          "default": "'draft'::sitrep_state"
        },
        {
          "name": "prepared_by_account_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "prepared_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        },
        {
          "name": "content_hash",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [
        {
          "name": "situation_report_version_tenant_id_parent_version_id_fkey",
          "columns": [
            "tenant_id",
            "parent_version_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report_version",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "situation_report_version_tenant_id_prepared_by_account_id_fkey",
          "columns": [
            "tenant_id",
            "prepared_by_account_id"
          ],
          "targetSchema": "public",
          "targetTable": "account",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "situation_report_version_tenant_id_situation_report_id_fkey",
          "columns": [
            "tenant_id",
            "situation_report_id"
          ],
          "targetSchema": "public",
          "targetTable": "situation_report",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [
        [
          "tenant_id",
          "id"
        ],
        [
          "tenant_id",
          "situation_report_id",
          "version_number"
        ]
      ],
      "checks": [
        "CHECK (operational_period_end IS NULL OR operational_period_start IS NULL OR operational_period_end >= operational_period_start)",
        "CHECK (state = 'draft'::sitrep_state OR content_hash IS NOT NULL)",
        "CHECK (version_number > 0)"
      ]
    },
    {
      "schema": "public",
      "name": "snapshot_barangay_report",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "snapshot_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "report_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "disposition",
          "type": "source_disposition",
          "nullable": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        },
        {
          "name": "reconciliation_notes",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "snapshot_id",
        "report_version_id"
      ],
      "foreignKeys": [
        {
          "name": "snapshot_barangay_report_tenant_id_report_version_id_repor_fkey",
          "columns": [
            "tenant_id",
            "report_version_id",
            "report_id"
          ],
          "targetSchema": "public",
          "targetTable": "incident_report_version",
          "targetColumns": [
            "tenant_id",
            "id",
            "report_id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "snapshot_barangay_report_tenant_id_snapshot_id_fkey",
          "columns": [
            "tenant_id",
            "snapshot_id"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_source_snapshot",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": [
        "CHECK (disposition = 'included'::source_disposition OR NULLIF(btrim(reason), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "snapshot_hazard_version",
      "group": "Situation reports",
      "comment": "",
      "columns": [
        {
          "name": "tenant_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "snapshot_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_version_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "hazard_record_id",
          "type": "uuid",
          "nullable": false,
          "default": null
        },
        {
          "name": "disposition",
          "type": "source_disposition",
          "nullable": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "nullable": true,
          "default": null
        }
      ],
      "primaryKey": [
        "tenant_id",
        "snapshot_id",
        "hazard_version_id"
      ],
      "foreignKeys": [
        {
          "name": "snapshot_hazard_version_tenant_id_hazard_version_id_hazard_fkey",
          "columns": [
            "tenant_id",
            "hazard_version_id",
            "hazard_record_id"
          ],
          "targetSchema": "public",
          "targetTable": "hazard_version",
          "targetColumns": [
            "tenant_id",
            "id",
            "hazard_record_id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        },
        {
          "name": "snapshot_hazard_version_tenant_id_snapshot_id_fkey",
          "columns": [
            "tenant_id",
            "snapshot_id"
          ],
          "targetSchema": "public",
          "targetTable": "sitrep_source_snapshot",
          "targetColumns": [
            "tenant_id",
            "id"
          ],
          "onDelete": "NO ACTION",
          "onUpdate": "NO ACTION"
        }
      ],
      "uniqueKeys": [],
      "checks": [
        "CHECK (disposition = 'included'::source_disposition OR NULLIF(btrim(reason), ''::text) IS NOT NULL)"
      ]
    },
    {
      "schema": "public",
      "name": "tenant",
      "group": "Reference and administration",
      "comment": "",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "nullable": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "name",
          "type": "text",
          "nullable": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamp with time zone",
          "nullable": false,
          "default": "now()"
        }
      ],
      "primaryKey": [
        "id"
      ],
      "foreignKeys": [],
      "uniqueKeys": [],
      "checks": [
        "CHECK (btrim(name) <> ''::text)"
      ]
    }
  ],
  "enums": [
    {
      "name": "public.account_level",
      "values": [
        "purok",
        "barangay",
        "drrm"
      ]
    },
    {
      "name": "public.account_status",
      "values": [
        "active",
        "suspended",
        "deactivated"
      ]
    },
    {
      "name": "public.effect_kind",
      "values": [
        "affected_population",
        "casualty_summary",
        "damage_assessment"
      ]
    },
    {
      "name": "public.profile_level",
      "values": [
        "purok",
        "barangay"
      ]
    },
    {
      "name": "public.record_state",
      "values": [
        "draft",
        "submitted"
      ]
    },
    {
      "name": "public.report_level",
      "values": [
        "purok",
        "barangay"
      ]
    },
    {
      "name": "public.report_stage",
      "values": [
        "initial",
        "progress",
        "terminal",
        "final"
      ]
    },
    {
      "name": "public.review_outcome",
      "values": [
        "verified",
        "correction_requested",
        "rejected"
      ]
    },
    {
      "name": "public.role_code",
      "values": [
        "purok_reporter",
        "barangay_reviewer_reporter",
        "drrm_verifier",
        "sitrep_preparer",
        "sitrep_approver",
        "organization_admin",
        "viewer"
      ]
    },
    {
      "name": "public.sitrep_content_kind",
      "values": [
        "chronology",
        "preparedness_measure",
        "lifeline_status",
        "class_work_suspension",
        "calamity_declaration",
        "preemptive_evacuation",
        "response_action",
        "assistance_provided",
        "issue_concern",
        "recommendation",
        "incident_overview",
        "geographic_coverage",
        "hazard_condition",
        "exposure_summary",
        "related_incident",
        "displaced_population"
      ]
    },
    {
      "name": "public.sitrep_decision_stage",
      "values": [
        "review",
        "approval"
      ]
    },
    {
      "name": "public.sitrep_decision_value",
      "values": [
        "accepted",
        "correction_requested",
        "rejected"
      ]
    },
    {
      "name": "public.sitrep_state",
      "values": [
        "draft",
        "under_review",
        "approved",
        "released",
        "superseded"
      ]
    },
    {
      "name": "public.source_disposition",
      "values": [
        "included",
        "pending",
        "excluded",
        "superseded"
      ]
    },
    {
      "name": "public.unit_kind",
      "values": [
        "city",
        "barangay",
        "purok"
      ]
    },
    {
      "name": "public.value_state",
      "values": [
        "unknown",
        "reported_zero",
        "not_applicable",
        "provisional",
        "for_validation",
        "verified",
        "disputed"
      ]
    }
  ],
  "views": [
    {
      "name": "public.barangay_incident_report",
      "definition": "SELECT id,\n    tenant_id,\n    incident_id,\n    reporting_unit_id,\n    level,\n    created_by_account_id,\n    created_at\n   FROM incident_report\n  WHERE (level = 'barangay'::report_level);"
    },
    {
      "name": "public.barangay_profile",
      "definition": "SELECT id,\n    tenant_id,\n    unit_id,\n    level,\n    reporting_month,\n    created_at\n   FROM profile\n  WHERE (level = 'barangay'::profile_level);"
    },
    {
      "name": "public.barangay_profile_verification",
      "definition": "SELECT d.id,\n    d.tenant_id,\n    d.profile_version_id,\n    d.reviewer_account_id,\n    d.outcome,\n    d.reason,\n    d.correction_request,\n    d.accepted_limitations,\n    d.decided_at\n   FROM ((profile_review_decision d\n     JOIN profile_version v ON (((v.tenant_id = d.tenant_id) AND (v.id = d.profile_version_id))))\n     JOIN profile p ON (((p.tenant_id = v.tenant_id) AND (p.id = v.profile_id))))\n  WHERE (p.level = 'barangay'::profile_level);"
    },
    {
      "name": "public.barangay_report_verification",
      "definition": "SELECT d.id,\n    d.tenant_id,\n    d.report_version_id,\n    d.reviewer_account_id,\n    d.outcome,\n    d.reason,\n    d.correction_request,\n    d.accepted_limitations,\n    d.decided_at\n   FROM ((report_review_decision d\n     JOIN incident_report_version v ON (((v.tenant_id = d.tenant_id) AND (v.id = d.report_version_id))))\n     JOIN incident_report r ON (((r.tenant_id = v.tenant_id) AND (r.id = v.report_id))))\n  WHERE (r.level = 'barangay'::report_level);"
    },
    {
      "name": "public.purok_incident_report",
      "definition": "SELECT id,\n    tenant_id,\n    incident_id,\n    reporting_unit_id,\n    level,\n    created_by_account_id,\n    created_at\n   FROM incident_report\n  WHERE (level = 'purok'::report_level);"
    },
    {
      "name": "public.purok_profile",
      "definition": "SELECT id,\n    tenant_id,\n    unit_id,\n    level,\n    reporting_month,\n    created_at\n   FROM profile\n  WHERE (level = 'purok'::profile_level);"
    },
    {
      "name": "public.purok_profile_verification",
      "definition": "SELECT d.id,\n    d.tenant_id,\n    d.profile_version_id,\n    d.reviewer_account_id,\n    d.outcome,\n    d.reason,\n    d.correction_request,\n    d.accepted_limitations,\n    d.decided_at\n   FROM ((profile_review_decision d\n     JOIN profile_version v ON (((v.tenant_id = d.tenant_id) AND (v.id = d.profile_version_id))))\n     JOIN profile p ON (((p.tenant_id = v.tenant_id) AND (p.id = v.profile_id))))\n  WHERE (p.level = 'purok'::profile_level);"
    },
    {
      "name": "public.purok_report_verification",
      "definition": "SELECT d.id,\n    d.tenant_id,\n    d.report_version_id,\n    d.reviewer_account_id,\n    d.outcome,\n    d.reason,\n    d.correction_request,\n    d.accepted_limitations,\n    d.decided_at\n   FROM ((report_review_decision d\n     JOIN incident_report_version v ON (((v.tenant_id = d.tenant_id) AND (v.id = d.report_version_id))))\n     JOIN incident_report r ON (((r.tenant_id = v.tenant_id) AND (r.id = v.report_id))))\n  WHERE (r.level = 'purok'::report_level);"
    }
  ]
};
