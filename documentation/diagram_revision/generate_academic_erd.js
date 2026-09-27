const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'academic_conceptual_erd.drawio');

const COLORS = {
  ink: '#16324F',
  blue: '#1C557E',
  teal: '#0F766E',
  tealFill: '#F0FDFA',
  gold: '#8A5A00',
  goldFill: '#FFF8E7',
  paper: '#FFFFFF',
  soft: '#F8FAFC',
  line: '#475569',
};

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attrHtml(attributes) {
  return attributes.map((attribute) => {
    const key = attribute.startsWith('_');
    const text = key ? attribute.slice(1) : attribute;
    return key ? `<u>${esc(text)}</u>` : esc(text);
  }).join('<br>');
}

function entityHeight(attributes) {
  return Math.max(220, 105 + attributes.length * 39);
}

function entityStyle(type) {
  const base = 'whiteSpace=wrap;html=1;strokeWidth=5;align=left;verticalAlign=top;spacing=0;fontFamily=Arial;';
  if (type === 'weak') return `${base}shape=rectangle;double=1;fillColor=${COLORS.paper};strokeColor=${COLORS.blue};rounded=0;`;
  if (type === 'associative') return `${base}shape=rectangle;rounded=1;arcSize=12;fillColor=${COLORS.tealFill};strokeColor=${COLORS.teal};`;
  if (type === 'subtype') return `${base}shape=rectangle;rounded=0;fillColor=${COLORS.goldFill};strokeColor=${COLORS.gold};`;
  if (type === 'reference') return `${base}shape=rectangle;rounded=0;dashed=1;dashPattern=12 8;fillColor=${COLORS.soft};strokeColor=${COLORS.line};`;
  return `${base}shape=rectangle;rounded=0;fillColor=${COLORS.paper};strokeColor=${COLORS.blue};`;
}

function headerColor(type) {
  if (type === 'associative') return COLORS.teal;
  if (type === 'subtype') return COLORS.gold;
  if (type === 'reference') return COLORS.line;
  return type === 'supertype' ? COLORS.ink : COLORS.blue;
}

let serial = 2;
let entityCount = 0;
function nextId(prefix) {
  return `${prefix}_${serial++}`;
}

function addEntity(page, spec) {
  entityCount += 1;
  const id = spec.id || nextId('entity');
  const type = spec.type || 'regular';
  const height = spec.height || entityHeight(spec.attributes);
  const value = `<div style="background:${headerColor(type)};color:white;font-family:Arial;font-size:28px;font-weight:700;padding:15px 18px;text-align:center">${esc(spec.name)}</div>`
    + `<div style="font-family:Arial;font-size:24px;line-height:1.45;padding:16px 20px">${attrHtml(spec.attributes)}</div>`;
  page.cells.push(`<mxCell id="${id}" value="${esc(value)}" style="${entityStyle(type)}" vertex="1" parent="1"><mxGeometry x="${spec.x}" y="${spec.y}" width="${spec.width || 720}" height="${height}" as="geometry"/></mxCell>`);
  page.ids[spec.name] = id;
  return id;
}

function addNameOnly(page, spec) {
  return addEntity(page, {
    ...spec,
    type: spec.type || 'reference',
    attributes: spec.attributes || ['See the owning subject-area page'],
    height: spec.height || 220,
  });
}

function addText(page, { text, x, y, width, height, size = 24, bold = false, align = 'left', color = COLORS.ink }) {
  const id = nextId('text');
  const value = `<div style="font-family:Arial;font-size:${size}px;${bold ? 'font-weight:700;' : ''}color:${color};text-align:${align}">${text}</div>`;
  page.cells.push(`<mxCell id="${id}" value="${esc(value)}" style="text;html=1;strokeColor=none;fillColor=none;align=${align};verticalAlign=middle;whiteSpace=wrap;" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`);
  return id;
}

function addTriangle(page, { id = nextId('specialization'), x, y, label = 'd' }) {
  page.cells.push(`<mxCell id="${id}" value="${label}" style="shape=triangle;direction=north;whiteSpace=wrap;html=1;fillColor=${COLORS.soft};strokeColor=${COLORS.ink};strokeWidth=5;fontSize=24;fontStyle=1;align=center;verticalAlign=middle;" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="90" height="80" as="geometry"/></mxCell>`);
  return id;
}

function edgeStyle(kind) {
  const base = `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=${COLORS.line};strokeWidth=5;fontFamily=Arial;fontSize=24;fontColor=${COLORS.ink};labelBackgroundColor=#FFFFFF;`;
  if (kind === 'inheritance') return `${base}endArrow=none;startArrow=none;`;
  if (kind === 'identifying') return `${base}startArrow=ERone;startFill=0;endArrow=ERmany;endFill=0;double=1;`;
  if (kind === 'one') return `${base}startArrow=ERone;startFill=0;endArrow=ERone;endFill=0;`;
  if (kind === 'optionalOne') return `${base}startArrow=ERone;startFill=0;endArrow=ERzeroToOne;endFill=0;`;
  if (kind === 'manyMany') return `${base}startArrow=ERmany;startFill=0;endArrow=ERmany;endFill=0;`;
  return `${base}startArrow=ERone;startFill=0;endArrow=ERmany;endFill=0;`;
}

