function demandRowTR(d) {
  return `
    <tr>
      <td><a class="dm-table-link" href="demand-detail.html?id=${d.id}">${d.title}</a></td>
      <td>${d.id}</td>
      <td>${d.portfolio}</td>
      <td>${stateBadgeHTML(d.state)}</td>
      <td>${priorityBadgeHTML(d.priority)}</td>
      <td class="is-numeric">${d.score != null ? d.score : '–'}</td>
      <td>${formatDate(d.startDate)}</td>
      <td>${formatDate(d.endDate)}</td>
    </tr>`;
}

const TAB_STATES = {
  'In progress': ['Draft', 'Submitted', 'Screening', 'Qualified'],
  'Complete':    ['Approved', 'Complete']
};

function renderTable(filter) {
  const states = TAB_STATES[filter];
  const rows = filter === 'All' ? MY_DEMANDS : MY_DEMANDS.filter(d => states.includes(d.state));
  document.getElementById('dm-table-body').innerHTML = rows.map(demandRowTR).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable('All');

  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      renderTable(tab.dataset.filter);
    });
  });

  document.querySelectorAll('[data-icon]').forEach(el => {
    const svg = window.HorizonIcons && window.HorizonIcons[el.dataset.icon];
    if (svg) el.innerHTML = svg;
  });
});
