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
  dd.style.cssText = 'position:fixed;top:' + (rect.bottom + 4) + 'px;left:' + rect.left + 'px;width:300px;background:#FFFFFF;border:1px solid #CCCBC8;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.10),0 1px 4px rgba(0,0,0,0.06);z-index:600;overflow:hidden;animation:ddFadeIn 150ms ease;';

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
    return '<div class="ctx-row' + (isActive ? ' ctx-active' : '') + '" data-ctx-type="' + type + '" data-ctx-name="' + name.replace(/"/g, '&quot;') + '" data-ctx-id="' + id + '" style="padding:7px 12px 7px ' + (12 + indent) + 'px;display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;transition:background 100ms ease;' + (isActive ? 'background:#343331;color:#fff;' : '') + '">' +
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
      if (!row.classList.contains('ctx-active')) row.style.background = 'rgba(52,51,49,0.06)';
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
// Convention: dep.from = prerequisite, dep.to = dependent. Arrow: prerequisite → dependent.
EAP.drawDependencyLines = function() {
  if (!EAP.state.showDeps || (EAP.state.tab !== 'board' && EAP.state.tab !== 'taskboard')) return;
  if (EAP.state.level !== 'Feature' && EAP.state.level !== 'WorkItem') return;
  var filter = EAP.state.depFilter || 'all';

  requestAnimationFrame(function() {
    var board = document.querySelector('.content-area > div:first-child');
    if (!board) return;

    var old = board.querySelector('.dep-svg');
    if (old) old.remove();

    board.style.position = 'relative';
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'dep-svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:20;';

    var hex = { conflict:'#ef4444', risk:'#f59e0b', satisfied:'#22c55e' };

    var defs = document.createElementNS(SVG_NS, 'defs');
    ['conflict','risk','satisfied'].forEach(function(t) {
      var marker = document.createElementNS(SVG_NS, 'marker');
      marker.setAttribute('id', 'arrow-' + t);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '9'); marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '7'); marker.setAttribute('markerHeight', '7');
      marker.setAttribute('orient', 'auto');
      var tri = document.createElementNS(SVG_NS, 'path');
      tri.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      tri.setAttribute('fill', hex[t]);
      marker.appendChild(tri);
      defs.appendChild(marker);
    });
    svg.appendChild(defs);
    board.appendChild(svg);

    var bRect = board.getBoundingClientRect();
    var deps = EAP.state.level === 'WorkItem' ? (EAP.wiDeps || []) : (EAP.featureDeps || []);
    if (filter !== 'all') deps = deps.filter(function(d) { return d.type === filter; });

    deps.forEach(function(dep, idx) {
      var fromEl = document.getElementById('fcard-' + dep.from);
      var toEl = document.getElementById('fcard-' + dep.to);
      if (!fromEl || !toEl) return;

      var fR = fromEl.getBoundingClientRect();
      var tR = toEl.getBoundingClientRect();
      // Direction-aware edge selection: connect the edges closest to each other.
      // Horizontal gap > vertical gap → connect horizontal edges; else vertical.
      var fCx = fR.left + fR.width / 2, fCy = fR.top + fR.height / 2;
      var tCx = tR.left + tR.width / 2, tCy = tR.top + tR.height / 2;
      var dxCenters = tCx - fCx, dyCenters = tCy - fCy;
      var x1, y1, x2, y2, isHorizontal = Math.abs(dxCenters) >= Math.abs(dyCenters) * 0.8;
      if (isHorizontal) {
        if (dxCenters >= 0) {
          // dependent is to the right → from.right → to.left
          x1 = fR.right - bRect.left; y1 = fCy - bRect.top;
          x2 = tR.left - bRect.left;  y2 = tCy - bRect.top;
        } else {
          // dependent is to the left → from.left → to.right
          x1 = fR.left - bRect.left;  y1 = fCy - bRect.top;
          x2 = tR.right - bRect.left; y2 = tCy - bRect.top;
        }
      } else {
        if (dyCenters >= 0) {
          // dependent is below → from.bottom → to.top
          x1 = fCx - bRect.left; y1 = fR.bottom - bRect.top;
          x2 = tCx - bRect.left; y2 = tR.top - bRect.top;
        } else {
          // dependent is above → from.top → to.bottom
          x1 = fCx - bRect.left; y1 = fR.top - bRect.top;
          x2 = tCx - bRect.left; y2 = tR.bottom - bRect.top;
        }
      }
      var col = hex[dep.type] || hex.satisfied;
      var strokeW = dep.type === 'conflict' ? 2.5 : dep.type === 'risk' ? 2 : 1.5;

      // Group all shapes for this dep so focus mode can dim non-matching deps
      var depG = document.createElementNS(SVG_NS, 'g');
      depG.setAttribute('class', 'board-dep-g');
      depG.setAttribute('data-dep-idx', idx);

      // Bezier control points follow the connection axis
      var path = document.createElementNS(SVG_NS, 'path');
      var d;
      if (isHorizontal) {
        var cx = Math.max(20, Math.abs(x2 - x1) * 0.35);
        var cx1 = dxCenters >= 0 ? x1 + cx : x1 - cx;
        var cx2 = dxCenters >= 0 ? x2 - cx : x2 + cx;
        d = 'M' + x1 + ',' + y1 + ' C' + cx1 + ',' + y1 + ' ' + cx2 + ',' + y2 + ' ' + x2 + ',' + y2;
      } else {
        var cy = Math.max(20, Math.abs(y2 - y1) * 0.35);
        var cy1 = dyCenters >= 0 ? y1 + cy : y1 - cy;
        var cy2 = dyCenters >= 0 ? y2 - cy : y2 + cy;
        d = 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + cy1 + ' ' + x2 + ',' + cy2 + ' ' + x2 + ',' + y2;
      }
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', col);
      path.setAttribute('stroke-width', strokeW);
      if (dep.type === 'risk') path.setAttribute('stroke-dasharray', '5 3');
      path.setAttribute('marker-end', 'url(#arrow-' + dep.type + ')');
      path.setAttribute('opacity', '0.9');
      depG.appendChild(path);

      // Source dot at prerequisite edge
      var srcDot = document.createElementNS(SVG_NS, 'circle');
      srcDot.setAttribute('cx', x1); srcDot.setAttribute('cy', y1); srcDot.setAttribute('r', '4');
      srcDot.setAttribute('fill', col);
      depG.appendChild(srcDot);

      // Midpoint icon — clickable
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var iconBg = document.createElementNS(SVG_NS, 'circle');
      iconBg.setAttribute('cx', mx); iconBg.setAttribute('cy', my); iconBg.setAttribute('r', '10');
      iconBg.setAttribute('fill', '#fff');
      iconBg.setAttribute('stroke', col);
      iconBg.setAttribute('stroke-width', '1.5');
      iconBg.style.cursor = 'pointer';
      iconBg.style.pointerEvents = 'all';
      iconBg.addEventListener('click', function(e) {
        e.stopPropagation();
        EAP.boardFocusChain([dep.from, dep.to], idx);
        EAP.showDepPopover(e.clientX, e.clientY, dep);
      });
      depG.appendChild(iconBg);

      var glyph = document.createElementNS(SVG_NS, 'g');
      glyph.style.pointerEvents = 'none';
      glyph.setAttribute('transform', 'translate(' + (mx - 5.5) + ',' + (my - 5.5) + ')');
      glyph.setAttribute('stroke', col);
      glyph.setAttribute('stroke-width', '1.5');
      glyph.setAttribute('stroke-linecap', 'round');
      glyph.setAttribute('stroke-linejoin', 'round');
      glyph.setAttribute('fill', 'none');
      if (dep.type === 'conflict') {
        glyph.innerHTML = '<path d="M5.5 0.8 L10.2 9.8 L0.8 9.8 Z"/><line x1="5.5" y1="4" x2="5.5" y2="7"/><circle cx="5.5" cy="8.6" r="0.3" fill="' + col + '" stroke="none"/>';
      } else if (dep.type === 'risk') {
        glyph.innerHTML = '<circle cx="5.5" cy="5.5" r="4.2"/><polyline points="5.5 3 5.5 5.5 7.3 6.5"/>';
      } else {
        glyph.innerHTML = '<polyline points="1.8 5.8 4.5 8.5 9 3"/>';
      }
      depG.appendChild(glyph);

      svg.appendChild(depG);
    });
  });
};

