/* ═══════════════════════════════════════════════════════
   BOARD-DND.JS — Drag & drop, keyboard move, multi-select
   for the generic board (js/tabs/board.js). Independent of
   the OLD EAP.initBoardDrag() in interactions.js, which is
   now guarded off for the generic board (still used by
   track.js's sprint board — see interactions.js).
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

(function() {
  var dragIds = [];
  var dragOrigins = {};      // id -> { col, swim }
  var dragLane = null;
  var dropLine = null;
  var placeholder = null;

  function boardEl() { return document.getElementById('kbn-board'); }

  function clearDragVisuals() {
    if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    if (dropLine && dropLine.parentNode) dropLine.parentNode.removeChild(dropLine);
    placeholder = null;
    dropLine = null;
  }

  // ── Card drag ──────────────────────────────────────────
  function wireCards(board, level, cfg, colField, swimField) {
    board.querySelectorAll('.bcard[data-board-card]').forEach(function(card) {
      card.setAttribute('draggable', 'true');

      card.addEventListener('dragstart', function(e) {
        var id = card.getAttribute('data-item-id');
        var sel = EAP.state.boardSelection || {};
        var selectedIds = Object.keys(sel).filter(function(k) { return sel[k]; });
        dragIds = (EAP.state.boardMultiSelect && sel[id] && selectedIds.length > 1) ? selectedIds : [id];

        dragOrigins = {};
        dragIds.forEach(function(iid) {
          var item = EAP.findBoardItem(level, iid);
          if (!item) return;
          dragOrigins[iid] = {
            col: colField.get(item),
            swim: swimField ? swimField.get(item) : null
          };
        });

        card.classList.add('bcard-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);

        placeholder = document.createElement('div');
        placeholder.className = 'kbn-placeholder';
        placeholder.style.height = card.offsetHeight + 'px';
        card.parentNode.insertBefore(placeholder, card.nextSibling);

        if (dragIds.length > 1) {
          var badge = document.createElement('span');
          badge.className = 'kbn-drag-badge';
          badge.textContent = dragIds.length;
          card.appendChild(badge);
        }
      });

      card.addEventListener('dragend', function() {
        card.classList.remove('bcard-dragging');
        var badge = card.querySelector('.kbn-drag-badge');
        if (badge) badge.parentNode.removeChild(badge);
        clearDragVisuals();
        board.querySelectorAll('.kbn-drop-highlight').forEach(function(z) { z.classList.remove('kbn-drop-highlight'); });
      });
    });

    board.querySelectorAll('[data-drop-column]').forEach(function(zone) {
      zone.addEventListener('dragover', function(e) {
        if (!dragIds.length) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('kbn-drop-highlight');
        if (!dropLine) { dropLine = document.createElement('div'); dropLine.className = 'kbn-drop-line'; }
        var cards = Array.prototype.slice.call(zone.querySelectorAll('.bcard:not(.bcard-dragging)'));
        var before = null;
        for (var i = 0; i < cards.length; i++) {
          var r = cards[i].getBoundingClientRect();
          if (e.clientY < r.top + r.height / 2) { before = cards[i]; break; }
        }
        if (before) zone.insertBefore(dropLine, before); else zone.appendChild(dropLine);
      });

      zone.addEventListener('dragleave', function(e) {
        if (!zone.contains(e.relatedTarget)) zone.classList.remove('kbn-drop-highlight');
      });

      zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('kbn-drop-highlight');
        if (!dragIds.length) return;

        var toCol = zone.getAttribute('data-drop-column');
        var laneEl = zone.closest('[data-swimlane-value]');
        var toSwim = (swimField && laneEl) ? laneEl.getAttribute('data-swimlane-value') : null;

        var moved = [], blocked = [];
        dragIds.forEach(function(id) {
          var item = EAP.findBoardItem(level, id);
          if (!item) return;
          var check = EAP.validateCardMove(item, level, colField.key, dragOrigins[id] ? dragOrigins[id].col : colField.get(item), toCol);
          if (!check.ok) { blocked.push(item); return; }
          EAP.applyCardMove(item, level, colField.key, toCol);
          if (swimField && toSwim !== null) EAP.applyCardMove(item, level, swimField.key, toSwim);
          moved.push(item);
        });

        var origins = dragOrigins;
        clearDragVisuals();
        dragIds = [];
        EAP.render();

        setTimeout(function() {
          var el = moved[0] && document.getElementById('fcard-' + moved[0].id);
          if (el) {
            el.classList.add('kbn-card-dropped');
            setTimeout(function() { el.classList.remove('kbn-card-dropped'); }, 400);
          }
          if (moved.length) {
            var label = colField.valueLabel ? colField.valueLabel(toCol) : toCol;
            var msg = moved.length === 1 ? (moved[0].name + ' moved to ' + label) : (moved.length + ' card' + (moved.length > 1 ? 's' : '') + ' moved to ' + label);
            EAP.toast({
              icon: 'check-circle', message: msg,
              action: { label: 'Undo', run: function() {
                moved.forEach(function(item) {
                  var o = origins[item.id];
                  if (!o) return;
                  EAP.applyCardMove(item, level, colField.key, o.col);
                  if (swimField && o.swim !== null) EAP.applyCardMove(item, level, swimField.key, o.swim);
                });
                EAP.render();
              } }
            });
          } else if (blocked.length) {
            EAP.toast({ icon: 'alert-triangle', message: blocked[0].name + ' could not be moved. This transition isn\'t allowed.' });
          }
        }, 30);
      });
    });
  }

  // ── Column header drag-to-reorder (persists globally via cfg.columnOrder) ──
  function wireColumnReorder(board, level, cfg) {
    var dragCol = null;
    board.querySelectorAll('[data-col-header]').forEach(function(hd) {
      hd.addEventListener('dragstart', function(e) {
        e.stopPropagation();
        dragCol = hd.closest('.kbn-col');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'col');
        dragCol.classList.add('kbn-col-dragging');
      });
      hd.addEventListener('dragend', function() {
        if (dragCol) dragCol.classList.remove('kbn-col-dragging');
        dragCol = null;
      });
      hd.addEventListener('dragover', function(e) {
        if (!dragCol) return;
        var col = hd.closest('.kbn-col');
        if (!col || col === dragCol) return;
        e.preventDefault();
        var r = col.getBoundingClientRect();
        var parent = col.parentNode;
        if (e.clientX < r.left + r.width / 2) parent.insertBefore(dragCol, col); else parent.insertBefore(dragCol, col.nextSibling);
      });
      hd.addEventListener('drop', function(e) {
        if (!dragCol) return;
        e.preventDefault();
        e.stopPropagation();
        var colset = dragCol.closest('.kbn-colset');
        var newOrder = Array.prototype.map.call(colset.querySelectorAll('.kbn-col'), function(el) { return el.getAttribute('data-column-value'); });
        cfg.columnOrder = newOrder;
        EAP.render();
        EAP.toast({ icon: 'check-circle', message: 'Column order updated' });
      });
    });
  }

  // ── Swimlane drag-to-reorder + collapse ─────────────────
  function wireLanes(board, level, cfg) {
    var dragLaneEl = null;
    board.querySelectorAll('.kbn-lane').forEach(function(lane) {
      lane.addEventListener('dragstart', function(e) {
        if (e.target.closest('.bcard') || e.target.closest('[data-col-header]')) return;
        dragLaneEl = lane;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'lane');
        lane.classList.add('kbn-lane-dragging');
      });
      lane.addEventListener('dragend', function() {
        lane.classList.remove('kbn-lane-dragging');
        dragLaneEl = null;
      });
      lane.addEventListener('dragover', function(e) {
        if (!dragLaneEl || dragLaneEl === lane) return;
        e.preventDefault();
        var r = lane.getBoundingClientRect();
        var parent = lane.parentNode;
        if (e.clientY < r.top + r.height / 2) parent.insertBefore(dragLaneEl, lane); else parent.insertBefore(dragLaneEl, lane.nextSibling);
      });
      lane.addEventListener('drop', function(e) {
        if (!dragLaneEl) return;
        e.preventDefault();
        var parent = lane.parentNode;
        var newOrder = Array.prototype.map.call(parent.querySelectorAll('[data-swimlane-value]'), function(el) { return el.getAttribute('data-swimlane-value'); });
        cfg.swimlaneOrder = newOrder;
        EAP.render();
        EAP.toast({ icon: 'check-circle', message: 'Swimlane order updated' });
      });
    });

    board.querySelectorAll('[data-lane-toggle]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var v = btn.getAttribute('data-lane-toggle');
        cfg.swimlaneCollapsed[v] = !cfg.swimlaneCollapsed[v];
        cfg.allCollapsed = false;
        EAP.render();
      });
    });
  }

  EAP.toggleAllSwimlanes = function() {
    var cfg = EAP.getBoardCfg(EAP.state.level);
    cfg.allCollapsed = !cfg.allCollapsed;
    if (!cfg.allCollapsed) cfg.swimlaneCollapsed = {};
    EAP.render();
  };

  // ── Multi-select checkboxes ─────────────────────────────
  function wireSelection(board) {
    board.querySelectorAll('[data-select-id]').forEach(function(chk) {
      chk.addEventListener('change', function() {
        EAP.state.boardSelection = EAP.state.boardSelection || {};
        EAP.state.boardSelection[chk.getAttribute('data-select-id')] = chk.checked;
        EAP.render();
      });
    });
  }

  EAP.toggleMultiSelect = function() {
    EAP.state.boardMultiSelect = !EAP.state.boardMultiSelect;
    if (!EAP.state.boardMultiSelect) EAP.state.boardSelection = {};
    EAP.render();
  };

  EAP.clearBoardSelection = function() {
    EAP.state.boardSelection = {};
    EAP.render();
  };

  /* ═══════════════════════════════════════════════════════
     KEYBOARD MOVE MODAL — screen-reader-friendly equivalent
     of drag-and-drop. Column + (optional) Swimlane pickers,
     then an ordered list of the destination's cards where
     Up/Down (or the on-screen buttons) repositions the
     grabbed item — same mental model as native DnD reorder.
     ═══════════════════════════════════════════════════════ */
  var moveState = null;

  function closeMoveModal() {
    var c = document.getElementById('kbn-move-container');
    if (c) c.parentNode.removeChild(c);
    moveState = null;
  }

  function renderMoveModal(itemIds, level) {
    var cfg = EAP.getBoardCfg(level);
    var colField = EAP.boardFieldDef(level, cfg.columnField);
    var swimField = cfg.swimlaneField !== 'none' ? EAP.boardFieldDef(level, cfg.swimlaneField) : null;
    var items = itemIds.map(function(id) { return EAP.findBoardItem(level, id); }).filter(Boolean);
    if (!items.length) return;

    var title = items.length === 1 ? ('Move card ' + items[0].name) : ('Move cards (' + items.length + ')');
    moveState = { level: level, itemIds: itemIds, colField: colField, swimField: swimField, col: null, swim: null, order: [] };

    var colOptions = EAP.groupByField(EAP.getBoardItems(level), colField).order;
    var swimOptions = swimField ? EAP.groupByField(EAP.getBoardItems(level), swimField).order : [];

    var h = '<div class="kbn-modal-overlay" id="kbn-move-overlay"></div>';
    h += '<div class="kbn-modal" id="kbn-move-modal" role="dialog" aria-modal="true" aria-label="' + title + '">';
    h += '<div class="kbn-modal-hd"><span>' + title + '</span><button class="kbn-modal-close" id="kbn-move-close" aria-label="Close">' + EAP.icon('x', 16) + '</button></div>';
    h += '<div class="kbn-modal-body">';
    h += '<div class="kbn-move-row"><label>' + colField.label + '</label><select id="kbn-move-col"><option value="">Select</option>' +
      colOptions.map(function(v) { return '<option value="' + v + '">' + (colField.valueLabel ? colField.valueLabel(v) : v) + '</option>'; }).join('') + '</select></div>';
    if (swimField) {
      h += '<div class="kbn-move-row"><label>' + swimField.label + '</label><select id="kbn-move-swim"><option value="">Select</option>' +
        swimOptions.map(function(v) { return '<option value="' + v + '">' + (swimField.valueLabel ? swimField.valueLabel(v) : v) + '</option>'; }).join('') + '</select></div>';
    }
    h += '<div class="kbn-move-order-label">Set order</div>';
    h += '<div class="kbn-move-order" id="kbn-move-order"><div class="kbn-move-empty">Select ' + (swimField ? 'a column and swimlane' : 'a column') + '</div></div>';
    h += '<p class="kbn-move-hint">Focus an item, then use the ↑ / ↓ buttons to reorder</p>';
    h += '</div>';
    h += '<div class="kbn-modal-ft"><button class="kbn-btn-ghost" id="kbn-move-cancel">Cancel</button><button class="kbn-btn-primary" id="kbn-move-save" disabled>Save</button></div>';
    h += '</div>';

    var container = document.createElement('div');
    container.id = 'kbn-move-container';
    container.innerHTML = h;
    document.body.appendChild(container);

    document.getElementById('kbn-move-overlay').addEventListener('click', closeMoveModal);
    document.getElementById('kbn-move-close').addEventListener('click', closeMoveModal);
    document.getElementById('kbn-move-cancel').addEventListener('click', closeMoveModal);

    function refreshOrderList() {
      var wrap = document.getElementById('kbn-move-order');
      var saveBtn = document.getElementById('kbn-move-save');
      if (!moveState.col) { wrap.innerHTML = '<div class="kbn-move-empty">Select ' + (swimField ? 'a column and swimlane' : 'a column') + '</div>'; saveBtn.disabled = true; return; }
      var pool = EAP.getBoardItems(level).filter(function(it) {
        if (colField.get(it) !== moveState.col) return false;
        if (swimField && moveState.swim && swimField.get(it) !== moveState.swim) return false;
        return true;
      });
      var movingSet = {}; items.forEach(function(it) { movingSet[it.id] = true; });
      pool = pool.filter(function(it) { return !movingSet[it.id]; });
      moveState.order = items.concat(pool); // moved items land first, matching "grabbed item" position
      renderOrderRows();
      saveBtn.disabled = false;
    }

    function renderOrderRows() {
      var wrap = document.getElementById('kbn-move-order');
      if (!moveState.order.length) { wrap.innerHTML = '<div class="kbn-move-empty">This column is empty. Card will be placed first.</div>'; return; }
      wrap.innerHTML = moveState.order.map(function(it, idx) {
        var isMoving = moveState.itemIds.indexOf(it.id) !== -1;
        return '<div class="kbn-move-item' + (isMoving ? ' kbn-move-item-selected' : '') + '" data-order-idx="' + idx + '" tabindex="0">' +
          '<span class="kbn-move-item-name">' + it.name + '</span>' +
          (isMoving ? '<span class="kbn-move-item-controls"><button data-order-up="' + idx + '" aria-label="Move up">' + EAP.icon('chevron-up', 13) + '</button><button data-order-down="' + idx + '" aria-label="Move down">' + EAP.icon('chevron-down', 13) + '</button></span>' : '') +
          '</div>';
      }).join('');
      wrap.querySelectorAll('[data-order-up]').forEach(function(b) {
        b.addEventListener('click', function() { swapOrder(parseInt(b.getAttribute('data-order-up'), 10), -1); });
      });
      wrap.querySelectorAll('[data-order-down]').forEach(function(b) {
        b.addEventListener('click', function() { swapOrder(parseInt(b.getAttribute('data-order-down'), 10), 1); });
      });
      wrap.querySelectorAll('.kbn-move-item').forEach(function(row) {
        row.addEventListener('keydown', function(e) {
          var idx = parseInt(row.getAttribute('data-order-idx'), 10);
          if (e.key === 'ArrowUp') { e.preventDefault(); swapOrder(idx, -1); }
          if (e.key === 'ArrowDown') { e.preventDefault(); swapOrder(idx, 1); }
        });
      });
    }

    function swapOrder(idx, dir) {
      var to = idx + dir;
      if (to < 0 || to >= moveState.order.length) return;
      var tmp = moveState.order[idx];
      moveState.order[idx] = moveState.order[to];
      moveState.order[to] = tmp;
      renderOrderRows();
      var el = document.querySelector('[data-order-idx="' + to + '"]');
      if (el) el.focus();
    }

    document.getElementById('kbn-move-col').addEventListener('change', function() { moveState.col = this.value || null; refreshOrderList(); });
    if (swimField) document.getElementById('kbn-move-swim').addEventListener('change', function() { moveState.swim = this.value || null; refreshOrderList(); });

    document.getElementById('kbn-move-save').addEventListener('click', function() {
      if (!moveState.col) return;
      items.forEach(function(item) {
        EAP.applyCardMove(item, level, colField.key, moveState.col);
        if (swimField && moveState.swim) EAP.applyCardMove(item, level, swimField.key, moveState.swim);
      });
      closeMoveModal();
      EAP.render();
      var label = colField.valueLabel ? colField.valueLabel(moveState.col) : moveState.col;
      EAP.toast({ icon: 'check-circle', message: items.length === 1 ? (items[0].name + ' moved to ' + label) : (items.length + ' cards moved to ' + label) });
    });
  }

  function wireMoveButtons(board, level) {
    board.querySelectorAll('.bcard-footer-kebab[data-move-id]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-move-id');
        var sel = EAP.state.boardSelection || {};
        var selectedIds = Object.keys(sel).filter(function(k) { return sel[k]; });
        var ids = (EAP.state.boardMultiSelect && sel[id] && selectedIds.length > 1) ? selectedIds : [id];
        renderMoveModal(ids, level);
      });
    });
  }

  // Called by the toolbar's "Move" action on the multi-select bar.
  EAP.openMoveModalForSelection = function() {
    var sel = EAP.state.boardSelection || {};
    var ids = Object.keys(sel).filter(function(k) { return sel[k]; });
    if (ids.length) renderMoveModal(ids, EAP.state.level);
  };

  // ── Entry point, called from the post-render hook ───────
  EAP.initGenericBoard = function() {
    var board = boardEl();
    if (!board) return;
    var level = EAP.state.level;
    var cfg = EAP.getBoardCfg(level);
    var colField = EAP.boardFieldDef(level, cfg.columnField);
    var swimField = cfg.swimlaneField !== 'none' ? EAP.boardFieldDef(level, cfg.swimlaneField) : null;

    wireCards(board, level, cfg, colField, swimField);
    wireColumnReorder(board, level, cfg);
    if (swimField) wireLanes(board, level, cfg);
    wireSelection(board);
    wireMoveButtons(board, level);
  };
})();
