(() => {
  const STORAGE_KEY = 'drrm-desk-latest-report';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const page = document.body.dataset.page;
  let toastTimer;

  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
  }

  function getSavedReport() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch { return null; }
  }

  function isPriority(report) {
    return Number(report.injured) > 0 || Number(report.missing) > 0 || report.infrastructure === 'Bridge destroyed' || report.action === 'Evacuation requested';
  }

  function addActivity(title, meta) {
    const list = $('#activity-list');
    if (!list) return;
    const item = document.createElement('li');
    const strong = document.createElement('strong');
    const span = document.createElement('span');
    strong.textContent = title;
    span.textContent = meta;
    item.append(strong, span);
    list.prepend(item);
  }

  function initAdmin() {
    const report = getSavedReport();
    const mapState = initMap(report);
    initAdminControls(mapState);
    initSitRepDialog();
    renderSavedReport(report, mapState);
    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEY) renderSavedReport(getSavedReport(), mapState);
    });
  }

  function initMap(saved) {
    const records = [
      { id: 'INC-2026-084', hazard: 'Flood', place: 'Tetuan, Purok 6', detail: '42 affected families. One injury reported.', level: 'Immediate attention', lat: 6.9187, lng: 122.0871, color: '#c9342f' },
      { id: 'INC-2026-083', hazard: 'Fire', place: 'Canelar, Zone 2', detail: 'Six homes damaged. Evacuation requested.', level: 'Immediate attention', lat: 6.9122, lng: 122.0714, color: '#c9342f' },
      { id: 'INC-2026-081', hazard: 'Flood', place: 'Tugbungan', detail: 'Road passable to light vehicles only.', level: 'Needs review', lat: 6.9407, lng: 122.1006, color: '#9a6700' },
      { id: 'INC-2026-079', hazard: 'Typhoon', place: 'San Roque', detail: 'Fallen tree cleared. No casualties.', level: 'Monitored', lat: 6.9281, lng: 122.0472, color: '#4b5563' }
    ];
    if (saved) records.push({ id: saved.id, hazard: saved.hazard, place: `${saved.barangay}, ${saved.area}`, detail: `${saved.families} affected families. ${saved.injured} injured.`, level: isPriority(saved) ? 'Immediate attention' : 'Needs review', lat: Number(saved.lat) || 6.9214, lng: Number(saved.lng) || 122.0790, color: isPriority(saved) ? '#c9342f' : '#9a6700' });

    if (!window.L) {
      const container = $('#incident-map');
      container.classList.add('map-unavailable');
      container.textContent = 'The live map needs an internet connection. Report records remain available below.';
      return { map: null, markers: [], records };
    }

    const map = L.map('incident-map', { zoomControl: false, scrollWheelZoom: false }).setView([6.9214, 122.0790], 13);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    const markers = records.map(record => {
      const marker = L.circleMarker([record.lat, record.lng], { radius: 12, color: '#fff', weight: 4, fillColor: record.color, fillOpacity: 1, bubblingMouseEvents: false }).addTo(map);
      marker.record = record;
      marker.on('click', () => selectRecord(record));
      return marker;
    });
    markers[0].bringToFront();
    return { map, markers, records };
  }

  function selectRecord(record) {
    $('#map-status').textContent = record.level;
    $('#map-status').style.color = record.color;
    $('#map-place').textContent = record.place;
    $('#map-detail').textContent = record.detail;
  }

  function initAdminControls(mapState) {
    $$('[data-map-filter]').forEach(button => button.addEventListener('click', () => {
      $$('[data-map-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      if (!mapState.map) return;
      mapState.markers.forEach(marker => {
        const show = button.dataset.mapFilter === 'All' || marker.record.hazard === button.dataset.mapFilter;
        if (show && !mapState.map.hasLayer(marker)) marker.addTo(mapState.map);
        if (!show && mapState.map.hasLayer(marker)) marker.removeFrom(mapState.map);
      });
    }));

    $('#queue-filter').addEventListener('change', event => {
      $$('#queue-body tr').forEach(row => { row.hidden = event.target.value !== 'All hazards' && row.dataset.hazard !== event.target.value; });
    });

    $('#alert-list').addEventListener('click', event => {
      const button = event.target.closest('.acknowledge');
      if (!button) return;
      const item = button.closest('.priority-item');
      item.classList.add('acknowledged');
      button.textContent = 'Acknowledged';
      button.disabled = true;
      addActivity(`${item.dataset.alertId} acknowledged`, 'Maria Santos, just now');
      if ($$('.priority-item:not(.acknowledged)').length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No unacknowledged escalations. New threshold alerts will appear here.';
        $('#alert-list').append(empty);
      }
      showToast('Alert acknowledged. The decision was added to the audit history.');
    });

    $('#invite-user').addEventListener('click', () => showToast('Invitation flow simulated. No message was sent.'));
    $('#reset-demo').addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); location.reload(); });
  }

  function renderSavedReport(report, mapState) {
    if (!report || document.querySelector(`[data-report-id="${CSS.escape(report.id)}"]`)) return;
    const priority = isPriority(report);
    $('#active-count').textContent = '13';
    $('#review-count').textContent = '8';
    $('#coverage-percent').textContent = '76%';
    $('#coverage-copy').textContent = '38 of 50 barangays';
    $('#review-sources').textContent = '7';
    if (priority) $('#priority-summary').textContent = '3 need immediate attention';

    const row = document.createElement('tr');
    row.dataset.hazard = report.hazard;
    row.dataset.reportId = report.id;
    [report.id, `${report.barangay}, ${report.area}`, report.hazard, report.source].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    const stateCell = document.createElement('td');
    const state = document.createElement('span');
    state.className = `state ${priority ? 'urgent-state' : 'review-state'}`;
    state.textContent = priority ? 'Immediate' : 'Under review';
    stateCell.append(state);
    row.append(stateCell);
    $('#queue-body').prepend(row);

    if (priority) {
      const item = document.createElement('article');
      item.className = 'priority-item';
      item.dataset.alertId = report.id;
      item.dataset.reportId = report.id;
      const copy = document.createElement('div');
      const id = document.createElement('span');
      const heading = document.createElement('h3');
      const body = document.createElement('p');
      const button = document.createElement('button');
      id.textContent = report.id;
      heading.textContent = `Threshold crossed in ${report.barangay}`;
      body.textContent = 'Reviewer and duty officer notified by simulated SMS and push.';
      button.className = 'plain-action acknowledge';
      button.type = 'button';
      button.textContent = 'Acknowledge';
      copy.append(id, heading, body);
      item.append(copy, button);
      $('#alert-list').prepend(item);
    }
    addActivity(`${report.id} received by ${report.mode}`, `${report.source}, just now`);
    if (mapState.map) {
      const record = mapState.records.find(item => item.id === report.id);
      if (record) selectRecord(record);
    }
    showToast(`${report.id} loaded from the field reporter.`);
  }

  function initSitRepDialog() {
    const dialog = $('#sitrep-dialog');
    $$('[data-open="sitrep-dialog"]').forEach(button => button.addEventListener('click', () => {
      $('#sitrep-result').replaceChildren(makeSkeleton());
      $('#approve-draft').disabled = true;
      dialog.showModal();
      setTimeout(() => {
        $('#sitrep-result').replaceChildren(makeSitRepPreview(getSavedReport()));
        $('#approve-draft').disabled = false;
      }, 650);
    }));
    $$('[data-close]', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
    $('#approve-draft').addEventListener('click', () => {
      dialog.close();
      addActivity('SitRep No. 04 marked ready', 'Maria Santos, just now');
      showToast('Draft marked ready for an authorized approver.');
    });
  }

  function makeSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.setAttribute('aria-label', 'Generating draft');
    for (let index = 0; index < 3; index += 1) skeleton.append(document.createElement('i'));
    return skeleton;
  }

  function makeSitRepPreview(report) {
    const article = document.createElement('article');
    article.className = 'sitrep-preview';
    const title = document.createElement('h3');
    const period = document.createElement('p');
    title.textContent = 'Local Situation Report No. 04';
    period.textContent = '29 August 2026, 6:00 AM to 10:30 AM';
    article.append(title, period);
    const entries = [
      ['Prevailing situation', report ? `${report.hazard} report received from ${report.barangay}. Multi-incident monitoring remains active.` : 'Flood, fire, and typhoon impacts remain under active monitoring.'],
      ['Consolidated effects', report ? `1,284 verified affected families. The new report lists ${report.families} additional families as provisional.` : '1,284 affected families from verified sources. Provisional values remain separate.'],
      ['Response actions', 'Priority reports are routed to authorized reviewers and duty officers.'],
      ['Source coverage', report ? '38 of 50 barangays received. 31 verified and 7 under review.' : '37 of 50 barangays received. 31 verified and 6 under review.']
    ];
    entries.forEach(([label, value]) => {
      const section = document.createElement('section');
      const strong = document.createElement('strong');
      const span = document.createElement('span');
      strong.textContent = label;
      span.textContent = value;
      section.append(strong, span);
      article.append(section);
    });
    return article;
  }

  function initReporter() {
    const form = $('#field-report-form');
    let currentStep = 1;
    let locationCaptured = false;
    let offline = false;
    const observed = form.elements.observed;
    observed.value = localDateTime();

    $('#network-toggle').addEventListener('change', event => {
      offline = event.target.checked;
      $('#connection-card').classList.toggle('offline', offline);
      $('#connection-title').textContent = offline ? 'No mobile data' : 'Online';
      $('#connection-copy').textContent = offline ? 'SMS fallback will be used' : 'Web gateway available';
      updateTransmission(offline);
    });

    $('#capture-location').addEventListener('click', event => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Capturing';
      const done = (lat, lng, accuracy, simulated = false) => {
        locationCaptured = { lat, lng };
        $('#location-copy').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}, accuracy ${Math.round(accuracy)} m${simulated ? ' (sample)' : ''}`;
        button.textContent = 'Location captured';
        showToast('Coordinates attached to the report.');
      };
      if (!navigator.geolocation) return done(6.9214, 122.0790, 18, true);
      navigator.geolocation.getCurrentPosition(position => done(position.coords.latitude, position.coords.longitude, position.coords.accuracy), () => done(6.9214, 122.0790, 18, true), { enableHighAccuracy: true, timeout: 5000 });
    });

    $$('[data-next]').forEach(button => button.addEventListener('click', () => {
      if (!validateStep(currentStep, form)) return;
      if (currentStep === 2) buildReview(form);
      showStep(currentStep + 1);
    }));
    $$('[data-back]').forEach(button => button.addEventListener('click', () => showStep(currentStep - 1)));
    $$('[data-step-button]').forEach(button => button.addEventListener('click', () => {
      const target = Number(button.dataset.stepButton);
      if (target < currentStep) showStep(target);
    }));

    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const report = { ...data, id: `INC-2026-${String(Date.now()).slice(-3)}`, mode: offline ? 'SMS fallback' : 'web gateway', lat: locationCaptured?.lat || 6.9214, lng: locationCaptured?.lng || 122.0790, submittedAt: new Date().toISOString() };
      const submit = $('#submit-report');
      submit.disabled = true;
      submit.textContent = offline ? 'Encoding SMS' : 'Sending';
      setTimeout(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(report)); }
        catch { showToast('Browser storage is unavailable. The receipt is still simulated.'); }
        form.hidden = true;
        $('.steps').hidden = true;
        const receipt = $('#receipt');
        receipt.hidden = false;
        $('#receipt-id').textContent = report.id;
        $('#receipt-mode').textContent = offline ? 'Encrypted SMS simulation' : 'Web gateway simulation';
        $('#receipt-title').textContent = offline ? 'Encoded for SMS fallback.' : 'Sent to the web gateway.';
        $('#receipt-copy').textContent = isPriority(report) ? 'Priority rules notified the assigned reviewer and duty officer.' : 'The organization can now review this provisional record.';
        receipt.focus();
      }, 800);
    });

    $('#new-field-report').addEventListener('click', () => {
      form.reset();
      offline = false;
      locationCaptured = false;
      form.hidden = false;
      $('.steps').hidden = false;
      $('#receipt').hidden = true;
      $('#connection-card').classList.remove('offline');
      $('#connection-title').textContent = 'Online';
      $('#connection-copy').textContent = 'Web gateway available';
      $('#location-copy').textContent = 'No coordinates captured. You can continue without them.';
      $('#capture-location').disabled = false;
      $('#capture-location').textContent = 'Capture location';
      $('#submit-report').disabled = false;
      observed.value = localDateTime();
      updateTransmission(false);
      showStep(1);
    });

    function showStep(step) {
      currentStep = step;
      $$('.form-step').forEach(section => { section.hidden = Number(section.dataset.step) !== step; });
      $$('[data-step-button]').forEach(button => {
        if (Number(button.dataset.stepButton) === step) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      $(`.form-step[data-step="${step}"]`)?.scrollIntoView({ block: 'start' });
      updateTransmission(offline);
    }
  }

  function localDateTime() {
    const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function validateStep(step, form) {
    const fields = $$(`[data-step="${step}"] [required]`);
    let firstInvalid = null;
    fields.forEach(field => {
      const invalid = !field.checkValidity();
      const error = field.parentElement.querySelector('.field-error');
      field.classList.toggle('invalid', invalid);
      field.setAttribute('aria-invalid', String(invalid));
      if (error) error.textContent = invalid ? 'Complete this field before continuing.' : '';
      if (invalid && !firstInvalid) firstInvalid = field;
    });
    if (!firstInvalid) return true;
    firstInvalid.focus();
    showToast('Complete the highlighted field.');
    return false;
  }

  function buildReview(form) {
    const data = Object.fromEntries(new FormData(form));
    const entries = [
      ['Incident', `${data.hazard} in ${data.barangay}, ${data.area}`],
      ['Observed', new Date(data.observed).toLocaleString()],
      ['Source', data.source],
      ['People', `${data.families || 0} families, ${data.injured || 0} injured, ${data.missing || 0} missing`],
      ['Infrastructure', data.infrastructure],
      ['Requested action', data.action]
    ];
    const list = $('#review-list');
    list.replaceChildren();
    entries.forEach(([label, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = value;
      row.append(term, detail);
      list.append(row);
    });
  }

  function updateTransmission(offline) {
    const box = $('#transmission-box');
    if (!box) return;
    box.classList.toggle('sms', offline);
    $('strong', box).textContent = offline ? 'SMS fallback ready' : 'Web submission ready';
    $('p', box).textContent = offline ? 'The record will be encoded into a simulated encrypted SMS.' : 'A stable receipt ID prevents duplicate retries.';
    $('#submit-report').textContent = offline ? 'Send by SMS fallback' : 'Send report';
  }

  if (page === 'admin') initAdmin();
  if (page === 'reporter') initReporter();
})();