// ── Board focus mode: dim unrelated cards + labels ──
EAP.boardFocusChain = function(ids, activeDepIdx) {
  var board = document.querySelector('.content-area > div:first-child');
  if (!board) return;
  board.classList.add('board-has-focus');
  var idSet = {}; ids.forEach(function(id) { idSet[id] = true; });
  document.querySelectorAll('.bcard').forEach(function(card) {
    var cardId = card.id ? card.id.replace(/^[ft]card-/, '') : '';
    card.classList.toggle('board-dimmed', !idSet[cardId]);
  });
  // Dim other dep groups (paths, dots, midpoint icons)
  document.querySelectorAll('.board-dep-g').forEach(function(g) {
    var idx = parseInt(g.getAttribute('data-dep-idx'), 10);
    g.classList.toggle('board-dimmed', idx !== activeDepIdx);
  });
};

EAP.boardClearFocus = function() {
  var board = document.querySelector('.content-area > div:first-child');
  if (!board) return;
  board.classList.remove('board-has-focus');
  document.querySelectorAll('.board-dimmed').forEach(function(el) { el.classList.remove('board-dimmed'); });
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

  // Remove old count badge
  var oldBadge = document.querySelector('.search-count');
  if (oldBadge) oldBadge.remove();

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
      if (row.style.display === 'none') return;
      if (row.textContent.toLowerCase().indexOf(q) !== -1) {
        row.classList.add('search-hit');
        hits++;
      } else {
        row.classList.add('search-dim');
      }
    });
  }

  // Show result count badge
  var wrap = document.querySelector('.search-wrap');
  if (wrap && hits >= 0) {
    var badge = document.createElement('span');
    badge.className = 'search-count';
    badge.textContent = hits + (hits === 1 ? ' match' : ' matches');
    var mic = wrap.querySelector('.search-mic-btn');
    wrap.insertBefore(badge, mic || null);
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
      card.classList.add('bcard-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.id || '');
    });

    card.addEventListener('dragend', function() {
      card.classList.remove('bcard-dragging');
      dragging = null;
      dragSource = null;
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

      // Update column counts (find count badges in column headers)
      function updateColCount(colZone) {
        var col = colZone.closest('[style*="flex-direction:column"]') || colZone.parentElement;
        if (!col) return;
        var countEl = col.querySelector('[style*="font-mono"]');
        if (countEl) countEl.textContent = colZone.querySelectorAll('.bcard').length;
      }
      updateColCount(zone);
      if (dragSource) updateColCount(dragSource);
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
      rowMoved = true;
      var rect = row.getBoundingClientRect();
      var tbody = row.parentNode;
      if (e.clientY < rect.top + rect.height / 2) {
        tbody.insertBefore(rowDragging, row);
      } else {
        tbody.insertBefore(rowDragging, row.nextSibling);
      }
    });
  });
};

