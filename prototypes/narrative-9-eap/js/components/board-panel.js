/* ═══════════════════════════════════════════════════════
   BOARD-PANEL.JS — Editable, non-modal card drawer for the
   generic board. Deliberately separate from EAP.openDetail
   (js/components/detail-panel.js), which is shared across
   13 other call sites (timeline, insights, etc.) and stays
   untouched — see project_narrative9_kanban_conform memory.

   Behavior ported from the platform spec:
     - Non-modal: board stays visible/interactive behind it.
     - Persistent selection border on the source card while
       open, surviving scroll, cleared only on close.
     - Two-axis scroll-into-view + "phantom gutter" so a card
       that would sit behind the drawer can still be scrolled
       into the unobstructed region.
     - Dirty-state tracking; closing (X, Escape, or switching
       to a different card) with unsaved edits routes through
       a "Discard changes?" confirm every time.
   Simplification: Name is read-only. Other code keys off
   item.name as an identity (dependency labels, the Feature
   PR-rollup match in board.js) — renaming here would silently
   break those elsewhere, so it's out of scope for this pass.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

(function() {
  var openItemId = null;
  var openLevel = null;
  var original = null;   // snapshot of field values at open, for dirty check
  var pending = null;     // in-progress edited values
  var pendingSwitchId = null;
  var phantomEls = [];

  function isDirty() {
    if (!original || !pending) return false;
    for (var k in original) if (original[k] !== pending[k]) return true;
    return false;
  }

  function clearPhantomGutters() {
    phantomEls.forEach(function(el) { if (el.parentNode) el.parentNode.removeChild(el); });
    phantomEls = [];
  }

  // Two-axis scroll-into-view with a temporary phantom gutter when the
  // board doesn't have enough natural scroll room to clear the drawer.
  function scrollCardIntoView(cardEl) {
    var board = document.getElementById('kbn-board');
    if (!board || !cardEl) return;
    var drawer = document.getElementById('kbn-panel-drawer');
    var drawerWidth = drawer ? drawer.getBoundingClientRect().width : 420;
    var viewportRight = window.innerWidth - drawerWidth - 16;

    var rect = cardEl.getBoundingClientRect();
    if (rect.right > viewportRight) {
      var deficit = (board.scrollLeft + rect.right - viewportRight) - (board.scrollWidth - board.clientWidth);
      if (deficit > 0) {
        // Must extend the actual horizontal flex row (the card's column
        // set), not #kbn-board itself — #kbn-board is a plain block
        // container, so an appended child there stacks vertically and
        // never widens its scrollWidth.
        var row = cardEl.closest('.kbn-colset');
        if (row) {
          var gutter = document.createElement('div');
          gutter.className = 'kbn-phantom-gutter-x';
          gutter.style.width = Math.ceil(deficit) + 'px';
          row.appendChild(gutter);
          phantomEls.push(gutter);
        }
      }
      board.scrollTo({ left: board.scrollLeft + (rect.right - viewportRight), behavior: 'smooth' });
    }

    // Vertical: #content-area is overflow:hidden (a flex row, can't
    // scroll at all) — #kbn-board is the one real scroll container for
    // both axes, same as the rest of this app's board/grid views.
    var boardRect = board.getBoundingClientRect();
    rect = cardEl.getBoundingClientRect(); // re-read after any horizontal scrollTo above
    if (rect.bottom > boardRect.bottom - 8) {
      var vDeficit = (board.scrollTop + rect.bottom - (boardRect.bottom - 8)) - (board.scrollHeight - board.clientHeight);
      if (vDeficit > 0) {
        var gutterY = document.createElement('div');
        gutterY.className = 'kbn-phantom-gutter-y';
        gutterY.style.height = Math.ceil(vDeficit) + 'px';
        board.appendChild(gutterY);
        phantomEls.push(gutterY);
      }
      board.scrollTo({ top: board.scrollTop + (rect.bottom - (boardRect.bottom - 8)), behavior: 'smooth' });
    }
  }

  function applySelectedBorder() {
    document.querySelectorAll('.bcard-panel-selected').forEach(function(el) { el.classList.remove('bcard-panel-selected'); });
    if (openItemId) {
      var el = document.getElementById('fcard-' + openItemId);
      if (el) el.classList.add('bcard-panel-selected');
    }
  }
  EAP.reapplyBoardPanelSelection = applySelectedBorder;

  // All board field defs are editable here (State/Owner/Team/PI/Sprint/
  // Size/ART/Goal, depending on level) — pts is a free scalar, appended
  // separately below since it isn't a grouping field.
  function editableFieldsFor(level, item) {
    return EAP.boardFieldDefs(level);
  }

  function buildForm(level, item) {
    var defs = editableFieldsFor(level, item);
    var h = '';
    defs.forEach(function(fd) {
      var current = fd.get(item);
      var options = EAP.groupByField(EAP.getBoardItems(level), fd).order;
      h += '<div class="kbn-panel-field"><label>' + fd.label + '</label><select data-panel-field="' + fd.key + '">' +
        options.map(function(v) { return '<option value="' + v + '"' + (v === current ? ' selected' : '') + '>' + (fd.valueLabel ? fd.valueLabel(v) : v) + '</option>'; }).join('') +
        '</select></div>';
    });
    if ('pts' in item || item.pts === 0) {
      h += '<div class="kbn-panel-field"><label>Points</label><input type="number" min="0" data-panel-field="pts" value="' + (item.pts || 0) + '"></div>';
    }
    return h;
  }

  function snapshotValues(level, item) {
    var defs = editableFieldsFor(level, item);
    var snap = {};
    defs.forEach(function(fd) { snap[fd.key] = fd.get(item); });
    if ('pts' in item || item.pts === 0) snap.pts = item.pts || 0;
    return snap;
  }

  function renderPanel(level, item) {
    var isBlocked = item.blocked || item.state === 'Blocked';
    var hasDep = EAP.hasDependency(item.id);

    var h = '<div class="kbn-panel-drawer" id="kbn-panel-drawer" role="dialog" aria-label="' + item.name + '">';
    h += '<div class="kbn-panel-hd"><div class="kbn-panel-hd-title">' + item.name + '</div><button class="kbn-modal-close" id="kbn-panel-close" aria-label="Close">' + EAP.icon('x', 16) + '</button></div>';
    h += '<div class="kbn-panel-body">';
    if (item.num) h += '<div class="kbn-panel-meta">' + item.num + '</div>';
    if (isBlocked) h += '<div class="bcard-banner bcard-banner-red" style="margin:0 0 12px;">' + EAP.icon('info', 12) + (item.blockReason || 'Blocked') + '</div>';
    if (hasDep) h += '<div class="kbn-panel-dep-note">' + EAP.icon('git-merge', 13) + ' Has dependencies</div>';
    h += '<div class="kbn-panel-form" id="kbn-panel-form">' + buildForm(level, item) + '</div>';
    h += '</div>';
    h += '<div class="kbn-panel-ft"><button class="kbn-btn-ghost" id="kbn-panel-cancel">Cancel</button><button class="kbn-btn-primary" id="kbn-panel-update" disabled>Update</button></div>';
    h += '</div>';
    return h;
  }

  function readPending() {
    pending = {};
    document.querySelectorAll('#kbn-panel-form [data-panel-field]').forEach(function(el) {
      var k = el.getAttribute('data-panel-field');
      pending[k] = k === 'pts' ? parseInt(el.value, 10) || 0 : el.value;
    });
    var btn = document.getElementById('kbn-panel-update');
    if (btn) btn.disabled = !isDirty();
  }

  function closePanel() {
    clearPhantomGutters();
    document.querySelectorAll('.bcard-panel-selected').forEach(function(el) { el.classList.remove('bcard-panel-selected'); });
    var c = document.getElementById('kbn-panel-container');
    if (c) c.parentNode.removeChild(c);
    openItemId = null; openLevel = null; original = null; pending = null; pendingSwitchId = null;
  }

  function closeDiscardModal() {
    var c = document.getElementById('kbn-discard-container');
    if (c) c.parentNode.removeChild(c);
  }

  function openDiscardConfirm(onDiscard) {
    var h = '<div class="kbn-modal-overlay" id="kbn-discard-overlay"></div>';
    h += '<div class="kbn-modal kbn-modal-sm" role="alertdialog" aria-label="Discard changes?">';
    h += '<div class="kbn-modal-hd"><span>Discard changes?</span><button class="kbn-modal-close" id="kbn-discard-close" aria-label="Close">' + EAP.icon('x', 16) + '</button></div>';
    h += '<div class="kbn-modal-body"><p>Your edits to this card have not been saved and will be lost.</p></div>';
    h += '<div class="kbn-modal-ft"><button class="kbn-btn-ghost" id="kbn-discard-keep">Keep editing</button><button class="kbn-btn-danger" id="kbn-discard-confirm">Discard</button></div>';
    h += '</div>';
    var container = document.createElement('div');
    container.id = 'kbn-discard-container';
    container.innerHTML = h;
    document.body.appendChild(container);
    document.getElementById('kbn-discard-overlay').addEventListener('click', closeDiscardModal);
    document.getElementById('kbn-discard-close').addEventListener('click', closeDiscardModal);
    document.getElementById('kbn-discard-keep').addEventListener('click', closeDiscardModal);
    document.getElementById('kbn-discard-confirm').addEventListener('click', function() {
      closeDiscardModal();
      onDiscard();
    });
  }

  function requestClose() {
    if (isDirty()) {
      openDiscardConfirm(function() { closePanel(); });
    } else {
      closePanel();
    }
  }

  function requestSwitch(newId) {
    if (isDirty()) {
      pendingSwitchId = newId;
      openDiscardConfirm(function() {
        var toOpen = pendingSwitchId;
        closePanel();
        EAP.openBoardCardPanel(toOpen);
      });
    } else {
      closePanel();
      EAP.openBoardCardPanel(newId);
    }
  }

  function wirePanel(level, item) {
    document.getElementById('kbn-panel-close').addEventListener('click', requestClose);
    document.getElementById('kbn-panel-cancel').addEventListener('click', requestClose);
    document.querySelectorAll('#kbn-panel-form [data-panel-field]').forEach(function(el) {
      el.addEventListener('change', readPending);
      el.addEventListener('input', readPending);
    });
    document.getElementById('kbn-panel-update').addEventListener('click', function() {
      if (!isDirty()) return;
      var defs = editableFieldsFor(level, item);
      defs.forEach(function(fd) {
        if (pending[fd.key] !== undefined && pending[fd.key] !== original[fd.key]) {
          EAP.applyCardMove(item, level, fd.key, pending[fd.key]);
        }
      });
      if (pending.pts !== undefined) item.pts = pending.pts;
      closePanel();
      EAP.render();
      EAP.toast({ icon: 'check-circle', message: item.name + ' updated' });
    });
  }

  EAP.openBoardCardPanel = function(itemId) {
    var level = EAP.state.level;
    var item = EAP.findBoardItem(level, itemId);
    if (!item) return;

    if (openItemId && openItemId !== itemId) { requestSwitch(itemId); return; }
    if (openItemId === itemId) return;

    openItemId = itemId;
    openLevel = level;
    original = snapshotValues(level, item);
    pending = snapshotValues(level, item);

    var container = document.createElement('div');
    container.id = 'kbn-panel-container';
    container.innerHTML = renderPanel(level, item);
    document.body.appendChild(container);
    requestAnimationFrame(function() { document.getElementById('kbn-panel-drawer').classList.add('open'); });
    wirePanel(level, item);
    applySelectedBorder();

    var cardEl = document.getElementById('fcard-' + itemId);
    if (cardEl) setTimeout(function() { scrollCardIntoView(cardEl); }, 60);
  };

  EAP.isBoardCardPanelOpen = function() { return !!openItemId; };

  // Delegated click — opens the panel from any generic board card.
  document.addEventListener('click', function(e) {
    var card = e.target.closest('[data-board-card]');
    if (!card) return;
    if (e.target.closest('.bcard-check') || e.target.closest('.bcard-footer-kebab')) return;
    EAP.openBoardCardPanel(card.getAttribute('data-item-id'));
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && openItemId) requestClose();
  });
})();
