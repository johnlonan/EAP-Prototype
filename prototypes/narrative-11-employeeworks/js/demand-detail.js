function initialsOf(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function stepperHTML(currentState) {
  const currentIndex = STATE_ORDER.indexOf(currentState);
  const isComplete = currentState === 'Complete';
  return STATE_ORDER.map((stage, i) => {
    const status = i < currentIndex || (isComplete && i === currentIndex) ? 'done' : i === currentIndex ? 'current' : 'upcoming';
    const connector = i < STATE_ORDER.length - 1 ? `<span class="dm-stepper-line${i < currentIndex ? ' is-done' : ''}"></span>` : '';
    const icon = status === 'done' ? '<span data-icon="check"></span>' : (i + 1);
    return `
      <div class="dm-stepper-step">
        <span class="dm-stepper-icon dm-stepper-icon--${status}">${icon}</span>
        <span class="dm-stepper-label">${stage}</span>
      </div>${connector}`;
  }).join('');
}

function fieldRow(label, value, isNumeric) {
  return `<div class="dm-field"><dt>${label}</dt><dd${isNumeric ? ' class="is-numeric"' : ''}>${value}</dd></div>`;
}

function stateExplainHTML(state) {
  const ex = STATE_EXPLANATION[state];
  if (!ex) return '';
  return `<p class="dm-track-headline">${ex.headline}</p><p class="dm-track-sub">${ex.sub}</p>`;
}

function deliveryStatusBadgeHTML(status) {
  const color = DELIVERY_STATUS_COLOR[status] || 'neutral';
  return `<span class="aiux-badge dmw-state-badge dmw-state-badge--${color}">${status}</span>`;
}

function deliveryMetaItem(label, value) {
  return `<div class="dm-delivery-meta-item"><dt>${label}</dt><dd>${value}</dd></div>`;
}

// Generic by entity type — same render path whether the demand has
// converted yet or is still just headed toward one.
function deliverySectionHTML(demand) {
  const type = demand.targetEntityType;
  const labels = ENTITY_TYPE_LABELS[type] || {};
  const eyebrow = `Delivery — Resulting ${type}`;
  const e = demand.convertedEntity;

  if (!e) {
    return `
      <p class="dm-track-eyebrow">${eyebrow}</p>
      <div class="dm-delivery-notyet">
        <span class="dm-delivery-notyet-icon" data-icon="rocketship"></span>
        <div>
          <p class="dm-delivery-notyet-title">Not yet converted</p>
          <p class="dm-delivery-notyet-text">This demand will become a ${type.toLowerCase()} once approved.</p>
        </div>
      </div>`;
  }

  return `
    <div class="dm-delivery-header">
      <p class="dm-track-eyebrow" style="margin:0;">${eyebrow}</p>
      ${deliveryStatusBadgeHTML(e.status)}
    </div>
    <p class="dm-delivery-name">${e.number} &middot; ${e.name}</p>
    <div class="dm-progress-row">
      <div class="dm-progress"><div class="dm-progress-fill" style="width:${e.progressPct}%;"></div></div>
      <span class="dm-progress-pct">${e.progressPct}% complete</span>
    </div>
    <p class="dm-delivery-phase">${e.phase}</p>
    <dl class="dm-delivery-meta">
      ${deliveryMetaItem(labels.ownerLabel || 'Owner', e.owner)}
      ${deliveryMetaItem('Target delivery', e.targetDelivery)}
      ${deliveryMetaItem('Last update', e.lastUpdate)}
    </dl>
    <button class="aiux-btn aiux-btn-outline aiux-btn-sm" id="dm-delivery-cta">${labels.ctaLabel || 'View'}</button>`;
}

function businessCaseBlock(label, text) {
  return `<div class="dm-case-block"><p class="dm-case-label">${label}</p><p class="dm-case-text">${text || '—'}</p></div>`;
}

const EDIT_DETAIL_FIELDS = [
  { key: 'businessJustification', label: 'Business justification' },
  { key: 'riskOfPerforming',      label: 'Risk of Performing' },
  { key: 'riskOfNotPerforming',   label: 'Risk of Not Performing' },
  { key: 'assumptions',           label: 'Assumptions' },
];

function hydrateIcons(container) {
  (container || document).querySelectorAll('[data-icon]').forEach(el => {
    const svg = window.HorizonIcons && window.HorizonIcons[el.dataset.icon];
    if (svg) el.innerHTML = svg;
  });
}

function activityRowHTML(a) {
  return `
    <div class="dm-activity-row">
      <span class="aiux-avatar">${initialsOf(a.author)}</span>
      <div class="dm-activity-body">
        <p class="dm-activity-meta"><strong>${a.author}</strong> &middot; ${a.date}</p>
        <p class="dm-activity-text">${a.text}</p>
      </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(window.location.search).get('id');
  const demand = getDemandById(id) || MY_DEMANDS[0];

  document.getElementById('dm-title').textContent = demand.title;
  document.getElementById('dm-subtitle').textContent = `${demand.id} · ${demand.portfolio}`;
  document.getElementById('dm-priority-badge').innerHTML = priorityBadgeHTML(demand.priority);
  document.getElementById('dm-state-badge').innerHTML = stateBadgeHTML(demand.state);
  document.getElementById('dm-track-explain').innerHTML = stateExplainHTML(demand.state);
  document.getElementById('dm-stepper').innerHTML = stepperHTML(demand.state);
  document.getElementById('dm-delivery').innerHTML = deliverySectionHTML(demand);

  document.getElementById('dm-fields').innerHTML = [
    fieldRow('Description', demand.title),
    fieldRow('Requestor', 'John Lonan'),
    fieldRow('Demand Manager', demand.demandManager.name),
    fieldRow('Score', demand.score != null ? demand.score : '–', true),
    fieldRow('Start date', formatDate(demand.startDate)),
    fieldRow('Due date', formatDate(demand.endDate)),
  ].join('');

  document.getElementById('dm-business-case').innerHTML = EDIT_DETAIL_FIELDS
    .map(f => businessCaseBlock(f.label, demand[f.key])).join('');

  const activityEl = document.getElementById('dm-activity');
  const renderActivity = () => {
    activityEl.innerHTML = demand.activity.slice().reverse().map(activityRowHTML).join('');
  };
  renderActivity();

  const worknoteInput = document.getElementById('dm-worknote-input');
  const worknotePost = document.getElementById('dm-worknote-post');
  worknoteInput.addEventListener('input', () => {
    worknotePost.disabled = !worknoteInput.value.trim();
  });

  document.getElementById('dm-worknote-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!worknoteInput.value.trim()) return;
    demand.activity.push({ author: 'John Lonan', date: 'Just now', text: worknoteInput.value.trim() });
    worknoteInput.value = '';
    worknotePost.disabled = true;
    renderActivity();
  });

  // ── Card tabs: Activity / Attachments / Edit details ──
  const tabPanels = {
    activity: document.getElementById('dm-tab-activity'),
    attachments: document.getElementById('dm-tab-attachments'),
    editdetails: document.getElementById('dm-tab-editdetails'),
  };
  document.getElementById('dm-tab-bar').addEventListener('click', e => {
    const btn = e.target.closest('[data-dm-tab]');
    if (!btn) return;
    document.querySelectorAll('#dm-tab-bar .tab-item').forEach(t => t.classList.remove('is-active'));
    btn.classList.add('is-active');
    const target = btn.dataset.dmTab;
    Object.keys(tabPanels).forEach(key => { tabPanels[key].hidden = key !== target; });
  });

  // ── Edit details: read view ↔ edit form, persisted back onto `demand` ──
  const editDetailsEl = tabPanels.editdetails;

  function renderEditDetailsView() {
    editDetailsEl.innerHTML = `
      <div class="dm-edit-details-header">
        <p class="dm-edit-details-title">Details</p>
        <div class="dm-edit-details-actions">
          <button class="icon-btn" id="dm-edit-pencil" aria-label="Edit details"><span data-icon="pencil"></span></button>
        </div>
      </div>
      ${EDIT_DETAIL_FIELDS.map(f => businessCaseBlock(f.label, demand[f.key])).join('')}`;
    hydrateIcons(editDetailsEl);
    document.getElementById('dm-edit-pencil').addEventListener('click', renderEditDetailsForm);
  }

  function renderEditDetailsForm() {
    editDetailsEl.innerHTML = `
      <div class="dm-edit-details-header">
        <p class="dm-edit-details-title">Details</p>
        <div class="dm-edit-details-actions">
          <button class="icon-btn dm-edit-btn-save" id="dm-edit-save" aria-label="Save"><span data-icon="check"></span></button>
          <button class="icon-btn dm-edit-btn-cancel" id="dm-edit-cancel" aria-label="Cancel"><span data-icon="close"></span></button>
        </div>
      </div>
      ${EDIT_DETAIL_FIELDS.map(f => `
        <div class="dm-case-block">
          <p class="dm-case-label">${f.label}</p>
          <textarea class="aiux-textarea" data-edit-field="${f.key}" rows="3">${demand[f.key] || ''}</textarea>
        </div>`).join('')}`;
    hydrateIcons(editDetailsEl);
    document.getElementById('dm-edit-cancel').addEventListener('click', renderEditDetailsView);
    document.getElementById('dm-edit-save').addEventListener('click', () => {
      editDetailsEl.querySelectorAll('[data-edit-field]').forEach(ta => {
        demand[ta.dataset.editField] = ta.value.trim();
      });
      renderEditDetailsView();
    });
  }

  renderEditDetailsView();

  hydrateIcons();
});
