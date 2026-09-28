// Transcribed from diagrams_final/final/ERD.png. Names and source rows are
// retained as drawn; relationship lines do not add FK fields or type claims.
(() => {
  const entity = (id, label, fields, x, y, group) => ({
    id, label, group, x, y,
    fields: fields.split('|').map((name, index) => ({ name, primaryKey: index === 0 }))
  });

  window.erdSourceData = {
    entities: [
      entity('hazard_characteristic', 'Hazard_characteristic', 'Hazard_characteristic_id|Hazard_characteristic_name|Hazard_title|Hazard_description|Hazard_location_description|Hazard_landmark|Hazard_assessment_date_time|Hazard_intensity_or_magnitude|Hazard_intensity_unit|Hazard_severity|Hazard_duration|Hazard_current_status|Hazard_record_status|Hazard_prepared-by|Hazard_submitted_at', 80, 80, 'Accounts and hazards'),
      entity('hazard', 'Hazard', 'Hazard_id|Hazard_name|Hazard_type|Hazard_date|Hazard_type|Hazard_location|Hazard_severity', 520, 80, 'Accounts and hazards'),
      entity('account', 'Account', 'Account_id|Accout_username|Account_password-hashed|Account_name|Account_first_name|Account_middle_name|Account_last_name|Account_email|Account_phone|Account_address|Account_location|Account_status|Account_created-at|Account_created-by', 1010, 80, 'Accounts and hazards'),
      entity('drrm_account', 'Drrm_account', 'Drrm_account_id|Drrm_unit_id', 220, 650, 'Accounts and hazards'),
      entity('barangay_account', 'Barangay_account', 'Barangay_account_id|Barangay_name|Barangay_supervising-drrm', 700, 650, 'Accounts and hazards'),
      entity('purok_account', 'Purok_account', 'Purok_account_id|Purok_barangay|Purok_supervising-barangay|Purok_name', 1200, 650, 'Accounts and hazards'),

      entity('barangay_profile', 'Barangay_profile', 'Barangay_profile_id|Barangay_name|Barangay_city|Barangay_province|Barangay_population|Barangay_male-num|Barangay_female-num|Barangay_infants-num|Barangay_children-num|Barangay_adult-num|Barangay_senior-num|Barangay_pwd-num|Barangay_pregnant-num|Barangay_lactating-num', 1960, 80, 'Profiles and verification'),
      entity('barangay_profile_verification', 'Barangay_profile_verification', 'Barangay_profile_verification_id|Barangay_profile_verification_reviewer|Barangay_profile_verification_decision|Barangay_profile_verification_reason|Barangay_profile_verification_status|Barangay_profile_verification_reviewedat', 1510, 570, 'Profiles and verification'),
      entity('barangay_profile_hazard_exposure', 'Barangay_profile_hazard_exposure', 'Barangay_profile_hazard_exposure_id|Barangay_hazard_type|Barangay_hazard_exposed-families|Barangay_hazard_exposed-household|Barangay_hazard_exposed-population|Barangay_hazard_vulnerable-group', 1950, 570, 'Profiles and verification'),
      entity('barangay_profile_housing', 'Barangay_profile_housing', 'Barangay_profile_housing_id|Barangay_total_housing|Barangay_light_housing|Barangay_bodies_of_water_housing|Barangay_near_fault_housing', 2390, 570, 'Profiles and verification'),
      entity('purok_profile', 'Purok_profile', 'Purok_profile_id|Purok_name|Purok_location|Purok_barangay|Purok_population|Purok_household_num|Purok_families_num|Purok_male_num|Purok_female_num|Purok_infants-num|Purok_children_num|Purok_adults_num|Purok_senior_num|Purok_pwd_num|Purok_pregnant_num|Purok_lactating_num', 2920, 80, 'Profiles and verification'),
      entity('purok_profile_verification', 'Purok_profile_verification', 'Purok_profile_verification_id|Purok_profile_verification_reviewer|Purok_profile_verification_decision|Purok_profile_verification_reason|Purok_profile_verification_status|Purok_profile_verification_date-time|Purok_profile_verification_reviewedat', 2900, 570, 'Profiles and verification'),
      entity('purok_profile_housing', 'Purok_profile_housing', 'Purok_profile_housing_id|Purok_total_housing|Purok_light_housing|Purok_bodies_of_water_housing|Purok_near_fault_housing', 3390, 570, 'Profiles and verification'),
      entity('purok_profile_hazard_exposure', 'Purok_profile_hazard_exposure', 'Purok_profile_hazard_exposure_id|Purok_hazard_type|Purok_hazard_exposed-families|Purok_hazard_exposed-household|Purok_hazard_exposed-population|Purok_hazard_vulnerable-group', 3850, 570, 'Profiles and verification'),
      entity('purok_report_verification', 'Purok_report_verification', 'Purok_report_verification_id|Purok_report_verification_reviewer|Purok_report_verification_reviewing_org|Purok_report_verification_decision|Purok_report_verification_decision-reason|Purok_report_verification_correction-req|Purok_report_verification_consolidation|Purok_report_verification_at', 3360, 1160, 'Profiles and verification'),

      entity('situation_report', 'Situation_report', 'Situation_report_id|Situation_report_type|Situation_report_title|Situation_report_created-at|Situation_report_version', 760, 1760, 'Situation reports'),
      entity('situation_report_assistance', 'Situation_report_assistance-provided', 'Situation_report_assistance-provided_id|Situation_report_assistance-provided_type|Situation_report_assistance-provided_group|Situation_report_assistance-provided_cluster|Situation_report_assistance-provided_item|Situation_report_assistance-provided_provider|Situation_report_assistance-provided_quantity|Situation_report_assistance-provided_measurement-unit|Situation_report_assistance-provided_cost-per-unit|Situation_report_assistance-provided_total-value|Situation_report_response-action-resource|Situation_report_assistance-provided_date-time', 80, 2220, 'Situation reports'),
      entity('situation_report_recommendation', 'Situation_report_recommendation', 'Situation_report_recommendation_id|Situation_report_recommendation_action|Situation_report_recommendation_target_organization|Situation_report_recommendation_priority|Situation_report_recommendation_resource|Situation_report_recommendation_target-date|Situation_report_recommendation_status|Situation_report_recommendation_result', 540, 2220, 'Situation reports'),
      entity('situation_report_issue', 'Situation_report_issue', 'Situation_report_issue_id|Situation_report_issue_category|Situation_report_issue_description|Situation_report_issue_identified-at|Situation_report_issue_severity|Situation_report_issue_priority|Situation_report_issue_responsible-organization|Situation_report_issue_status', 1000, 2220, 'Situation reports'),
      entity('situation_report_calamity', 'Situation_report_calamity-declaration', 'Situation_report_calamity-declaration_id|Situation_report_calamity-declaration_declaring-body|Situation_report_calamity-declaration_resolution|Situation_report_calamity-declaration_declaration-date|Situation_report_calamity-declaration_effective-date|Situation_report_calamity-declaration_remarks|Situation_report_calamity-declaration_status', 80, 2850, 'Situation reports'),
      entity('situation_report_classwork', 'Situation_report_classwork-suspension', 'Situation_report_classwork-suspension_id|Situation_report_classwork-suspension_type|Situation_report_classwork-suspension_scope|Situation_report_classwork-suspension_suspension-start|Situation_report_classwork-suspension_suspension-end|Situation_report_classwork-suspension_issuing-authority|Situation_report_classwork-suspension_order|Situation_report_classwork-suspension_status', 540, 2850, 'Situation reports'),
      entity('situation_report_lifeline', 'Situation_report_lifeline-status', 'Situation_report_lifeline-status_id|Situation_report_lifeline-status_type|Situation_report_lifeline-status_operator|Situation_report_lifeline-status_|Situation_report_damage-assessment_classification|Situation_report_damage-assessment_damaged-qty|Situation_report_damage-assessment_affected-area|Situation_report_damage-assessment_estimated-damage|Situation_report_damage-assessment_estimated-loss', 1000, 2850, 'Situation reports'),
      entity('situation_report_signatory', 'Situation_report_signatory', 'Situation_report_signatory_id|Situation_report_signatory_role|Situation_report_signatory_name|Situation_report_signatory_designation|Situation_report_signatory_number', 80, 3500, 'Situation reports'),
      entity('situation_report_response', 'Situation_report_response-action', 'Situation_report_response-action_id|Situation_report_response-action_phase|Situation_report_response-action_response-cluster|Situation_report_response-action_category|Situation_report_response-action_description|Situation_report_response-action_organization|Situation_report_response-action_start|Situation_report_response-action_completed|Situation_report_response-action_status|Situation_report_response-action_coverage|Situation_report_response-action_resource|Situation_report_response-action_result', 540, 3500, 'Situation reports'),
      entity('situation_report_evacuation', 'Situation_report_preemptive-evacuation', 'Situation_report_preemptive-evacuation_id|Situation_report_preemptive-evacuation_subject|Situation_report_preemptive-evacuation_families|Situation_report_preemptive-evacuation_persons|Situation_report_preemptive-evacuation_animals|Situation_report_preemptive-evacuation_center|Situation_report_preemptive-evacuation_start|Situation_report_preemptive-evacuation_end|Situation_report_preemptive-evacuation_status', 1000, 3500, 'Situation reports'),

      entity('incident_report', 'Incident_report', 'Incident_report_id|Incident_report_level|Incident_report_series_createdby|Incident_report_series_createdat', 2670, 1760, 'Incident reports'),
      entity('incident_report_version', 'Incident_report_version', 'Incident_report_version_id|Incident_report_version_stage|Incident_report_version_start|Incident_report_version_end|Incident_report_version_continuing-threat|Incident_report_version_record-status|Incident_report_version_draftedby|Incident_report_version_prepared_by', 3370, 2200, 'Incident reports'),
      entity('incident_report_affected_population', 'Incident_report_affected-population', 'Incident_report_affected-population_id|Incident_report_affected-population_category|Incident_report_affected-population_purok_count|Incident_report_affected-population_family|Incident_report_affected-population_person|Incident_report_affected-population_evacuation-center|Incident_report_affected-population_current|Incident_report_affected-population_cumulative', 2180, 2200, 'Incident reports'),
      entity('incident_report_casualty', 'Incident_report__casualty-summary', 'Incident_report__affected-casualty_id|Incident_report__affected-casualty_count|Incident_report__affected-casualty_injured|Incident_report__affected-casualty_ill|Incident_report__affected-casualty_missing', 3370, 2770, 'Incident reports'),
      entity('incident_report_damage', 'Incident_report__damage-assessment', 'Incident_report_damage-assessment_id|Incident_report_damage-assessment_category|Incident_report_damage-assessment_name|Incident_report_damage-assessment_owner|Incident_report_damage-assessment_classification|Incident_report_damage-assessment_damaged-qty|Incident_report_damage-assessment_affected-area|Incident_report_damage-assessment_estimated-damage|Incident_report_damage-assessment_estimated-loss', 2670, 3370, 'Incident reports'),
      entity('barangay_incident_report', 'Barangay_Incident_report', 'Barangay_Incident_report_id|Barangay_report_status', 2180, 3000, 'Incident reports'),
      entity('purok_incident_report', 'Purok_Incident_report', 'Purok_Incident_report_id|Purok_report_status|Purok_report_notes', 2180, 3370, 'Incident reports')
    ],
    relationships: [
      { from: 'hazard_characteristic', to: 'hazard', label: 'includes', cardinality: { from: 'fork', to: 'bar' } },
      { from: 'barangay_profile', to: 'barangay_profile_hazard_exposure', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'barangay_profile', to: 'barangay_profile_housing', label: 'includes', cardinality: { from: 'doubleBar', to: 'bar' } },
      { from: 'purok_profile', to: 'purok_profile_hazard_exposure', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'purok_profile', to: 'purok_profile_housing', label: 'includes', cardinality: { from: 'bar', to: 'bar' } },
      { from: 'incident_report', to: 'incident_report_version', label: 'includes', cardinality: { from: 'fork', to: 'doubleBar' } },
      { from: 'incident_report', to: 'incident_report_affected_population', label: 'includes', cardinality: { from: 'fork', to: 'doubleBar' } },
      { from: 'incident_report', to: 'incident_report_casualty', label: 'includes', cardinality: { from: 'fork', to: 'doubleBar' } },
      { from: 'incident_report', to: 'incident_report_damage', label: 'includes', cardinality: { from: 'fork', to: 'bar' } },
      { from: 'situation_report', to: 'situation_report_assistance', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_recommendation', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_issue', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_calamity', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_classwork', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_lifeline', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_signatory', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_response', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'situation_report', to: 'situation_report_evacuation', label: 'includes', cardinality: { from: 'doubleBar', to: 'fork' } },
      { from: 'account', to: 'hazard', label: 'creates', cardinality: { from: 'bar', to: 'fork' } },
      { from: 'drrm_account', to: 'barangay_account', label: 'creates', cardinality: { from: 'bar', to: 'fork' } },
      { from: 'drrm_account', to: 'situation_report', label: 'creates' },
      { from: 'barangay_account', to: 'purok_account', label: 'creates', cardinality: { from: 'bar', to: 'fork' } },
      { from: 'barangay_account', to: 'barangay_profile', label: 'creates', cardinality: { from: 'doubleBar', to: 'doubleBar' } },
      { from: 'purok_account', to: 'purok_profile', label: 'creates', cardinality: { from: 'doubleBar', to: 'doubleBar' } },
      { from: 'drrm_account', to: 'barangay_profile_verification', label: 'verifies', cardinality: { from: 'bar', to: 'fork' } },
      { from: 'barangay_account', to: 'purok_profile_verification', label: 'verifies' },
      { from: 'barangay_profile', to: 'barangay_profile_verification', label: 'verifies' },
      { from: 'purok_profile', to: 'purok_profile_verification', label: 'verifies' },
      { from: 'purok_report_verification', to: 'incident_report', label: 'verifies', cardinality: { from: 'doubleBar', to: 'fork' } }
    ],
    specializations: [
      { parent: 'account', discriminator: 'D', children: ['drrm_account', 'barangay_account', 'purok_account'] },
      { parent: 'incident_report', discriminator: 'D', children: ['barangay_incident_report', 'purok_incident_report'] }
    ],
    notes: [
      'Source ERD contains two disjoint subtype groups, shown with D connectors.',
      'The source does not mark individual fields as foreign keys or assign data types.',
      'Relationship labels and clearly legible endpoint marks are retained; cardinalities stay unspecified where marks are unclear or crossed.',
      'Source spellings are retained, including the Account row labelled “Accout_username”.',
      'PK marks the underlined identifier. Crow’s-foot endpoint marks encode multiplicity; they are not directional arrows.',
      'A possible Situation_report–Incident_report connector is unresolved and is not asserted here.'
    ]
  };
})();
