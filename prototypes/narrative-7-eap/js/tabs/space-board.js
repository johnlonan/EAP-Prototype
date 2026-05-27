/* ═══════════════════════════════════════════════════════
   SPACE-BOARD.JS — Kanban board renderer for Space context
   Used by: Retrospective space (sp1), Meeting Notes actions board (sp3)
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

EAP.renderSpaceBoard = function() {
  var s = EAP.state;
  var sp = s.spaceData;
  if (!sp || !sp.board) return '<div style="padding:40px;color:#9CA3AF;font-size:13px;">No board data.</div>';

  var board = sp.board;
  var cols = board.columns || [];

  // Column width: fit evenly up to 4 cols
  var colMinWidth = 220;

  var html =
    '<div style="' +
      'display:flex;flex-direction:column;height:100%;' +
      'background:#F1F0ED;' +
    '">' +

    // Space header
    '<div style="' +
      'padding:16px 20px 0;' +
      'display:flex;align-items:center;gap:10px;' +
    '">' +
      '<span style="font-size:13px;font-weight:600;color:#111111;">' + sp.name + '</span>' +
      '<span style="font-size:11px;color:#797874;">&mdash;</span>' +
      '<span style="font-size:12px;color:#797874;">' + cols.length + ' columns &middot; ' +
        cols.reduce(function(n,c){ return n + (c.cards||[]).length; },0) + ' cards' +
      '</span>' +
    '</div>' +

    // Board columns
    '<div style="' +
      'flex:1;overflow-x:auto;overflow-y:hidden;' +
      'display:flex;gap:12px;' +
      'padding:16px 20px 20px;' +
      'align-items:flex-start;' +
    '">';

  cols.forEach(function(col) {
    var cards = col.cards || [];
    html +=
      '<div style="' +
        'flex:1;min-width:' + colMinWidth + 'px;max-width:320px;' +
        'display:flex;flex-direction:column;gap:8px;' +
      '">' +

      // Column header
      '<div style="' +
        'display:flex;align-items:center;gap:8px;' +
        'padding:8px 12px;' +
        'background:#FFFFFF;' +
        'border-radius:10px;' +
        'border-left:3px solid ' + col.color + ';' +
        'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
      '">' +
        '<span style="font-size:11px;font-weight:600;color:#111111;flex:1;">' + col.label + '</span>' +
        '<span style="' +
          'font-size:10px;font-weight:600;' +
          'background:rgba(0,0,0,0.06);color:#797874;' +
          'padding:1px 6px;border-radius:9px;' +
        '">' + cards.length + '</span>' +
      '</div>' +

      // Cards
      '<div style="display:flex;flex-direction:column;gap:8px;">';

    cards.forEach(function(card) {
      var person = EAP.people && EAP.people[card.author];
      var initials = person ? person.initials : (card.author || '?').substring(0,2).toUpperCase();
      var color = person ? person.color : '#6B7280';

      html +=
        '<div style="' +
          'background:#FFFFFF;' +
          'border-radius:10px;' +
          'padding:12px 14px;' +
          'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
          'cursor:default;' +
          'transition:box-shadow 150ms ease;' +
        '" ' +
        'onmouseenter="this.style.boxShadow=\'0 3px 10px rgba(0,0,0,0.10)\'" ' +
        'onmouseleave="this.style.boxShadow=\'0 1px 3px rgba(0,0,0,0.05)\'">' +

        '<p style="' +
          'font-size:12px;color:#111111;line-height:1.5;' +
          'margin:0 0 10px;' +
        '">' + card.text + '</p>' +

        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="' +
            'width:20px;height:20px;border-radius:50%;' +
            'background:' + color + ';' +
            'color:#fff;font-size:9px;font-weight:600;' +
            'display:inline-flex;align-items:center;justify-content:center;' +
            'flex-shrink:0;' +
          '">' + initials + '</span>' +
          '<span style="font-size:11px;color:#797874;">' + (person ? person.name.split(' ')[0] : card.author) + '</span>' +
        '</div>' +

        '</div>';
    });

    // Empty state per column
    if (cards.length === 0) {
      html +=
        '<div style="' +
          'border:1px dashed #CCCBC8;border-radius:10px;' +
          'padding:20px;text-align:center;' +
          'color:#BBBBB7;font-size:11px;' +
        '">No cards</div>';
    }

    html += '</div></div>'; // end cards + column
  });

  html += '</div></div>'; // end board + outer
  return html;
};
