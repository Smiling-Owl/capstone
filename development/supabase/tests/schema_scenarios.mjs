import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Runs against the disposable PostgreSQL engine, never the user's application database.
export async function runScenarios(db) {
  let checks = 0;
  const id = Object.fromEntries(['tenant', 'otherTenant', 'city', 'barangay', 'purok', 'otherBarangay',
    'drrm', 'reviewer', 'barangayUser', 'purokUser', 'otherUser', 'source', 'hazardType', 'hazard',
    'hazardVersion', 'secondHazard', 'secondHazardVersion', 'incidentType', 'incident', 'purokReport',
    'purokVersion', 'population', 'barangayReport', 'barangayVersion', 'barangayPopulation',
    'barangayCasualty', 'barangayDamage', 'sitrep', 'sitrepVersion', 'snapshot'].map(key => [key, randomUUID()]));
  const insert = async (table, row) => {
    const keys = Object.keys(row);
    await db.query(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')})`, Object.values(row));
  };
  const reject = async (label, operation, message) => {
    await db.exec('SAVEPOINT expected_rejection');
    let error;
    try {
      await operation();
      await db.exec('SET CONSTRAINTS ALL IMMEDIATE');
    } catch (caught) { error = caught; }
    await db.exec('ROLLBACK TO SAVEPOINT expected_rejection; RELEASE SAVEPOINT expected_rejection');
    assert.ok(error, `${label}: operation was incorrectly accepted`);
    assert.match(error.message, message, `${label}: failed for an unrelated reason`);
    checks += 1;
  };
  const account = async (key, level, unit, creator) => {
    await insert('auth.users', { id: id[key] });
    await insert('public.account', { id: id[key], tenant_id: id.tenant, auth_user_id: id[key], level,
      username: `synthetic.${key}`, first_name: 'Synthetic', last_name: key,
      created_by_account_id: creator ? id[creator] : null });
    const unitColumn = level === 'drrm' ? 'city_unit_id' : `${level}_unit_id`;
    await insert(`public.${level}_account`, { tenant_id: id.tenant, account_id: id[key], [unitColumn]: id[unit] });
  };
  const role = (key, unit, code) => insert('public.role_assignment', {
    tenant_id: id.tenant, account_id: id[key], unit_id: id[unit], role: code, assigned_by_account_id: id.drrm,
  });
  const reportVersion = (versionId, reportId, preparer, extra = {}) => insert('public.incident_report_version', {
    id: versionId, tenant_id: id.tenant, report_id: reportId, version_number: 1, stage: 'initial',
    occurrence_time_state: 'unknown', location_description: 'Synthetic test location',
    as_of_at: '2026-09-01T10:00:00Z', prevailing_situation: 'Synthetic flood observation',
    prepared_by_account_id: preparer, ...extra,
  });
  await db.exec('BEGIN');
  try {
    await insert('public.tenant', { id: id.tenant, name: 'Synthetic validation jurisdiction' });
    await insert('public.tenant', { id: id.otherTenant, name: 'Separate synthetic jurisdiction' });
    for (const [key, kind, parent] of [['city', 'city', null], ['barangay', 'barangay', 'city'],
      ['purok', 'purok', 'barangay'], ['otherBarangay', 'barangay', 'city']]) {
      await insert('public.organization_unit', { id: id[key], tenant_id: id.tenant, kind,
        code: key, name: `Synthetic ${key}`, parent_id: parent ? id[parent] : null });
    }
    await account('drrm', 'drrm', 'city');
    await account('reviewer', 'drrm', 'city', 'drrm');
    await account('barangayUser', 'barangay', 'barangay', 'drrm');
    await account('purokUser', 'purok', 'purok', 'barangayUser');
    await account('otherUser', 'barangay', 'otherBarangay', 'drrm');
    await role('drrm', 'city', 'sitrep_preparer');
    await role('reviewer', 'city', 'drrm_verifier');
    await role('barangayUser', 'barangay', 'barangay_reviewer_reporter');
    await role('purokUser', 'purok', 'purok_reporter');
    await role('otherUser', 'otherBarangay', 'barangay_reviewer_reporter');
    await db.exec('SET CONSTRAINTS ALL IMMEDIATE; SET CONSTRAINTS ALL DEFERRED');
    checks += 1;

    await reject('Account cannot acquire a second subtype', () => insert('public.drrm_account', {
      tenant_id: id.tenant, account_id: id.purokUser, city_unit_id: id.city,
    }), /subtype|discriminator/i);
    await reject('Account must retain a subtype', () => db.query('DELETE FROM public.purok_account WHERE account_id=$1', [id.purokUser]), /exactly one/i);
    await reject('Subtype identity cannot be reassigned', () => db.query('UPDATE public.purok_account SET account_id=$1 WHERE account_id=$2', [randomUUID(), id.purokUser]), /identity cannot change/i);
    await reject('Creator must be the parent Barangay', () => db.query('UPDATE public.account SET created_by_account_id=$1 WHERE id=$2', [id.otherUser, id.purokUser]), /parent Barangay/i);
    await reject('Cross-tenant account reference', () => insert('public.information_source', {
      tenant_id: id.otherTenant, source_type: 'test', source_name: 'Synthetic source', created_by_account_id: id.purokUser,
    }), /foreign key/i);
    await reject('Invalid organization hierarchy', () => insert('public.organization_unit', {
      tenant_id: id.tenant, parent_id: id.city, kind: 'purok', code: 'bad-parent', name: 'Invalid test unit',
    }), /hierarchy/i);

    await insert('public.information_source', { id: id.source, tenant_id: id.tenant,
      source_type: 'field observation', source_name: 'Synthetic field observer', created_by_account_id: id.purokUser });
    await insert('public.hazard_type', { id: id.hazardType, tenant_id: id.tenant, code: 'test-flood',
      name: 'Flood', category: 'hydrometeorological', definition: 'Synthetic test hazard' });
    for (const [hazard, version] of [['hazard', 'hazardVersion'], ['secondHazard', 'secondHazardVersion']]) {
      await insert('public.hazard_record', { id: id[hazard], tenant_id: id.tenant, unit_id: id.purok,
        hazard_type_id: id.hazardType, reference_number: hazard, created_by_account_id: id.purokUser });
      await insert('public.hazard_version', { id: id[version], tenant_id: id.tenant, hazard_record_id: id[hazard],
        version_number: 1, title: 'Synthetic flood', description: 'Test observation', location_description: 'Synthetic location',
        assessment_at: '2026-09-01T09:00:00Z', observed_or_forecast: 'observed', prepared_by_account_id: id.purokUser });
    }
    await insert('public.incident_type', { id: id.incidentType, tenant_id: id.tenant, code: 'test-flood', name: 'Synthetic flooding' });
    await insert('public.incident', { id: id.incident, tenant_id: id.tenant, incident_type_id: id.incidentType,
      reference_number: 'test-event', title: 'Synthetic validation incident', created_by_account_id: id.purokUser });
    await insert('public.incident_hazard', { tenant_id: id.tenant, incident_id: id.incident, hazard_version_id: id.hazardVersion });
    for (const [report, unit, level, creator] of [['purokReport', 'purok', 'purok', 'purokUser'],
      ['barangayReport', 'barangay', 'barangay', 'barangayUser']]) {
      await insert('public.incident_report', { id: id[report], tenant_id: id.tenant, incident_id: id.incident,
        reporting_unit_id: id[unit], level, created_by_account_id: id[creator] });
    }
    await reject('Purok cannot use a Progress stage', () => reportVersion(randomUUID(), id.purokReport, id.purokUser, { stage: 'progress' }), /remains Initial/i);
    await reject('Versions cannot start submitted', () => reportVersion(randomUUID(), id.purokReport, id.purokUser,
      { state: 'submitted', submission_key: randomUUID(), submitted_at: '2026-09-01T10:00:00Z', content_hash: '0'.repeat(64) }), /created as a draft/i);
    await reportVersion(id.purokVersion, id.purokReport, id.purokUser);
    await reportVersion(id.barangayVersion, id.barangayReport, id.barangayUser, { consolidation_cutoff_at: '2026-09-01T11:00:00Z' });
    await reject('Purok cannot record casualties', () => insert('public.report_effect_item', {
      tenant_id: id.tenant, report_version_id: id.purokVersion, kind: 'casualty_summary', information_as_of_at: '2026-09-01T10:00:00Z',
    }), /affected-population totals only/i);
    await reject('Draft cannot be verified', () => insert('public.report_review_decision', {
      tenant_id: id.tenant, report_version_id: id.purokVersion, reviewer_account_id: id.barangayUser, outcome: 'verified',
    }), /Only a submitted version/i);
    await reject('Unverified Purok source cannot be consolidated', () => insert('public.barangay_report_source', {
      tenant_id: id.tenant, barangay_report_version_id: id.barangayVersion, purok_report_version_id: id.purokVersion,
      purok_report_id: id.purokReport, disposition: 'included',
    }), /Only verified Purok/i);
    await reject('Incomplete initial report cannot be submitted', () => db.query(
      "UPDATE public.incident_report_version SET state='submitted', submission_key=$1 WHERE id=$2", [randomUUID(), id.purokVersion]), /information source|affected population/i);
    await insert('public.report_effect_item', { id: id.population, tenant_id: id.tenant, report_version_id: id.purokVersion,
      kind: 'affected_population', information_as_of_at: '2026-09-01T10:00:00Z', source_id: id.source });
    await insert('public.affected_population', { tenant_id: id.tenant, effect_item_id: id.population,
      family_count: 4, family_count_state: 'provisional', person_count: null, person_count_state: 'unknown' });
    await reject('Unknown population cannot be encoded as zero', () => db.query(
      'UPDATE public.affected_population SET person_count=0 WHERE effect_item_id=$1', [id.population]), /check constraint/i);
    await insert('public.report_version_source', { tenant_id: id.tenant, report_version_id: id.purokVersion,
      source_id: id.source, source_citation_snapshot: 'Synthetic observation supplied for runtime validation' });
    await db.query("UPDATE public.incident_report_version SET state='submitted', submission_key=$1 WHERE id=$2", [randomUUID(), id.purokVersion]);
    const submitted = (await db.query('SELECT state,content_hash FROM public.incident_report_version WHERE id=$1', [id.purokVersion])).rows[0];
    assert.equal(submitted.state, 'submitted');
    assert.match(submitted.content_hash, /^[0-9a-f]{64}$/);
    checks += 1;
    await reject('Submitted header is immutable', () => db.query("UPDATE public.incident_report_version SET prevailing_situation='Silent revision' WHERE id=$1", [id.purokVersion]), /immutable/i);
    await reject('Submitted population is immutable', () => db.query('UPDATE public.affected_population SET family_count=99 WHERE effect_item_id=$1', [id.population]), /immutable/i);
    await reject('New hazard cannot alter a submitted incident', () => insert('public.incident_hazard', {
      tenant_id: id.tenant, incident_id: id.incident, hazard_version_id: id.secondHazardVersion,
    }), /immutable after incident reporting/i);
    await reject('Preparer cannot verify own report', () => insert('public.report_review_decision', {
      tenant_id: id.tenant, report_version_id: id.purokVersion, reviewer_account_id: id.purokUser, outcome: 'verified',
    }), /preparer cannot review/i);
    await reject('Review cannot skip the next administrative level', () => insert('public.report_review_decision', {
      tenant_id: id.tenant, report_version_id: id.purokVersion, reviewer_account_id: id.reviewer, outcome: 'verified',
    }), /next authorized administrative level/i);
    await reject('Other Barangay cannot verify report', () => insert('public.report_review_decision', {
      tenant_id: id.tenant, report_version_id: id.purokVersion, reviewer_account_id: id.otherUser, outcome: 'verified',
    }), /jurisdiction/i);
    await insert('public.report_review_decision', { tenant_id: id.tenant, report_version_id: id.purokVersion,
      reviewer_account_id: id.barangayUser, outcome: 'verified' });
    await reject('Verified report after cutoff cannot be consolidated', async () => {
      await db.query("UPDATE public.incident_report_version SET consolidation_cutoff_at='2026-09-01T09:00:00Z' WHERE id=$1", [id.barangayVersion]);
      await insert('public.barangay_report_source', { tenant_id: id.tenant, barangay_report_version_id: id.barangayVersion,
        purok_report_version_id: id.purokVersion, purok_report_id: id.purokReport, disposition: 'included' });
    }, /later than.*cutoff/i);
    await insert('public.barangay_report_source', { tenant_id: id.tenant, barangay_report_version_id: id.barangayVersion,
      purok_report_version_id: id.purokVersion, purok_report_id: id.purokReport, disposition: 'included' });
    await db.exec('SET CONSTRAINTS ALL IMMEDIATE');
    checks += 1;

    await db.exec('SET CONSTRAINTS ALL DEFERRED');
    await insert('public.report_version_source', { tenant_id: id.tenant, report_version_id: id.barangayVersion,
      source_id: id.source, source_citation_snapshot: 'Consolidated Barangay validation source' });
    for (const [effect, kind] of [['barangayPopulation', 'affected_population'], ['barangayCasualty', 'casualty_summary'],
      ['barangayDamage', 'damage_assessment']]) {
      await insert('public.report_effect_item', { id: id[effect], tenant_id: id.tenant,
        report_version_id: id.barangayVersion, kind, information_as_of_at: '2026-09-01T11:00:00Z', source_id: id.source });
    }
    await insert('public.affected_population', { tenant_id: id.tenant, effect_item_id: id.barangayPopulation,
      family_count: 4, family_count_state: 'verified', person_count: 12, person_count_state: 'verified' });
    await insert('public.casualty_summary', { tenant_id: id.tenant, effect_item_id: id.barangayCasualty,
      dead_count: 0, dead_count_state: 'reported_zero', injured_count: 0, injured_count_state: 'reported_zero',
      ill_count: 0, ill_count_state: 'reported_zero', missing_count: 0, missing_count_state: 'reported_zero',
      validation_classification: 'validated' });
    await insert('public.damage_assessment', { tenant_id: id.tenant, effect_item_id: id.barangayDamage,
      damage_category: 'housing', partially_damaged_state: 'unknown', totally_damaged_state: 'unknown',
      affected_area_state: 'unknown', estimated_damage_state: 'unknown', estimated_loss_state: 'unknown' });
    await db.exec('SET CONSTRAINTS ALL IMMEDIATE; SET CONSTRAINTS ALL DEFERRED');
    await db.query("UPDATE public.incident_report_version SET state='submitted', submission_key=$1 WHERE id=$2",
      [randomUUID(), id.barangayVersion]);
    await insert('public.report_review_decision', { tenant_id: id.tenant, report_version_id: id.barangayVersion,
      reviewer_account_id: id.reviewer, outcome: 'verified' });

    await insert('public.situation_report', { id: id.sitrep, tenant_id: id.tenant, city_unit_id: id.city,
      report_number: 'SITREP-TEST-001', title: 'Synthetic Situation Report', created_by_account_id: id.drrm });
    await insert('public.situation_report_version', { id: id.sitrepVersion, tenant_id: id.tenant,
      situation_report_id: id.sitrep, version_number: 1, as_of_at: '2026-09-01T12:00:00Z',
      data_cutoff_at: '2026-09-01T11:00:00Z', prepared_by_account_id: id.drrm });
    await insert('public.situation_report_incident', { tenant_id: id.tenant,
      situation_report_version_id: id.sitrepVersion, incident_id: id.incident,
      incident_reference_snapshot: 'test-event', incident_title_snapshot: 'Synthetic validation incident' });
    const sections = ['situation_overview', 'preparedness_measures', 'consolidated_effects',
      'response_actions', 'issues_and_concerns', 'recommendations'];
    for (const [index, code] of sections.entries()) await insert('public.situation_report_section', {
      tenant_id: id.tenant, situation_report_version_id: id.sitrepVersion, section_code: code,
      heading: code.replaceAll('_', ' '), section_status: 'provided', sequence_number: index + 1,
      content: `Synthetic ${code}`, last_edited_by_account_id: id.drrm,
    });
    await insert('public.sitrep_signatory', { tenant_id: id.tenant, situation_report_version_id: id.sitrepVersion,
      sequence_number: 1, signatory_role: 'Prepared by', display_name: 'Synthetic DRRM Officer', designation: 'DRRM Administrator' });
    await insert('public.sitrep_source_snapshot', { id: id.snapshot, tenant_id: id.tenant,
      situation_report_version_id: id.sitrepVersion, cutoff_at: '2026-09-01T11:00:00Z', coverage_status: 'complete' });
    await insert('public.snapshot_barangay_report', { tenant_id: id.tenant, snapshot_id: id.snapshot,
      report_version_id: id.barangayVersion, report_id: id.barangayReport, disposition: 'included' });
    await db.query('UPDATE public.sitrep_source_snapshot SET frozen_at=now(), frozen_by_account_id=$1 WHERE id=$2',
      [id.drrm, id.snapshot]);
    await db.query("UPDATE public.situation_report_version SET state='under_review' WHERE id=$1", [id.sitrepVersion]);
    const sitrep = (await db.query('SELECT state,content_hash FROM public.situation_report_version WHERE id=$1', [id.sitrepVersion])).rows[0];
    assert.equal(sitrep.state, 'under_review');
    assert.match(sitrep.content_hash, /^[0-9a-f]{64}$/);
    checks += 1;
    await reject('SitRep narrative cannot be silently edited after review starts', () => db.query(
      "UPDATE public.situation_report_section SET content='Silent revision' WHERE situation_report_version_id=$1", [id.sitrepVersion]), /immutable/i);
    console.log(`Runtime account, incident, consolidation, and SitRep scenarios passed: ${checks} assertions and expected rejections.`);
    return checks;
  } finally {
    await db.exec('ROLLBACK');
  }
}
