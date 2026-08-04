const QUEUE = [
  { title: 'Data center capacity expansion', state: 'Qualified', next: 'Overdue: assessment due date missed by 2 days', isError: true,
    meta: { initials: 'MC', name: 'Marcus Chen', role: 'Owner' } },
  { title: 'Employee wellness app pilot', state: 'Draft', next: 'Awaiting requestor submission',
    meta: { initials: 'PP', name: 'Priya Patel', role: 'Stakeholder' } },
  { title: 'Supply chain visibility tool', state: 'Approved', next: 'Start date Aug 4, 2026',
    meta: { initials: 'DF', name: 'Diego Fernandez', role: 'Owner' } },
];

function demandRowHTML(d) {
  const detailsHTML = d.meta.role ? `<p class="dmw-details">Your relation: ${d.meta.role}</p>` : '';
  const updateHTML = d.next
    ? `<p class="dmw-next${d.isError ? ' is-error' : ''}"><span class="dmw-update-label">Update:</span> ${d.next}</p>`
    : '';
  const href = d.href || '#';

  return `
    <a class="dmw-card" href="${href}">
      <div class="dmw-card-body">
        <p class="dmw-title">${d.title}</p>
        <div class="dmw-meta">
          <span class="dmw-person"><span class="aiux-avatar">${d.meta.initials}</span>${d.meta.name}</span>
          ${stateBadgeHTML(d.state)}
        </div>
        ${detailsHTML}
        ${updateHTML}
      </div>
      <span class="dmw-card-chevron" data-icon="chevron-right"></span>
    </a>`;
}

function renderDemandList(containerId, items) {
  document.getElementById(containerId).innerHTML = items.map(demandRowHTML).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const submissions = MY_DEMANDS.slice(0, 5).map(d => ({
    title: d.title, state: d.state, href: `demand-detail.html?id=${d.id}`,
    meta: { initials: d.demandManager.initials, name: d.demandManager.name },
  }));
  renderDemandList('submissions-list', submissions);
  renderDemandList('queue-list', QUEUE);
  document.getElementById('my-demands-count').textContent = MY_DEMANDS.length;

  document.querySelectorAll('[data-icon]').forEach(el => {
    const svg = window.HorizonIcons && window.HorizonIcons[el.dataset.icon];
    if (svg) el.innerHTML = svg;
  });
});
