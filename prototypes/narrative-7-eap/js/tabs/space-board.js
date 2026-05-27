/* ═══════════════════════════════════════════════════════
   SPACE-BOARD.JS — Kanban board renderer for Space context
   Uses identical column + card styling as board.js/.bcard
   Used by: Retrospective (sp1), Meeting Notes actions (sp3 board tab)
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

EAP.renderSpaceBoard = function() {
  var s = EAP.state;
  var sp = s.spaceData;
  if (!sp || !sp.board) return '<div style="padding:40px;color:#9CA3AF;font-size:13px;">No board data.</div>';

  var board = sp.board;
  var cols  = board.columns || [];
  var totalCards = cols.reduce(function(n, c) { return n + (c.cards || []).length; }, 0);

  // Column header style — identical to board.js colHd()
  function colHd() {
    return 'padding:8px 12px;border-radius:12px 12px 0 0;' +
      'display:flex;align-items:center;justify-content:space-between;' +
      'height:42px;box-sizing:border-box;' +
      'border-width:1px 1px 2px 1px;border-style:solid;overflow:hidden;' +
      'background:#FFFFFF;border-color:#E3E2DF;color:#000000;' +
      'box-shadow:0 8px 12px rgba(56,56,56,0.10);';
  }

  // Column body style — identical to EAP._colBodyStyle
  var CB = 'background:#F8F9FA;border:1px solid #E3E2DF;border-top:none;' +
    'border-radius:0 0 12px 12px;padding:8px;min-height:100px;flex:1;' +
    'box-shadow:0 4px 6px -1px rgba(0,0,0,0.10),0 2px 4px -1px rgba(0,0,0,0.06);' +
    'overflow-y:auto;';

  var html =
    // Outer: fills content-area (flex:1, min-height:0 from parent)
    '<div style="display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;">' +

    // Sub-header bar — grounding info + card count
    '<div style="' +
      'display:flex;align-items:center;gap:12px;' +
      'padding:0 16px 10px;flex-shrink:0;' +
    '">' +
      '<span style="font-size:12px;font-weight:600;color:#111111;">' + sp.name + '</span>' +
      '<span style="font-size:11px;color:#CCCBC8;">|</span>' +
      '<span style="font-size:11px;color:#797874;">' + cols.length + ' columns</span>' +
      '<span style="font-size:11px;color:#CCCBC8;">·</span>' +
      '<span style="font-size:11px;color:#797874;">' + totalCards + ' cards</span>' +
      // Column card counts as mini pills
      '<div style="display:flex;gap:6px;margin-left:4px;">' +
        cols.map(function(col) {
          return '<span style="' +
            'display:inline-flex;align-items:center;gap:4px;' +
            'font-size:10px;padding:1px 7px;border-radius:9px;' +
            'background:rgba(0,0,0,0.05);color:#585753;' +
          '">' +
            '<span style="width:6px;height:6px;border-radius:50%;background:' + col.color + ';flex-shrink:0;"></span>' +
            col.label + ' ' + (col.cards || []).length +
          '</span>';
        }).join('') +
      '</div>' +
    '</div>' +

    // Board columns — scrollable horizontally, fill remaining height
    '<div style="' +
      'flex:1;min-height:0;overflow-x:auto;' +
      'display:flex;gap:10px;' +
      'padding:0 16px 16px;' +
      'align-items:stretch;' +
    '">';

  cols.forEach(function(col) {
    var cards = col.cards || [];

    html +=
      '<div style="flex:1;min-width:200px;max-width:340px;display:flex;flex-direction:column;">' +

      // Column header — left colour accent on the bottom border
      '<div style="' + colHd() + 'border-bottom-color:' + col.color + '!important;">' +
        '<span style="font-size:12px;font-weight:500;color:#111111;">' + col.label + '</span>' +
        '<span class="kbn-badge">' + cards.length + '</span>' +
      '</div>' +

      // Column body
      '<div style="' + CB + '">';

    cards.forEach(function(card) {
      var person = EAP.people && EAP.people[card.author];
      var initials = person ? person.initials : (card.author || '').substring(0, 2).toUpperCase();
      var avColor  = person ? person.color : '#6B7280';
      var firstName = person ? person.name.split(' ')[0] : card.author;

      // bcard-compact adds padding-bottom:12px — base .bcard has padding-bottom:0
      html +=
        '<div class="bcard bcard-compact">' +
        '<p class="bcard-title" style="font-size:12px;font-weight:400;line-height:1.5;margin-bottom:8px;">' +
          card.text +
        '</p>' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="' +
            'width:20px;height:20px;border-radius:50%;' +
            'background:' + avColor + ';color:#fff;' +
            'font-size:9px;font-weight:600;' +
            'display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;' +
          '">' + initials + '</span>' +
          '<span style="font-size:11px;color:#797874;">' + firstName + '</span>' +
          // Source note for action board cards (sp3)
          (card.source ? '<span style="font-size:10px;color:#BBBBB7;margin-left:auto;font-style:italic;">' + card.source + '</span>' : '') +
        '</div>' +
        '</div>';
    });

    // Empty column placeholder
    if (cards.length === 0) {
      html +=
        '<div style="' +
          'border:1px dashed #CCCBC8;border-radius:8px;' +
          'padding:20px 12px;text-align:center;' +
          'color:#BBBBB7;font-size:11px;' +
        '">No cards</div>';
    }

    html += '</div></div>'; // end col body + col
  });

  html += '</div></div>'; // end board row + outer
  return html;
};