function addEdge(page, source, target, label, kind = 'many', extra = '') {
  const sourceId = page.ids[source] || source;
  const targetId = page.ids[target] || target;
  const id = nextId('relation');
  page.cells.push(`<mxCell id="${id}" value="${esc(label)}" style="${edgeStyle(kind)}${extra}" edge="1" parent="1" source="${sourceId}" target="${targetId}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  return id;
}

function newPage(name, width, height, subtitle) {
  const page = { name, width, height, cells: [], ids: {} };
  addText(page, { text: esc(name), x: 60, y: 25, width: width - 120, height: 55, size: 36, bold: true, align: 'center' });
  addText(page, { text: esc(subtitle), x: 60, y: 85, width: width - 120, height: 80, size: 24, align: 'center', color: COLORS.line });
  return page;
}

const pages = [];

// Page 0: notation and scope.
{
  const p = newPage(
    '00 — Academic ERD Notation and Scope',
    4200,
    2500,
    'Conceptual EER model · no foreign-key attributes · underlined identifiers · 24-point minimum text · 5-point outlines',
  );
  addEntity(p, { name: 'RegularEntity', x: 150, y: 260, width: 800, type: 'regular', attributes: ['_Entity_identifier', 'Descriptive_attribute', 'Status_attribute'] });
  addEntity(p, { name: 'WeakEntity', x: 1150, y: 260, width: 800, type: 'weak', attributes: ['_Partial_identifier', 'Existence-dependent_attribute'] });
  addEntity(p, { name: 'AssociativeEntity', x: 2150, y: 260, width: 800, type: 'associative', attributes: ['_Association_identifier', 'Relationship_attribute'] });
  addEntity(p, { name: 'SubtypeEntity', x: 3150, y: 260, width: 800, type: 'subtype', attributes: ['_Inherited_identifier', 'Subtype_specific_attribute'] });
  addText(p, { text: '<b>Regular entity</b><br>Exists independently and has its own identifier.', x: 150, y: 800, width: 800, height: 180, size: 24 });
  addText(p, { text: '<b>Weak entity</b><br>Its underlined partial identifier is completed by the owning entity through an identifying relationship.', x: 1150, y: 800, width: 800, height: 220, size: 24 });
  addText(p, { text: '<b>Associative entity</b><br>Resolves a many-to-many relationship and retains relationship-specific facts.', x: 2150, y: 800, width: 800, height: 220, size: 24 });
  addText(p, { text: '<b>Subtype entity</b><br>Inherits the identifier and common attributes of its supertype.', x: 3150, y: 800, width: 800, height: 220, size: 24 });
  addText(p, { text: '<b>Specialization marker:</b> “d” means disjoint. The Account, CDRA Profile, Incident Report, Report Effect Item, and DRRM SitRep Content Item specializations are total and disjoint.', x: 250, y: 1200, width: 1700, height: 260, size: 24 });
  addText(p, { text: '<b>Foreign keys:</b> intentionally absent from the entity compartments. The relationship lines communicate association and cardinality at this academic stage.', x: 2250, y: 1200, width: 1700, height: 220, size: 24 });
  addText(p, { text: '<b>Excluded as non-entities:</b> Login, Registration, Dashboard, verification queues, history catalogs, report previews, form screens, and DFD database labels. These are processes, interfaces, views, or subject-area stores.', x: 250, y: 1600, width: 1700, height: 420, size: 24 });
  addText(p, { text: '<b>Evidence boundary:</b> RA 10121, DHSUD CDRA guidance, NDRRMOC SOPG 2024, and DROMIC determine information categories. Monthly profiling and the Purok → Barangay → DRRM workflow are approved project rules, not literal statutory database prescriptions.<br><br><b>Responsibility boundary:</b> Purok reports affected-population totals; Barangay consolidates population, casualty, and damage effects; DRRM owns the remaining Situation Report content.', x: 2250, y: 1600, width: 1700, height: 560, size: 24 });
  pages.push(p);
}

// Page 1: accounts, jurisdictions, sources, and audit.
{
  const p = newPage('01 — Accounts, Jurisdictions, Sources, and Audit', 5000, 3600, 'Account subtypes express administrative level; role assignments express duties and scope');
  addEntity(p, { name: 'OrganizationUnit', x: 120, y: 240, attributes: ['_Organization_unit_id', 'Organization_unit_code', 'Organization_unit_type', 'Organization_unit_name', 'Geographic_code', 'Location_description', 'Boundary_reference', 'Organization_unit_status'] });
  addEntity(p, { name: 'Account', x: 1120, y: 220, type: 'supertype', attributes: ['_Account_id', 'Authentication_identifier', 'Username', 'First_name', 'Middle_name', 'Last_name', 'Personnel_identifier', 'Designation', 'Official_email', 'Official_mobile', 'Authority_reference', 'Account_status', 'Created_at', 'Deactivated_at', 'Deactivation_reason'] });
  addEntity(p, { name: 'Role', x: 2140, y: 240, attributes: ['_Role_id', 'Role_code', 'Role_name', 'Role_description', 'Role_status'] });
  addEntity(p, { name: 'InformationSource', x: 3160, y: 220, attributes: ['_Information_source_id', 'Source_type', 'Source_quality', 'Source_name', 'Source_organization', 'Reference_number', 'Reference_URL', 'Observed_at', 'Received_at', 'Confidentiality_classification', 'Reliability_notes'] });
  addEntity(p, { name: 'Evidence', x: 4160, y: 240, attributes: ['_Evidence_id', 'Evidence_type', 'Evidence_title', 'File_reference', 'Captured_at', 'Location_description', 'Latitude', 'Longitude', 'Caption', 'Privacy_classification', 'Integrity_checksum', 'Uploaded_at'] });
  const tri = addTriangle(p, { x: 1435, y: 990 });
  addEntity(p, { name: 'PurokAccount', x: 750, y: 1270, type: 'subtype', attributes: ['_Purok_account_id', 'Account_level_status'] });
  addEntity(p, { name: 'BarangayAccount', x: 1510, y: 1270, type: 'subtype', attributes: ['_Barangay_account_id', 'Account_level_status'] });
  addEntity(p, { name: 'DRRMAccount', x: 2270, y: 1270, type: 'subtype', attributes: ['_DRRM_account_id', 'Account_level_status'] });
  addEntity(p, { name: 'AccountRoleAssignment', x: 3140, y: 1260, type: 'associative', attributes: ['_Account_role_assignment_id', 'Assignment_status', 'Valid_from', 'Valid_until', 'Assignment_reason'] });
  addEntity(p, { name: 'AuditEvent', x: 4140, y: 1260, attributes: ['_Audit_event_id', 'Audit_action', 'Affected_entity_type', 'Affected_entity_identifier', 'Previous_state', 'New_state', 'Audit_reason', 'Audit_date_time'] });
  addEdge(p, 'Account', tri, '', 'inheritance');
  addEdge(p, tri, 'PurokAccount', '', 'inheritance');
  addEdge(p, tri, 'BarangayAccount', '', 'inheritance');
  addEdge(p, tri, 'DRRMAccount', '', 'inheritance');
  addText(p, { text: 'Total, disjoint specialization', x: 1150, y: 1080, width: 700, height: 80, size: 24, bold: true, align: 'center' });
  addEdge(p, 'OrganizationUnit', 'PurokAccount', 'assigned Purok scope');
  addEdge(p, 'OrganizationUnit', 'BarangayAccount', 'assigned Barangay scope');
  addEdge(p, 'OrganizationUnit', 'DRRMAccount', 'assigned DRRM scope');
  addEdge(p, 'Account', 'AccountRoleAssignment', 'receives scoped roles');
  addEdge(p, 'Role', 'AccountRoleAssignment', 'is assigned through');
  addEdge(p, 'OrganizationUnit', 'AccountRoleAssignment', 'limits jurisdiction');
  addEdge(p, 'InformationSource', 'Evidence', 'supports');
  addEdge(p, 'Account', 'Evidence', 'uploads');
  addEdge(p, 'Account', 'AuditEvent', 'performs audited action');
  addText(p, { text: '<b>No Registration entity:</b> the next higher administrative level creates and manages the accounts beneath it. Authentication credentials remain in the authentication service, not in the academic business ERD.', x: 250, y: 2650, width: 2000, height: 360, size: 24 });
  addText(p, { text: '<b>Account subtype rule:</b> every Account has one administrative-level subtype. Multiple operational duties remain possible because Role is assigned separately for a jurisdiction and validity period.', x: 2700, y: 2650, width: 2000, height: 360, size: 24 });
  pages.push(p);
}

// Page 2: CDRA structure and verification.
{
  const p = newPage('02 — CDRA Profile Structure and Verification', 4800, 3600, 'Purok and Barangay profiles remain separate modules while sharing one normalized profile structure');
  addEntity(p, { name: 'CDRAProfile', x: 120, y: 220, type: 'supertype', attributes: ['_CDRA_profile_id', 'Profile_level', 'Reporting_period_start', 'Reporting_period_end', 'Profile_created_at'] });
  const tri = addTriangle(p, { x: 430, y: 750 });
  addEntity(p, { name: 'PurokProfile', x: 80, y: 1030, type: 'subtype', attributes: ['_Purok_profile_id', 'Purok_profile_status'] });
  addEntity(p, { name: 'BarangayProfile', x: 850, y: 1030, type: 'subtype', attributes: ['_Barangay_profile_id', 'Barangay_profile_status'] });
  addEntity(p, { name: 'CDRAProfileVersion', x: 1740, y: 220, type: 'weak', attributes: ['_Profile_version_number', 'Profile_as_of_date', 'Profile_status', 'Draft_owner', 'Prepared_by', 'Submitted_at', 'Methodology_notes', 'Data_gap_notes', 'Limitations'] });
  addEntity(p, { name: 'BarangayProfileCoverage', x: 2700, y: 220, type: 'associative', attributes: ['_Coverage_entry_id', 'Coverage_disposition', 'Coverage_as_of_date', 'Exclusion_or_gap_reason', 'Reconciliation_notes'] });
  addEntity(p, { name: 'PurokProfileVerification', x: 1740, y: 1260, attributes: ['_Purok_profile_verification_id', 'Reviewer', 'Reviewing_organization', 'Verification_decision', 'Decision_reason', 'Correction_request', 'Accepted_limitations', 'Reviewed_at'] });
  addEntity(p, { name: 'BarangayProfileVerification', x: 2700, y: 1260, attributes: ['_Barangay_profile_verification_id', 'Reviewer', 'Reviewing_organization', 'Verification_decision', 'Decision_reason', 'Correction_request', 'Accepted_limitations', 'Reviewed_at'] });
  addEntity(p, { name: 'ProfileVerificationFinding', x: 3660, y: 1260, type: 'weak', attributes: ['_Finding_sequence_number', 'Profile_section', 'Profile_field', 'Finding_type', 'Finding_severity', 'Finding_description', 'Correction_required', 'Resolution_status'] });
  addNameOnly(p, { name: 'OrganizationUnit', x: 3660, y: 220, attributes: ['_Organization_unit_id', 'See Page 01'] });
  addNameOnly(p, { name: 'Evidence', x: 3660, y: 650, attributes: ['_Evidence_id', 'See Page 01'] });
  addEdge(p, 'CDRAProfile', tri, '', 'inheritance');
  addEdge(p, tri, 'PurokProfile', '', 'inheritance');
  addEdge(p, tri, 'BarangayProfile', '', 'inheritance');
  addText(p, { text: 'Total, disjoint specialization', x: 220, y: 850, width: 700, height: 80, size: 24, bold: true, align: 'center' });
  addEdge(p, 'OrganizationUnit', 'CDRAProfile', 'owns monthly profile series');
  addEdge(p, 'CDRAProfile', 'CDRAProfileVersion', 'has versions', 'identifying');
  addEdge(p, 'CDRAProfileVersion', 'BarangayProfileCoverage', 'is consolidating Barangay version');
  addEdge(p, 'CDRAProfileVersion', 'BarangayProfileCoverage', 'is exact verified Purok source');
  addEdge(p, 'CDRAProfileVersion', 'PurokProfileVerification', 'reviewed at Barangay level');
  addEdge(p, 'CDRAProfileVersion', 'BarangayProfileVerification', 'reviewed at DRRM level');
  addEdge(p, 'PurokProfileVerification', 'ProfileVerificationFinding', 'records findings', 'identifying');
  addEdge(p, 'BarangayProfileVerification', 'ProfileVerificationFinding', 'records findings', 'identifying');
  addEdge(p, 'Evidence', 'CDRAProfileVersion', 'supports submitted profile');
  addText(p, { text: '<b>Weak-entity rule:</b> Profile_version_number is only unique within its owning CDRAProfile. Submitted data are not overwritten; a correction produces the next version.', x: 300, y: 2700, width: 1900, height: 310, size: 24 });
  addText(p, { text: '<b>Coverage rule:</b> BarangayProfileCoverage is associative because it connects a Barangay profile version with the Purok profile versions considered during consolidation and stores inclusion, exclusion, and reconciliation facts.', x: 2550, y: 2700, width: 1950, height: 360, size: 24 });
  pages.push(p);
}

// Page 3: CDRA content.
{
  const p = newPage('03 — CDRA Profile Information', 5000, 4800, 'Aggregate baseline data only · no named resident or household records · CDRA content remains separate from incident effects');
  addNameOnly(p, { name: 'CDRAProfileVersion', x: 2050, y: 220, type: 'reference', attributes: ['_Profile_version_number', 'Owner shown on Page 02'] });
  addEntity(p, { name: 'ClimateScenario', x: 100, y: 800, attributes: ['_Climate_scenario_id', 'Climate_variable', 'Baseline_period', 'Projection_period', 'Scenario_reference', 'Baseline_value', 'Projected_value', 'Projected_change', 'Measurement_unit', 'Data_as_of_date', 'Data_state', 'Remarks'] });
  addEntity(p, { name: 'HistoricalDisasterLoss', x: 1050, y: 800, attributes: ['_Historical_loss_id', 'Hazard_or_event_name', 'Occurrence_date', 'Affected_location', 'Affected_families', 'Affected_persons', 'Casualty_summary', 'Damaged_houses', 'Damaged_assets', 'Estimated_damage', 'Estimated_loss', 'Data_state', 'Remarks'] });
  addEntity(p, { name: 'ProfilePopulationSummary', x: 2000, y: 800, attributes: ['_Population_summary_id', 'Total_households', 'Total_families', 'Total_population', 'Male_population', 'Female_population', 'Unspecified_sex_count', 'Population_as_of_date', 'Data_state', 'Remarks'] });
  addEntity(p, { name: 'ProfilePopulationGroup', x: 2950, y: 800, attributes: ['_Population_group_id', 'Group_dimension', 'Group_code', 'Group_name', 'Population_count', 'Data_state', 'Remarks'] });
  addEntity(p, { name: 'ProfileHousingSummary', x: 3900, y: 800, attributes: ['_Housing_summary_id', 'Construction_type', 'Tenure_type', 'Housing_condition', 'Location_category', 'Housing_unit_count', 'Data_state', 'Remarks'] });
  addEntity(p, { name: 'ProfileExposureUnit', x: 100, y: 2300, attributes: ['_Exposure_unit_id', 'Exposure_category', 'Exposure_unit_name', 'Exposure_location', 'Exposure_quantity', 'Measurement_unit', 'Exposed_population', 'Exposed_area', 'Estimated_asset_value', 'Sensitivity_rating', 'Adaptive_capacity_rating', 'Vulnerability_rating', 'Data_state', 'Remarks'] });
  addEntity(p, { name: 'CriticalAsset', x: 1050, y: 2300, attributes: ['_Critical_asset_id', 'Critical_asset_type', 'Critical_asset_name', 'Critical_asset_location', 'Owner_or_operator', 'Design_capacity', 'Capacity_unit', 'Facility_contact', 'Operational_status', 'Asset_status'] });
  addEntity(p, { name: 'ProfileAssetAssessment', x: 2000, y: 2300, type: 'associative', attributes: ['_Asset_assessment_id', 'Asset_condition', 'Exposure_level', 'Sensitivity_rating', 'Adaptive_capacity_rating', 'Vulnerability_rating', 'Available_capacity', 'Operational_status', 'Assessment_notes'] });
  addEntity(p, { name: 'ProfileCapacityResource', x: 2950, y: 2300, attributes: ['_Capacity_resource_id', 'Resource_type', 'Resource_name', 'Resource_description', 'Resource_location', 'Total_quantity', 'Operational_quantity', 'Quantity_unit', 'Resource_capacity', 'Resource_condition', 'Availability_status', 'Custodian_or_contact', 'Last_inventory_date', 'Data_state'] });
  addEntity(p, { name: 'ProfileHazardRiskAssessment', x: 3900, y: 2300, type: 'associative', attributes: ['_Risk_assessment_id', 'Assessed_exposure_category', 'Likelihood_score', 'Consequence_score', 'Exposure_score', 'Sensitivity_score', 'Adaptive_capacity_score', 'Vulnerability_score', 'Capacity_score', 'Risk_score', 'Risk_classification', 'Assessment_methodology', 'Priority_rank', 'Recommended_option', 'Assessment_date'] });
  addEntity(p, { name: 'ProfileRiskMap', x: 2050, y: 3900, attributes: ['_Profile_risk_map_id', 'Risk_map_title', 'Risk_map_type', 'Risk_map_coverage', 'Scale_or_resolution', 'Risk_map_date', 'Map_file_reference', 'Risk_map_status', 'Risk_map_notes'] });
  for (const child of ['ClimateScenario', 'HistoricalDisasterLoss', 'ProfilePopulationSummary', 'ProfilePopulationGroup', 'ProfileHousingSummary', 'ProfileExposureUnit', 'ProfileCapacityResource', 'ProfileRiskMap']) {
    addEdge(p, 'CDRAProfileVersion', child, 'contains');
  }
  addEdge(p, 'CriticalAsset', 'ProfileAssetAssessment', 'assessed in profile');
  addEdge(p, 'ProfileExposureUnit', 'ProfileAssetAssessment', 'provides hazard exposure context');
  addEdge(p, 'ProfileExposureUnit', 'ProfileHazardRiskAssessment', 'is evaluated');
  addEdge(p, 'CDRAProfileVersion', 'ProfileHazardRiskAssessment', 'records risk result');
  addText(p, { text: '<b>Exposure categories:</b> population, urban-use area, natural-resource production area, critical facility, lifeline utility, and other locally adopted elements at risk.', x: 250, y: 4300, width: 1650, height: 260, size: 24 });
  addText(p, { text: '<b>Population group dimensions:</b> age, sex, disability, pregnancy, lactation, older persons, children, indigenous groups, and other officially adopted vulnerable groups.', x: 3100, y: 4300, width: 1650, height: 260, size: 24 });
  pages.push(p);
}

// Page 4: hazard records.
{
  const p = newPage('04 — Hazard Records and Verification', 4700, 3500, 'All-hazards registry · jurisdiction-scoped versions · source evidence · maker-checker verification by level');
  addEntity(p, { name: 'HazardType', x: 100, y: 250, attributes: ['_Hazard_type_id', 'Hazard_type_code', 'Hazard_type_name', 'Hazard_category', 'Hazard_definition', 'Default_measurement_unit', 'Authority_source_reference', 'Hazard_type_status'] });
  addEntity(p, { name: 'HazardRecord', x: 1050, y: 250, attributes: ['_Hazard_record_id', 'Hazard_reference_number', 'Originating_level', 'Hazard_created_by', 'Hazard_created_at'] });
  addEntity(p, { name: 'HazardRecordVersion', x: 2000, y: 220, type: 'weak', attributes: ['_Hazard_version_number', 'Hazard_title', 'Hazard_description', 'Location_description', 'Landmark', 'Map_or_geometry_reference', 'Assessment_date_time', 'Onset_date_time', 'End_date_time', 'Observed_or_forecast', 'Intensity_or_magnitude', 'Measurement_unit', 'Severity', 'Frequency_or_probability', 'Spatial_extent', 'Duration', 'Seasonality', 'Confidence_level', 'Hazard_status', 'Prepared_by', 'Submitted_at'] });
  addEntity(p, { name: 'HazardCharacteristic', x: 3100, y: 220, type: 'weak', attributes: ['_Characteristic_sequence_number', 'Characteristic_code', 'Characteristic_name', 'Numeric_value', 'Text_value', 'Measurement_unit', 'Observed_at', 'Data_state', 'Notes'] });
  addEntity(p, { name: 'HazardExposure', x: 100, y: 1500, attributes: ['_Hazard_exposure_id', 'Exposure_category', 'Exposed_item_or_area', 'Exposure_location', 'Estimated_quantity', 'Measurement_unit', 'Estimated_value', 'Data_state', 'Notes'] });
  addEntity(p, { name: 'HazardCapacity', x: 1050, y: 1500, attributes: ['_Hazard_capacity_id', 'Capacity_type', 'Capacity_description', 'Responsible_organization', 'Available_quantity', 'Measurement_unit', 'Capacity_status', 'Capacity_gap'] });
  addEntity(p, { name: 'HazardVerification', x: 2000, y: 1500, attributes: ['_Hazard_verification_id', 'Verification_level', 'Reviewer', 'Reviewing_organization', 'Verification_decision', 'Decision_reason', 'Correction_request', 'Accepted_limitations', 'Verified_at'] });
  addNameOnly(p, { name: 'InformationSource', x: 3100, y: 1500, attributes: ['_Information_source_id', 'See Page 01'] });
  addNameOnly(p, { name: 'Evidence', x: 3900, y: 1500, attributes: ['_Evidence_id', 'See Page 01'] });
  addEdge(p, 'HazardType', 'HazardRecord', 'classifies');
  addEdge(p, 'HazardRecord', 'HazardRecordVersion', 'has versions', 'identifying');
  addEdge(p, 'HazardRecordVersion', 'HazardCharacteristic', 'records measurements', 'identifying');
  addEdge(p, 'HazardRecordVersion', 'HazardExposure', 'identifies exposed elements');
  addEdge(p, 'HazardRecordVersion', 'HazardCapacity', 'records coping capacity');
  addEdge(p, 'HazardRecordVersion', 'HazardVerification', 'receives decisions');
  addEdge(p, 'InformationSource', 'HazardCharacteristic', 'supports observation');
  addEdge(p, 'Evidence', 'HazardRecordVersion', 'substantiates version');
  addText(p, { text: '<b>Verification by level:</b> Barangay verifies Purok-origin records; DRRM verifies Barangay-origin records. A DRRM-origin record requires another authorized DRRM account as verifier.', x: 450, y: 2800, width: 1750, height: 280, size: 24 });
  addText(p, { text: '<b>Weak-entity rule:</b> Hazard_version_number and characteristic sequence are completed by their owning HazardRecord or HazardRecordVersion; no foreign-key attributes are printed in the boxes.', x: 2500, y: 2800, width: 1750, height: 280, size: 24 });
  pages.push(p);
}

// Page 5: incident/report structure.
{
  const p = newPage('05 — Incident and Progressive Report Structure', 5200, 4300, 'Purok submits a simple Initial Report; Barangay consolidates verified Purok versions and prepares richer progressive reports');
  addEntity(p, { name: 'IncidentType', x: 100, y: 240, attributes: ['_Incident_type_id', 'Incident_type_code', 'Incident_type_name', 'Incident_type_description', 'Incident_type_status'] });
  addEntity(p, { name: 'Incident', x: 1050, y: 220, attributes: ['_Incident_id', 'Incident_reference_number', 'Incident_title', 'Occurrence_date_time', 'Discovery_date_time', 'Incident_location', 'Incident_landmark', 'Map_or_geometry_reference', 'Suspected_cause', 'Incident_status', 'Incident_closed_at'] });
  addEntity(p, { name: 'IncidentHazard', x: 2050, y: 240, type: 'associative', attributes: ['_Incident_hazard_association_id', 'Relationship_type', 'Relationship_description'] });
  addNameOnly(p, { name: 'HazardRecordVersion', x: 3050, y: 240, attributes: ['_Hazard_version_number', 'See Page 04'] });
  addEntity(p, { name: 'IncidentReport', x: 4050, y: 220, type: 'supertype', attributes: ['_Incident_report_id', 'Reporting_level', 'Report_series_created_by', 'Report_series_created_at'] });
  const tri = addTriangle(p, { x: 4360, y: 850 });
  addEntity(p, { name: 'PurokIncidentReport', x: 3600, y: 1140, type: 'subtype', attributes: ['_Purok_incident_report_id', 'Purok_report_status'] });
  addEntity(p, { name: 'BarangayIncidentReport', x: 4400, y: 1140, type: 'subtype', attributes: ['_Barangay_incident_report_id', 'Barangay_report_status'] });
  addEntity(p, { name: 'IncidentReportVersion', x: 100, y: 1700, type: 'weak', attributes: ['_Report_version_number', 'Report_stage', 'Occurrence_or_observation_date_time', 'Occurrence_time_state', 'Location_description', 'Landmark', 'Report_as_of_date_time', 'Prevailing_situation', 'Urgent_needs_remarks', 'Assumptions_and_limitations', 'Record_status', 'Draft_owner', 'Prepared_by', 'Submitted_at', 'Received_at'] });
  addEntity(p, { name: 'BarangayReportSource', x: 1100, y: 1700, type: 'associative', attributes: ['_Barangay_report_source_id', 'Source_disposition', 'Source_as_of_date_time', 'Exclusion_reason', 'Source_limitations', 'Reconciliation_notes'] });
  addEntity(p, { name: 'ReportVersionSource', x: 2100, y: 1700, type: 'associative', attributes: ['_Report_version_source_id', 'Source_role', 'Source_citation_snapshot', 'Source_received_at_snapshot', 'Source_notes'] });
  addEntity(p, { name: 'PurokReportVerification', x: 3100, y: 1700, attributes: ['_Purok_report_verification_id', 'Reviewer', 'Reviewing_organization', 'Verification_decision', 'Decision_reason', 'Correction_request', 'Accepted_limitations', 'Eligible_for_consolidation', 'Verified_at'] });
  addEntity(p, { name: 'BarangayReportVerification', x: 4100, y: 1700, attributes: ['_Barangay_report_verification_id', 'Reviewer', 'Reviewing_organization', 'Verification_decision', 'Decision_reason', 'Correction_request', 'Accepted_limitations', 'Eligible_for_situation_report', 'Verified_at'] });
  addNameOnly(p, { name: 'InformationSource', x: 1200, y: 3200, attributes: ['_Information_source_id', 'See Page 01'] });
  addNameOnly(p, { name: 'Evidence', x: 2200, y: 3200, attributes: ['_Evidence_id', 'See Page 01'] });
  addEdge(p, 'IncidentType', 'Incident', 'classifies');
  addEdge(p, 'Incident', 'IncidentHazard', 'has associated hazards');
  addEdge(p, 'HazardRecordVersion', 'IncidentHazard', 'is linked through');
  addEdge(p, 'Incident', 'IncidentReport', 'has reporting series');
  addEdge(p, 'IncidentReport', tri, '', 'inheritance');
  addEdge(p, tri, 'PurokIncidentReport', '', 'inheritance');
  addEdge(p, tri, 'BarangayIncidentReport', '', 'inheritance');
  addText(p, { text: 'Total, disjoint specialization', x: 4060, y: 950, width: 720, height: 80, size: 24, bold: true, align: 'center' });
  addEdge(p, 'IncidentReport', 'IncidentReportVersion', 'has immutable versions', 'identifying');
  addEdge(p, 'IncidentReportVersion', 'BarangayReportSource', 'is exact verified Purok source');
  addEdge(p, 'IncidentReportVersion', 'BarangayReportSource', 'is consolidating Barangay version');
  addEdge(p, 'IncidentReportVersion', 'ReportVersionSource', 'cites report sources');
  addEdge(p, 'InformationSource', 'ReportVersionSource', 'is cited through');
  addEdge(p, 'IncidentReportVersion', 'PurokReportVerification', 'reviewed by Barangay');
  addEdge(p, 'IncidentReportVersion', 'BarangayReportVerification', 'reviewed by DRRM');
  addEdge(p, 'Evidence', 'IncidentReportVersion', 'supports version');
  addText(p, { text: '<b>Report stages:</b> Purok versions remain Initial and may be corrected or resubmitted. Barangay versions may progress through Initial, Progress, Terminal, and Final stages.', x: 350, y: 3700, width: 2050, height: 300, size: 24 });
  addText(p, { text: '<b>Immutability:</b> a submitted version is not silently edited. Corrections produce the next version, while the earlier submission and its review decision remain available to the history modules.', x: 2800, y: 3700, width: 2050, height: 300, size: 24 });
  pages.push(p);
}

// Page 6: simple Purok input and Barangay-owned consolidated effects.
{
  const p = newPage('06 — Purok Initial Information and Barangay Consolidated Effects', 4800, 3900, 'Purok reports affected population; Barangay owns consolidated population, casualty, and damage effects');
  addNameOnly(p, { name: 'IncidentReportVersion', x: 150, y: 230, attributes: ['_Report_version_number', 'Owner shown on Page 05'] });
  addEntity(p, { name: 'ReportEffectItem', x: 1200, y: 220, type: 'supertype', attributes: ['_Report_effect_item_id', 'Affected_location', 'Information_as_of_date_time', 'Remarks'] });
  addNameOnly(p, { name: 'InformationSource', x: 2250, y: 230, attributes: ['_Information_source_id', 'See Page 01'] });
  addEntity(p, { name: 'CasualtyRegisterReference', x: 3300, y: 220, attributes: ['_Casualty_register_reference_id', 'Custodian_organization', 'Register_control_number', 'Secure_repository_reference', 'Register_received_date', 'Validation_status', 'Verified_by', 'Register_remarks'] });
  const tri = addTriangle(p, { x: 1510, y: 900 });
  const subtypes = [
    ['AffectedPopulation', 300, 1350, ['_Affected_population_item_id', 'Population_category', 'Family_count', 'Family_count_state', 'Person_count', 'Person_count_state', 'Current_or_cumulative']],
    ['CasualtySummary', 1750, 1350, ['_Casualty_summary_item_id', 'Dead_count', 'Dead_count_state', 'Injured_count', 'Injured_count_state', 'Ill_count', 'Ill_count_state', 'Missing_count', 'Missing_count_state', 'Validation_classification']],
    ['DamageAssessment', 3200, 1350, ['_Damage_assessment_item_id', 'Damage_category', 'Asset_or_facility_name', 'Damage_classification', 'Partially_damaged_quantity', 'Partial_quantity_state', 'Totally_damaged_quantity', 'Total_quantity_state', 'Affected_area', 'Affected_area_state', 'Measurement_unit', 'Estimated_damage', 'Estimated_damage_state', 'Estimated_loss', 'Estimated_loss_state']],
  ];
  for (const [name, x, y, attrs] of subtypes) addEntity(p, { name, x, y, width: 1100, type: 'subtype', attributes: attrs });
  addEdge(p, 'IncidentReportVersion', 'ReportEffectItem', 'contains allowed effect items');
  addEdge(p, 'InformationSource', 'ReportEffectItem', 'supports each item');
  addEdge(p, 'ReportEffectItem', tri, '', 'inheritance');
  for (const [name] of subtypes) addEdge(p, tri, name, '', 'inheritance');
  addText(p, { text: 'Total, disjoint specialization', x: 1250, y: 1010, width: 700, height: 80, size: 24, bold: true, align: 'center' });
  addEdge(p, 'CasualtySummary', 'CasualtyRegisterReference', 'may cite restricted official register', 'optionalOne');
  addText(p, { text: '<b>Purok scope:</b> Purok Initial Report versions may contain AffectedPopulation only. Unknown values remain null with an explicit unknown state; they are never converted to zero.', x: 200, y: 3050, width: 1300, height: 320, size: 24 });
  addText(p, { text: '<b>Barangay scope:</b> Barangay report versions may contain AffectedPopulation, CasualtySummary, and DamageAssessment, consolidated from exact verified Purok versions and separately sourced Barangay facts.', x: 1750, y: 3050, width: 1300, height: 360, size: 24 });
  addText(p, { text: '<b>Privacy rule:</b> casualty names and medical details remain in a restricted official register. The reporting model stores aggregate counts and a secure reference only.', x: 3300, y: 3050, width: 1300, height: 320, size: 24 });
  pages.push(p);
}

// Page 7: SitRep lifecycle and traceability.
{
  const p = newPage('07 — Situation Report Generation, Approval, and Export', 5800, 5200, 'Structured SitRep body · fixed source snapshot · traceable cumulative values · justified overrides · approval before clean export');
  addEntity(p, { name: 'SituationReport', x: 100, y: 230, attributes: ['_Situation_report_id', 'Situation_report_number', 'Document_type', 'Situation_report_title', 'Reporting_organization', 'Created_by', 'Situation_report_created_at', 'Archived_at'] });
  addEntity(p, { name: 'SituationReportIncident', x: 1050, y: 230, type: 'associative', attributes: ['_Situation_report_incident_id', 'Incident_inclusion_role', 'Incident_inclusion_notes'] });
  addNameOnly(p, { name: 'Incident', x: 2000, y: 230, attributes: ['_Incident_id', 'See Page 05'] });
  addEntity(p, { name: 'SituationReportVersion', x: 2950, y: 200, type: 'weak', attributes: ['_Situation_report_version_number', 'Situation_report_status', 'Operational_period_start', 'Operational_period_end', 'Situation_report_as_of_date_time', 'Data_cutoff_date_time', 'Change_summary', 'Prepared_by', 'Prepared_at'] });
  addEntity(p, { name: 'SituationReportSection', x: 3950, y: 200, type: 'weak', attributes: ['_Section_code', 'Section_heading', 'Section_sequence_number', 'Section_content', 'Last_edited_by', 'Last_edited_at', 'Section_status'] });
  addEntity(p, { name: 'SituationReportSourceSnapshot', x: 4900, y: 200, type: 'weak', attributes: ['_Snapshot_sequence_number', 'Snapshot_cutoff_date_time', 'Snapshot_frozen_at', 'Snapshot_frozen_by', 'Source_coverage_status', 'Snapshot_limitations'] });
  addEntity(p, { name: 'SnapshotBarangayReport', x: 100, y: 1650, type: 'associative', attributes: ['_Snapshot_barangay_entry_id', 'Source_disposition', 'Inclusion_or_exclusion_reason', 'Reconciliation_notes', 'Snapshot_added_at'] });
  addEntity(p, { name: 'SnapshotHazardRecord', x: 1050, y: 1650, type: 'associative', attributes: ['_Snapshot_hazard_entry_id', 'Source_disposition', 'Inclusion_or_exclusion_reason', 'Snapshot_added_at'] });
  addNameOnly(p, { name: 'BarangayIncidentReportVersion', x: 2000, y: 1650, attributes: ['_Report_version_number', 'See Page 05'] });
  addNameOnly(p, { name: 'HazardRecordVersion', x: 2950, y: 1650, attributes: ['_Hazard_version_number', 'See Page 04'] });
  addEntity(p, { name: 'SituationReportDataItem', x: 3950, y: 1600, type: 'weak', attributes: ['_Data_item_code', 'Data_item_category', 'Data_item_label', 'Numeric_value', 'Text_value', 'Measurement_unit', 'Data_state', 'Derived_or_manual', 'Source_coverage_description', 'Data_item_remarks'] });
  addEntity(p, { name: 'SituationReportDataItemSource', x: 4900, y: 1650, type: 'associative', attributes: ['_Data_item_source_id', 'Source_information_category', 'Contribution_description'] });
  addEntity(p, { name: 'SituationReportOverride', x: 100, y: 3000, attributes: ['_Situation_report_override_id', 'Original_derived_value', 'Replacement_value', 'Override_justification', 'Requested_by', 'Requested_at', 'Approved_by', 'Approved_at', 'Override_status'] });
  addEntity(p, { name: 'SituationReportDecision', x: 1050, y: 3000, attributes: ['_Situation_report_decision_id', 'Decision_stage', 'Decision', 'Decision_comments', 'Decided_by', 'Decided_at'] });
  addEntity(p, { name: 'SitRepSignatory', x: 2000, y: 3000, type: 'weak', attributes: ['_Signatory_sequence_number', 'Signatory_role', 'Signatory_display_name', 'Signatory_designation'] });
  addEntity(p, { name: 'SituationReportExport', x: 2950, y: 3000, attributes: ['_Situation_report_export_id', 'Export_format', 'Export_document_status', 'Export_filename', 'Export_file_reference', 'Export_watermarked', 'Generated_by', 'Export_generated_at'] });
  addEntity(p, { name: 'SituationReportAnnex', x: 3950, y: 3000, type: 'weak', attributes: ['_Annex_sequence_number', 'Annex_code', 'Annex_title', 'Annex_description', 'Annex_file_reference'] });
  addNameOnly(p, { name: 'ReportEffectItem', x: 4900, y: 3000, attributes: ['_Report_effect_item_id', 'See Page 06'] });
  addEdge(p, 'SituationReportVersion', 'SituationReportIncident', 'freezes covered incidents');
  addEdge(p, 'Incident', 'SituationReportIncident', 'is included through');
  addEdge(p, 'SituationReport', 'SituationReportVersion', 'has versions', 'identifying');
  addEdge(p, 'SituationReportVersion', 'SituationReportSection', 'contains sections', 'identifying');
  addEdge(p, 'SituationReportVersion', 'SituationReportSourceSnapshot', 'freezes one source set', 'identifying');
  addEdge(p, 'SituationReportSourceSnapshot', 'SnapshotBarangayReport', 'lists report sources');
  addEdge(p, 'BarangayIncidentReportVersion', 'SnapshotBarangayReport', 'is included or excluded');
  addEdge(p, 'SituationReportSourceSnapshot', 'SnapshotHazardRecord', 'lists hazard sources');
  addEdge(p, 'HazardRecordVersion', 'SnapshotHazardRecord', 'is included or excluded');
  addEdge(p, 'SituationReportVersion', 'SituationReportDataItem', 'stores generated values', 'identifying');
  addEdge(p, 'SituationReportDataItem', 'SituationReportDataItemSource', 'has fact lineage');
  addEdge(p, 'ReportEffectItem', 'SituationReportDataItemSource', 'contributes through');
  addEdge(p, 'SituationReportDataItem', 'SituationReportOverride', 'may receive justified override', 'optionalOne');
  addEdge(p, 'SituationReportVersion', 'SituationReportDecision', 'receives review and approval');
  addEdge(p, 'SituationReportVersion', 'SitRepSignatory', 'records signatories', 'identifying');
  addEdge(p, 'SituationReportVersion', 'SituationReportExport', 'generates artifacts');
  addEdge(p, 'SituationReportVersion', 'SituationReportAnnex', 'has ordered annexes', 'identifying');
  addText(p, { text: '<b>Formal body order:</b> Situation Overview; Preparedness Measures; Consolidated Effects; Response Actions; Issues and Concerns; Recommendations.', x: 250, y: 4450, width: 1550, height: 300, size: 24 });
  addText(p, { text: '<b>Document control:</b> report number, title, operational period, cutoff, version, status, preparer, and issue time belong in the header—not as another narrative section.', x: 2050, y: 4450, width: 1550, height: 300, size: 24 });
  addText(p, { text: '<b>Sources, approval, and annexes:</b> sources accompany data items, approval is represented by decisions/signatories, and annexes follow the report body.', x: 3850, y: 4450, width: 1500, height: 300, size: 24 });
  pages.push(p);
}

// Page 8: DRRM-owned formal SitRep content.
{
  const p = newPage('08 — DRRM-Owned Situation Report Content', 6200, 5900, 'Formal operational content is authored or validated by DRRM and is not required from Purok or Barangay reporters');
  addNameOnly(p, { name: 'SituationReportVersion', x: 100, y: 220, attributes: ['_Situation_report_version_number', 'Owner shown on Page 07'] });
  addEntity(p, { name: 'DRRMSitRepContentItem', x: 1250, y: 200, width: 900, type: 'supertype', attributes: ['_SitRep_content_item_id', 'Information_as_of_date_time', 'Data_state', 'Remarks'] });
  addNameOnly(p, { name: 'InformationSource', x: 2400, y: 220, attributes: ['_Information_source_id', 'See Page 01'] });
  addNameOnly(p, { name: 'Evidence', x: 3450, y: 220, attributes: ['_Evidence_id', 'See Page 01'] });
  addNameOnly(p, { name: 'Account', x: 4500, y: 220, attributes: ['_Account_id', 'See Page 01'] });
  const tri = addTriangle(p, { x: 1650, y: 900 });
  const subtypes = [
    ['SituationChronologyEntry', 80, 1300, ['_Chronology_item_id', 'Sequence_number', 'Occurrence_date_time', 'Entry_type', 'Description']],
    ['LifelineStatus', 1100, 1300, ['_Lifeline_status_item_id', 'Lifeline_type', 'Lifeline_name', 'Operator', 'Operational_status', 'Disruption_extent', 'Disruption_started_at', 'Estimated_restoration_at', 'Actual_restoration_at', 'Affected_population_or_area']],
    ['ClassWorkSuspension', 2120, 1300, ['_Suspension_item_id', 'Suspension_type', 'Public_private_scope', 'Education_or_work_scope', 'Suspension_start', 'Suspension_end', 'Issuing_authority', 'Order_or_advisory_number', 'Suspension_status']],
    ['CalamityDeclaration', 3140, 1300, ['_Calamity_declaration_item_id', 'Declaring_body', 'Resolution_or_order_number', 'Declaration_date', 'Effective_date', 'Covered_area', 'Declaration_status']],
    ['PreemptiveEvacuation', 4160, 1300, ['_Preemptive_evacuation_item_id', 'Evacuation_subject', 'Evacuated_families', 'Evacuated_persons', 'Animal_type', 'Evacuated_animals', 'Evacuation_center', 'Evacuation_start', 'Return_or_end_date', 'Evacuation_status']],
    ['ResponseAction', 5180, 1300, ['_Response_action_item_id', 'Action_phase', 'Response_cluster', 'Action_category', 'Action_description', 'Responsible_organization', 'Action_started_at', 'Action_completed_at', 'Action_status', 'Beneficiary_or_coverage', 'Resource_deployed', 'Action_result']],
    ['AssistanceProvided', 550, 3300, ['_Assistance_item_id', 'Recipient_type', 'Recipient_name_or_group', 'Response_cluster', 'Assistance_type', 'Assistance_item', 'Assistance_provider', 'Quantity', 'Measurement_unit', 'Cost_per_unit', 'Total_value', 'Families_requiring_assistance', 'Families_assisted', 'Assistance_date_time', 'Assistance_status']],
    ['IssueConcern', 1950, 3300, ['_Issue_concern_item_id', 'Issue_category', 'Issue_description', 'Issue_identified_at', 'Issue_severity', 'Issue_priority', 'Responsible_organization', 'Issue_status']],
    ['Recommendation', 3350, 3300, ['_Recommendation_item_id', 'Recommended_action', 'Target_organization', 'Recommendation_priority', 'Required_resource', 'Target_completion_date', 'Recommendation_status', 'Recommendation_result']],
    ['PreparednessMeasure', 4750, 3300, ['_Preparedness_measure_item_id', 'Preparedness_category', 'Measure_description', 'Responsible_organization', 'Measure_started_at', 'Measure_status', 'Coverage_or_target', 'Preparedness_result']],
  ];
  for (const [name, x, y, attrs] of subtypes) addEntity(p, { name, x, y, width: 920, type: 'subtype', attributes: attrs });
  addEdge(p, 'SituationReportVersion', 'DRRMSitRepContentItem', 'contains DRRM-owned content');
  addEdge(p, 'InformationSource', 'DRRMSitRepContentItem', 'supports');
  addEdge(p, 'Evidence', 'DRRMSitRepContentItem', 'substantiates');
  addEdge(p, 'Account', 'DRRMSitRepContentItem', 'records or updates');
  addEdge(p, 'DRRMSitRepContentItem', tri, '', 'inheritance');
  for (const [name] of subtypes) addEdge(p, tri, name, '', 'inheritance');
  addText(p, { text: 'Total, disjoint specialization', x: 1320, y: 1020, width: 750, height: 80, size: 24, bold: true, align: 'center' });
  addText(p, { text: '<b>Responsibility rule:</b> these items are authored or validated by authorized DRRM personnel. They are not input fields required from Purok reporters or Barangay consolidators.', x: 600, y: 5250, width: 2200, height: 300, size: 24 });
  addText(p, { text: '<b>Derived-effects rule:</b> affected population, casualty, and damage values remain on Page 06 and enter a SitRep through the frozen, traceable Barangay source snapshot shown on Page 07.', x: 3400, y: 5250, width: 2200, height: 300, size: 24 });
  pages.push(p);
}

function pageXml(page, index) {
  const root = `<root><mxCell id="0"/><mxCell id="1" parent="0"/>${page.cells.join('')}</root>`;
  const model = `<mxGraphModel dx="1600" dy="1000" grid="1" gridSize="20" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${page.width}" pageHeight="${page.height}" math="0" shadow="0">${root}</mxGraphModel>`;
  return `<diagram id="academic_erd_${index}" name="${esc(page.name)}">${model}</diagram>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="app.diagrams.net" modified="2026-09-07T00:00:00.000Z" agent="Codex" version="26.0.16" type="device">${pages.map(pageXml).join('')}</mxfile>\n`;
fs.writeFileSync(OUT, xml, 'utf8');
console.log(`Wrote ${OUT}`);
console.log(`Pages: ${pages.length}; entity/reference boxes: ${entityCount}`);
