/* ═══════════════════════════════════════════════════════
   INTERACTIONS.JS — Drag-drop, resize, context selector
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

// ── Context Selector Dropdown ──────────────────────────
EAP.initContextSelector = function() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('#ctx-sel-btn');
    var dd = document.getElementById('ctx-dropdown');

    if (btn) {
      e.stopPropagation();
      if (dd) { dd.remove(); return; }
      EAP.openContextDropdown(btn);
      return;
    }

    // Close if clicking outside
    if (dd && !dd.contains(e.target)) dd.remove();
  });
};

EAP.openContextDropdown = function(anchor) {
  var rect = anchor.getBoundingClientRect();
  var dd = document.createElement('div');
  dd.id = 'ctx-dropdown';
  dd.style.cssText = 'position:fixed;top:' + (rect.bottom + 4) + 'px;left:' + rect.left + 'px;width:300px;background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(0,0,0,0.12);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.12);z-index:600;overflow:hidden;animation:ddFadeIn 150ms ease;';

  var html = '<div style="padding:10px;border-bottom:1px solid rgba(0,0,0,0.06);">' +
    '<input type="text" id="ctx-search" placeholder="Search structure…" style="width:100%;padding:6px 10px;border:1px solid rgba(0,0,0,0.1);border-radius:8px;font-size:12px;outline:none;font-family:var(--font-sans);background:rgba(255,255,255,0.7);box-sizing:border-box;" autocomplete="off"/></div>' +
    '<div id="ctx-tree" style="max-height:280px;overflow-y:auto;padding:6px 0;">' + EAP.buildContextTree('') + '</div>';

  dd.innerHTML = html;
  document.body.appendChild(dd);

  var searchInput = document.getElementById('ctx-search');
  searchInput.focus();
  searchInput.addEventListener('input', function() {
    document.getElementById('ctx-tree').innerHTML = EAP.buildContextTree(this.value.trim());
    EAP.wireContextRows();
  });
  searchInput.addEventListener('click', function(e) { e.stopPropagation(); });

  EAP.wireContextRows();
};

EAP.buildContextTree = function(query) {
  var ql = query ? query.toLowerCase() : '';
  var s = EAP.state;
  var html = '';

  function matches(name) { return !ql || name.toLowerCase().indexOf(ql) !== -1; }

  function row(name, type, id, depth, isActive) {
    var indent = depth * 16;
    var typeLabels = { portfolio: 'Portfolio', 'solution-train': 'Sol. Train', art: 'ART', team: 'Team' };
    // Tree line stub for depth > 0
    var treeLine = '';
    if (depth > 0) {
      treeLine = '<span style="display:inline-flex;align-items:center;width:12px;flex-shrink:0;color:' + (isActive ? 'rgba(255,255,255,0.4)' : '#9CA3AF') + ';">└</span>';
    }
    return '<div class="ctx-row' + (isActive ? ' ctx-active' : '') + '" data-ctx-type="' + type + '" data-ctx-name="' + name.replace(/"/g, '&quot;') + '" data-ctx-id="' + id + '" style="padding:7px 12px 7px ' + (12 + indent) + 'px;display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;transition:background 100ms ease;' + (isActive ? 'background:var(--color-primary);color:#fff;' : '') + '">' +
      treeLine +
      '<span style="font-size:9px;text-transform:uppercase;letter-spacing:0.04em;padding:1px 5px;border-radius:2px;flex-shrink:0;' + (isActive ? 'background:rgba(255,255,255,0.2);color:#fff;' : 'background:rgba(0,0,0,0.05);color:#6B7280;') + '">' + typeLabels[type] + '</span>' +
      '<span style="flex:1;font-weight:' + (isActive ? '600' : '400') + ';color:' + (isActive ? '#fff' : '#374151') + ';">' + name + '</span>' +
      '</div>';
  }

  var root = EAP.structure;
  var taskboardOnly = (s.tab === 'taskboard'); // Task Board: only ART + Team

  // Portfolio
  if (!taskboardOnly && matches(root.name)) {
    html += row(root.name, 'portfolio', root.id, 0, s.context === 'portfolio');
  }

  // Solution Trains → ARTs → Teams
  (root.children || []).forEach(function(st) {
    var stMatch = matches(st.name);
    var anyBelow = (st.children || []).some(function(art) {
      return matches(art.name) || (art.children || []).some(function(t) { return matches(t.name); });
    });
    if (!stMatch && !anyBelow) return;

    if (!taskboardOnly && !ql) html += row(st.name, 'solution-train', st.id, 1, s.context === 'solution-train' && s.contextId === st.id);

    var artDepth = taskboardOnly ? 0 : (ql ? 1 : 2);
    var teamDepth = taskboardOnly ? 1 : (ql ? 2 : 3);

    (st.children || []).forEach(function(art) {
      var artMatch = matches(art.name);
      var teamMatches = (art.children || []).some(function(t) { return matches(t.name); });
      if (!artMatch && !teamMatches) return;

      html += row(art.name, 'art', art.id, artDepth, s.context === 'art' && s.contextId === art.id);

      (art.children || []).forEach(function(team) {
        if (!matches(team.name)) return;
        html += row(team.name, 'team', team.id, teamDepth, s.context === 'team' && s.contextId === team.id);
      });
    });
  });

  return html || '<div style="padding:16px;text-align:center;color:var(--text-disabled);font-size:12px;font-style:italic;">No results</div>';
};

EAP.wireContextRows = function() {
  document.querySelectorAll('.ctx-row').forEach(function(row) {
    row.addEventListener('click', function(e) {
      e.stopPropagation();
      EAP.setContext(row.dataset.ctxType, row.dataset.ctxName, row.dataset.ctxId);
      var dd = document.getElementById('ctx-dropdown');
      if (dd) dd.remove();
    });
    row.addEventListener('mouseenter', function() {
      if (!row.classList.contains('ctx-active')) row.style.background = 'rgba(14,78,105,0.06)';
    });
    row.addEventListener('mouseleave', function() {
      if (!row.classList.contains('ctx-active')) row.style.background = '';
    });
  });
};

// ── Split View Resize ──────────────────────────────────
EAP.initSplitResize = function() {
  document.addEventListener('mousedown', function(e) {
    var grip = e.target.closest('.split-div');
    if (!grip) return;

    var left = grip.previousElementSibling;
    if (!left || !left.classList.contains('split-left')) return;

    e.preventDefault();
    var startX = e.clientX;
    var startW = left.offsetWidth;
    var contentArea = grip.parentElement;
    var totalW = contentArea.offsetWidth;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    grip.style.opacity = '1';

    function onMove(ev) {
      var delta = ev.clientX - startX;
      var newW = Math.min(Math.max(startW + delta, 200), totalW - 300);
      left.style.flex = 'none';
      left.style.width = newW + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
};

// ── Dependency Lines (SVG) ─────────────────────────────
EAP.drawDependencyLines = function() {
  if (!EAP.state.showDeps || (EAP.state.tab !== 'board' && EAP.state.tab !== 'taskboard')) return;
  if (EAP.state.level !== 'Feature' && EAP.state.level !== 'WorkItem') return;

  // Wait for DOM to settle
  requestAnimationFrame(function() {
    var board = document.querySelector('.content-area > div:first-child');
    if (!board) return;

    // Remove old SVG
    var old = board.querySelector('.dep-svg');
    if (old) old.remove();

    board.style.position = 'relative';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dep-svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:20;';

    // Define arrowhead markers
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    ['ok','risk','conflict'].forEach(function(t) {
      var colors = {ok:'rgba(0,0,0,0.3)',risk:'#D97706',conflict:'#dc2626'};
      var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrow-' + t);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '9'); marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '8');
      marker.setAttribute('orient', 'auto-start-reverse');
      var tri = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tri.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      tri.setAttribute('fill', colors[t]);
      marker.appendChild(tri);
      defs.appendChild(marker);
    });
    svg.appendChild(defs);
    board.appendChild(svg);

    var bRect = board.getBoundingClientRect();

    var deps = EAP.state.level === 'WorkItem' ? (EAP.wiDeps || []) : (EAP.featureDeps || []);
    deps.forEach(function(dep) {
      var fromEl = document.getElementById('fcard-' + dep.from);
      var toEl = document.getElementById('fcard-' + dep.to);
      if (!fromEl || !toEl) return;

      var fR = fromEl.getBoundingClientRect();
      var tR = toEl.getBoundingClientRect();
      var x1 = fR.left - bRect.left;
      var y1 = fR.top - bRect.top + fR.height / 2;
      var x2 = tR.right - bRect.left;
      var y2 = tR.top - bRect.top + tR.height / 2;
      var mx = (x1 + x2) / 2;

      var colors = { ok: 'rgba(0,0,0,0.2)', risk: '#D97706', conflict: '#dc2626' };
      var strokeW = dep.type === 'conflict' ? 2.5 : dep.type === 'risk' ? 2 : 1.5;
      var dashArray = dep.type === 'ok' ? '5 3' : 'none';

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', colors[dep.type] || colors.ok);
      path.setAttribute('stroke-width', strokeW);
      if (dashArray !== 'none') path.setAttribute('stroke-dasharray', dashArray);
      path.setAttribute('marker-end', 'url(#arrow-' + dep.type + ')');
      svg.appendChild(path);

      // Source dot (circle at the "from" card)
      var srcDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      srcDot.setAttribute('cx', x1); srcDot.setAttribute('cy', y1);
      srcDot.setAttribute('r', '4');
      srcDot.setAttribute('fill', colors[dep.type] || colors.ok);
      svg.appendChild(srcDot);

      // Diamond midpoint
      var dmx = (x1 + x2) / 2, dmy = (y1 + y2) / 2;
      var diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      diamond.setAttribute('points', dmx + ',' + (dmy - 5) + ' ' + (dmx + 5) + ',' + dmy + ' ' + dmx + ',' + (dmy + 5) + ' ' + (dmx - 5) + ',' + dmy);
      diamond.setAttribute('fill', 'rgba(255,255,255,0.9)');
      diamond.setAttribute('stroke', colors[dep.type] || colors.ok);
      diamond.setAttribute('stroke-width', '1.5');
      diamond.style.pointerEvents = 'all';
      diamond.style.cursor = 'pointer';
      diamond.addEventListener('click', function(evt) {
        evt.stopPropagation();
        // Remove existing popover
        var old = document.getElementById('dep-popover');
        if (old) old.remove();

        var typeLabel = {ok:'Normal',risk:'At Risk',conflict:'Conflict'}[dep.type] || dep.type;
        var typeColor = colors[dep.type] || colors.ok;
        var popover = document.createElement('div');
        popover.id = 'dep-popover';
        popover.style.cssText = 'position:fixed;z-index:700;background:rgba(255,255,255,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(0,0,0,0.12);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.14);padding:16px;width:280px;animation:ddFadeIn 150ms ease;';
        popover.style.left = (evt.clientX + 12) + 'px';
        popover.style.top = (evt.clientY - 20) + 'px';

        popover.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
            '<span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;background:' + typeColor + ';color:#fff;text-transform:uppercase;letter-spacing:0.03em;">' + typeLabel + '</span>' +
            '<button onclick="this.parentElement.parentElement.remove()" style="border:none;background:rgba(0,0,0,0.04);width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:13px;color:var(--text-tertiary);display:flex;align-items:center;justify-content:center;">×</button>' +
          '</div>' +
          '<div style="font-size:12px;font-weight:500;color:var(--text-primary);margin-bottom:4px;">' + dep.from + ' → ' + dep.to + '</div>' +
          '<div style="font-size:11px;color:var(--text-secondary);line-height:1.5;margin-bottom:12px;">' + dep.reason + '</div>' +
          (dep.type === 'conflict' ? '<div style="padding:8px 10px;background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.12);border-radius:8px;font-size:11px;color:#8c1d1d;line-height:1.4;"><strong>Suggested fix:</strong> Resolve Auth API blocker before continuing Payment Confirmation flow. Escalate to Auth Team lead.</div>' : '') +
          (dep.type === 'risk' ? '<div style="padding:8px 10px;background:rgba(217,119,6,0.06);border:1px solid rgba(217,119,6,0.12);border-radius:8px;font-size:11px;color:#92400e;line-height:1.4;"><strong>Watch:</strong> Monitor Auth progress closely. If below 80% by Sprint 3, trigger contingency plan.</div>' : '');

        document.body.appendChild(popover);

        // Close on outside click
        setTimeout(function() {
          document.addEventListener('click', function closer(e) {
            if (!popover.contains(e.target)) { popover.remove(); document.removeEventListener('click', closer); }
          });
        }, 10);
      });
      svg.appendChild(diamond);
    });
  });
};

// ── CSS for animations ─────────────────────────────────
(function() {
  var style = document.createElement('style');
  style.textContent =
    '@keyframes ddFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }' +
    '.dep-svg { pointer-events: none; }' +
    '.search-dim { opacity: 0.15 !important; transition: opacity 200ms ease; }' +
    '.search-hit { background: rgba(245,158,11,0.08) !important; transition: background 200ms ease; }' +
    '@keyframes cardDrop { 0% { transform: scale(1.03); box-shadow: 0 0 0 2px rgba(37,99,235,0.2); } 100% { transform: scale(1); box-shadow: none; } }' +
    '.card-dropped { animation: cardDrop 250ms ease-out; }';
  document.head.appendChild(style);
})();

// ── Search ─────────────────────────────────────────────
EAP.initSearch = function() {
  document.addEventListener('input', function(e) {
    if (!e.target.classList.contains('chrome-search')) return;
    var q = e.target.value.trim().toLowerCase();
    EAP.applySearch(q);
  });
};

EAP.applySearch = function(q) {
  var content = document.getElementById('content-area');
  if (!content) return;

  // Clear previous
  content.querySelectorAll('.search-dim, .search-hit').forEach(function(el) {
    el.classList.remove('search-dim', 'search-hit');
  });

  if (!q) return;

  var tab = EAP.state.tab;
  var hits = 0;

  if (tab === 'backlog' || tab === 'planning') {
    // Search table rows
    content.querySelectorAll('.dtbl tbody tr').forEach(function(row) {
      if (row.textContent.toLowerCase().indexOf(q) !== -1) {
        row.classList.add('search-hit');
        hits++;
        // Expand parent accordion if collapsed
        var body = row.closest('.pi-body');
        if (body && !body.classList.contains('open')) {
          body.classList.add('open');
          body.style.display = '';
          var id = body.id.replace('pi-body-', '');
          EAP.state.openAccordions[id] = true;
          var tog = document.getElementById('pi-tog-' + id);
          if (tog) { tog.textContent = '−'; tog.classList.add('open'); }
        }
      } else {
        row.classList.add('search-dim');
      }
    });
  }

  if (tab === 'board' || tab === 'taskboard') {
    // Search board/task board cards
    content.querySelectorAll('.bcard').forEach(function(card) {
      if (card.textContent.toLowerCase().indexOf(q) !== -1) {
        card.classList.add('search-hit');
        hits++;
      } else {
        card.classList.add('search-dim');
      }
    });
  }

  if (tab === 'hierarchy') {
    // Search hierarchy rows
    content.querySelectorAll('.hier-tbl tbody tr').forEach(function(row) {
      if (row.style.display === 'none') return; // already hidden
      if (row.textContent.toLowerCase().indexOf(q) !== -1) {
        row.classList.add('search-hit');
        hits++;
      } else {
        row.classList.add('search-dim');
      }
    });
  }
};

// ── Board Drag & Drop ──────────────────────────────────
EAP.initBoardDrag = function() {
  var content = document.getElementById('content-area');
  if (!content) return;

  var dragging = null;
  var dragSource = null;

  // Make all board cards draggable
  content.querySelectorAll('.bcard').forEach(function(card) {
    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function(e) {
      dragging = card;
      dragSource = card.parentElement;
      card.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.id || '');
    });

    card.addEventListener('dragend', function() {
      card.style.opacity = '1';
      dragging = null;
      dragSource = null;
      // Remove all drop highlights
      content.querySelectorAll('.drop-highlight').forEach(function(el) { el.classList.remove('drop-highlight'); });
    });
  });

  // Column/cell drop zones
  content.querySelectorAll('[style*="min-height"]').forEach(function(zone) {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drop-highlight');
    });

    zone.addEventListener('dragleave', function() {
      zone.classList.remove('drop-highlight');
    });

    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      zone.classList.remove('drop-highlight');
      if (!dragging || zone === dragSource) return;

      // Move the card to the new zone
      zone.appendChild(dragging);
      dragging.style.opacity = '1';

      // Drop animation
      dragging.classList.add('card-dropped');
      var cardRef = dragging;
      setTimeout(function() { cardRef.classList.remove('card-dropped'); }, 300);
    });
  });

  // Table row drag (within same table) with drop animation
  var rowDragging = null;
  var rowMoved = false;
  content.querySelectorAll('.dtbl tbody tr').forEach(function(row) {
    row.setAttribute('draggable', 'true');
    row.addEventListener('dragstart', function(e) {
      e.stopPropagation();
      rowDragging = row;
      rowMoved = false;
      row.style.opacity = '0.35';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'row');
    });
    row.addEventListener('dragend', function() {
      row.style.opacity = '1';
      if (rowMoved) {
        // Flash animation — apply directly to each td
        var tds = row.querySelectorAll('td');
        tds.forEach(function(td) {
          td.style.transition = 'background 350ms ease-out';
          td.style.background = 'rgba(37,99,235,0.08)';
        });
        setTimeout(function() {
          tds.forEach(function(td) { td.style.background = ''; });
          setTimeout(function() { tds.forEach(function(td) { td.style.transition = ''; }); }, 100);
        }, 350);
      }
      rowDragging = null;
      rowMoved = false;
    });
    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (!rowDragging || row === rowDragging) return;
      if (row.parentNode !== rowDragging.parentNode) return;
      rowMoved = true;
      var rect = row.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        row.parentNode.insertBefore(rowDragging, row);
      } else {
        row.parentNode.insertBefore(rowDragging, row.nextSibling);
      }
    });
  });
};

// ── Initialize all interactions ────────────────────────
EAP.initInteractions = function() {
  EAP.initContextSelector();
  EAP.initSplitResize();
  EAP.initSearch();
};

// ── Hook into render cycle ─────────────────────────────
var _originalRender = EAP.render;
EAP.render = function() {
  _originalRender();
  // Post-render hooks
  setTimeout(function() {
    EAP.initBoardDrag();
    EAP.drawDependencyLines();
    if (EAP.state.tab === 'timeline' && EAP.tlDrawDeps) EAP.tlDrawDeps();
    // Clear search on tab change
    var si = document.querySelector('.chrome-search');
    if (si && si.value) EAP.applySearch(si.value.trim().toLowerCase());
  }, 60);
};
