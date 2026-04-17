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
      treeLine = '<span style="display:inline-flex;align-items:center;width:12px;flex-shrink:0;color:' + (isActive ? 'rgba(255,255,255,0.3)' : '#E5E7EB') + ';">└</span>';
    }
    return '<div class="ctx-row' + (isActive ? ' ctx-active' : '') + '" data-ctx-type="' + type + '" data-ctx-name="' + name.replace(/"/g, '&quot;') + '" data-ctx-id="' + id + '" style="padding:7px 12px 7px ' + (12 + indent) + 'px;display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;transition:background 100ms ease;' + (isActive ? 'background:var(--color-primary);color:#fff;' : '') + '">' +
      treeLine +
      '<span style="font-size:9px;text-transform:uppercase;letter-spacing:0.04em;padding:1px 5px;border-radius:2px;flex-shrink:0;' + (isActive ? 'background:rgba(255,255,255,0.2);color:#fff;' : 'background:rgba(0,0,0,0.05);color:#6B7280;') + '">' + typeLabels[type] + '</span>' +
      '<span style="flex:1;font-weight:' + (isActive ? '600' : '400') + ';color:' + (isActive ? '#fff' : '#374151') + ';">' + name + '</span>' +
      '</div>';
  }

  var root = EAP.structure;

  // Portfolio
  if (matches(root.name)) {
    html += row(root.name, 'portfolio', root.id, 0, s.context === 'portfolio');
  }

  // Solution Trains
  (root.children || []).forEach(function(st) {
    var stMatch = matches(st.name);
    var anyBelow = (st.children || []).some(function(art) {
      return matches(art.name) || (art.children || []).some(function(t) { return matches(t.name); });
    });
    if (!stMatch && !anyBelow) return;

    if (!ql) html += row(st.name, 'solution-train', st.id, 1, s.context === 'solution-train' && s.contextId === st.id);

    (st.children || []).forEach(function(art) {
      var artMatch = matches(art.name);
      var teamMatches = (art.children || []).some(function(t) { return matches(t.name); });
      if (!artMatch && !teamMatches) return;

      html += row(art.name, 'art', art.id, ql ? 1 : 2, s.context === 'art' && s.contextId === art.id);

      (art.children || []).forEach(function(team) {
        if (!matches(team.name)) return;
        html += row(team.name, 'team', team.id, ql ? 2 : 3, s.context === 'team' && s.contextId === team.id);
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

// ── Drag and Drop (within tables) ──────────────────────
EAP.initDragDrop = function() {
  // Use event delegation on the content area
  var content = document.getElementById('content-area');
  if (!content) return;

  var dragging = null;

  content.addEventListener('dragstart', function(e) {
    var row = e.target.closest('tr[draggable]');
    if (!row) return;
    dragging = row;
    row.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
  });

  content.addEventListener('dragend', function(e) {
    var row = e.target.closest('tr');
    if (row) row.style.opacity = '1';
    dragging = null;
  });

  content.addEventListener('dragover', function(e) {
    e.preventDefault();
    var row = e.target.closest('tr');
    if (!row || !dragging || row === dragging) return;
    // Only reorder within same tbody
    if (row.parentNode !== dragging.parentNode) return;
    var rect = row.getBoundingClientRect();
    var mid = rect.top + rect.height / 2;
    if (e.clientY < mid) {
      row.parentNode.insertBefore(dragging, row);
    } else {
      row.parentNode.insertBefore(dragging, row.nextSibling);
    }
  });

  // Make all table rows draggable
  content.querySelectorAll('.dtbl tbody tr').forEach(function(row) {
    row.setAttribute('draggable', 'true');
  });
};

// ── Dependency Lines (SVG) ─────────────────────────────
EAP.drawDependencyLines = function() {
  if (!EAP.state.showDeps || EAP.state.tab !== 'Board') return;
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

      var colors = { ok: 'rgba(0,0,0,0.15)', risk: '#D97706', conflict: '#dc2626' };
      var strokeW = dep.type === 'conflict' ? 2.5 : dep.type === 'risk' ? 2 : 1.5;
      var dashArray = dep.type === 'ok' ? '5 3' : 'none';

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', colors[dep.type] || colors.ok);
      path.setAttribute('stroke-width', strokeW);
      if (dashArray !== 'none') path.setAttribute('stroke-dasharray', dashArray);
      svg.appendChild(path);

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

// ── CSS for dropdown animation ─────────────────────────
(function() {
  var style = document.createElement('style');
  style.textContent = '@keyframes ddFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } } .dep-svg { pointer-events: none; }';
  document.head.appendChild(style);
})();

// ── Initialize all interactions ────────────────────────
EAP.initInteractions = function() {
  EAP.initContextSelector();
  EAP.initSplitResize();
};

// ── Hook into render cycle ─────────────────────────────
var _originalRender = EAP.render;
EAP.render = function() {
  _originalRender();
  // Post-render hooks
  setTimeout(function() {
    EAP.initDragDrop();
    EAP.drawDependencyLines();
  }, 60);
};