// ── Keyboard shortcut: / focuses search ───────────────
document.addEventListener('keydown', function(e) {
  if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
    var active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
    e.preventDefault();
    var si = document.querySelector('.chrome-search');
    if (si) si.focus();
  }
});

// ── Global tooltip (position:fixed — escapes overflow:auto clipping) ──
(function() {
  var tip = null, arrow = null;

  function ensure() {
    if (tip) return;
    tip = document.createElement('div');
    tip.id = 'eap-tip';
    document.body.appendChild(tip);
    arrow = document.createElement('div');
    arrow.id = 'eap-tip-arrow';
    document.body.appendChild(arrow);
  }

  function show(el) {
    ensure();
    var text = el.getAttribute('data-tip');
    if (!text) return;
    tip.textContent = text;
    tip.style.display = 'block';
    arrow.style.display = 'block';

    var r = el.getBoundingClientRect();
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var gap = 6;
    var arrowH = 5;

    var above = r.top - th - arrowH - gap >= 8;
    var tipLeft = Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, window.innerWidth - tw - 8));

    if (above) {
      tip.style.top  = (r.top - th - arrowH - gap) + 'px';
      tip.style.left = tipLeft + 'px';
      arrow.style.top  = (r.top - arrowH - gap) + 'px';
      arrow.style.left = (r.left + r.width / 2 - arrowH) + 'px';
      arrow.style.borderTopColor    = 'rgba(14,28,40,0.88)';
      arrow.style.borderBottomColor = 'transparent';
    } else {
      tip.style.top  = (r.bottom + arrowH + gap) + 'px';
      tip.style.left = tipLeft + 'px';
      arrow.style.top  = (r.bottom + gap) + 'px';
      arrow.style.left = (r.left + r.width / 2 - arrowH) + 'px';
      arrow.style.borderBottomColor = 'rgba(14,28,40,0.88)';
      arrow.style.borderTopColor    = 'transparent';
    }
  }

  function hide() {
    if (!tip) return;
    tip.style.display = 'none';
    arrow.style.display = 'none';
  }

  document.addEventListener('mouseover', function(e) {
    var el = e.target.closest('[data-tip]');
    if (el) show(el); else hide();
  });
  document.addEventListener('mouseout', function(e) {
    var el = e.target.closest('[data-tip]');
    if (el && !el.contains(e.relatedTarget)) hide();
  });
})();

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
