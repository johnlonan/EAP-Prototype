/* ═══════════════════════════════════════════════════════
   SPACE-DOCS.JS — Docs tab renderer for Space context
   Used by: Meeting Notes space (sp3), Payment Runbooks (sp4)
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

EAP.renderSpaceDocs = function() {
  var s = EAP.state;
  var sp = s.spaceData;
  if (!sp || !sp.docs) return '<div style="padding:40px;color:#9CA3AF;font-size:13px;">No documents.</div>';

  var docs = sp.docs;
  s._openDocId = s._openDocId || null;
  var openDoc = s._openDocId ? docs.filter(function(d) { return d.id === s._openDocId; })[0] : null;

  var html =
    '<div style="' +
      'display:flex;flex:1;min-height:0;overflow:hidden;' +
      'gap:0;' +
    '">' +

    // ── Left panel: document list ─────────────────────────
    '<div style="' +
      'width:260px;flex-shrink:0;' +
      'display:flex;flex-direction:column;' +
      'background:#FFFFFF;' +
      'border-radius:12px;' +
      'border:1px solid #E3E2DF;' +
      'overflow:hidden;' +
      'margin-right:10px;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
    '">' +

    // List header
    '<div style="' +
      'padding:12px 14px 10px;' +
      'border-bottom:1px solid #F1F0ED;' +
      'flex-shrink:0;' +
    '">' +
      '<div style="font-size:12px;font-weight:600;color:#111111;">' + sp.name + '</div>' +
      '<div style="font-size:10px;color:#797874;margin-top:2px;">' + docs.length + ' documents</div>' +
    '</div>' +

    // Doc list
    '<div style="flex:1;overflow-y:auto;">';

  docs.forEach(function(doc) {
    var isOpen  = s._openDocId === doc.id;
    var person  = EAP.people && EAP.people[doc.author];
    var initials= person ? person.initials : doc.author.substring(0,2).toUpperCase();
    var avColor = person ? person.color : '#6B7280';

    html +=
      '<div class="space-doc-item" data-doc-id="' + doc.id + '" style="' +
        'padding:10px 14px;' +
        'border-bottom:1px solid rgba(0,0,0,0.04);' +
        'cursor:pointer;transition:background 100ms ease;' +
        'border-left:2px solid ' + (isOpen ? '#4338CA' : 'transparent') + ';' +
        'padding-left:' + (isOpen ? '12px' : '14px') + ';' +
        (isOpen ? 'background:#F8F7F4;' : '') +
      '">' +
        '<div style="font-size:12px;font-weight:' + (isOpen ? '600' : '400') + ';' +
          'color:#111111;line-height:1.35;margin-bottom:5px;">' + doc.title + '</div>' +
        '<div style="display:flex;align-items:center;gap:5px;">' +
          '<span style="width:14px;height:14px;border-radius:50%;background:' + avColor + ';color:#fff;' +
            'font-size:7px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;">' +
            initials + '</span>' +
          '<span style="font-size:10px;color:#797874;">' + doc.date + '</span>' +
        '</div>' +
      '</div>';
  });

  html += '</div></div>'; // end list panel

  // ── Right panel: doc detail ───────────────────────────
  html += '<div style="flex:1;min-width:0;overflow-y:auto;">';

  if (!openDoc) {
    // Empty state
    html +=
      '<div style="' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'height:100%;gap:10px;color:#9CA3AF;' +
      '">' +
        '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#CCCBC8;">' +
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
          '<polyline points="14 2 14 8 20 8"/>' +
          '<line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' +
        '</svg>' +
        '<span style="font-size:12px;">Select a document to view</span>' +
      '</div>';
  } else {
    var person = EAP.people && EAP.people[openDoc.author];
    var aName  = person ? person.name : openDoc.author;
    var aColor = person ? person.color : '#6B7280';
    var aInit  = person ? person.initials : openDoc.author.substring(0,2).toUpperCase();

    // Build attendees string
    var attendeeNames = (openDoc.attendees || []).map(function(k) {
      var p = EAP.people && EAP.people[k];
      return p ? p.name.split(' ')[0] : k;
    });
    if (openDoc.external) attendeeNames.push(openDoc.external);

    html +=
      // White card — the document itself
      '<div style="' +
        'background:#FFFFFF;' +
        'border-radius:12px;' +
        'border:1px solid #E3E2DF;' +
        'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
        'padding:28px 32px 32px;' +
        'min-height:100%;' +
        'box-sizing:border-box;' +
      '">' +

      // Document title
      '<h2 style="' +
        'font-size:20px;font-weight:700;color:#111111;' +
        'margin:0 0 14px;line-height:1.25;' +
      '">' + openDoc.title + '</h2>' +

      // Meta row: author + date + attendees
      '<div style="' +
        'display:flex;align-items:center;gap:14px;flex-wrap:wrap;' +
        'margin-bottom:24px;padding-bottom:20px;' +
        'border-bottom:1px solid #F1F0ED;' +
      '">' +
        // Author chip
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="width:22px;height:22px;border-radius:50%;background:' + aColor + ';color:#fff;' +
            'font-size:9px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;">' +
            aInit + '</span>' +
          '<span style="font-size:12px;color:#374151;font-weight:500;">' + aName + '</span>' +
        '</div>' +
        // Date
        '<span style="font-size:11px;color:#9CA3AF;">' + openDoc.date + '</span>' +
        // Attendees
        (attendeeNames.length
          ? '<span style="font-size:11px;color:#9CA3AF;">With: ' + attendeeNames.join(', ') + '</span>'
          : '') +
      '</div>' +

      // Summary
      '<p style="' +
        'font-size:13px;color:#374151;line-height:1.65;' +
        'margin:0 0 24px;' +
      '">' + openDoc.summary + '</p>' +

      // Key decisions
      (openDoc.decisions && openDoc.decisions.length
        ? '<div style="' +
            'background:#F8F7F4;' +
            'border-radius:10px;' +
            'border:1px solid #E8E7E4;' +
            'padding:16px 20px;' +
          '">' +
            '<div style="' +
              'font-size:10px;font-weight:600;text-transform:uppercase;' +
              'letter-spacing:0.06em;color:#797874;margin-bottom:12px;' +
            '">Key Decisions</div>' +
            '<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;">' +
              openDoc.decisions.map(function(d) {
                return '<li style="display:flex;gap:10px;align-items:flex-start;">' +
                  '<span style="' +
                    'width:18px;height:18px;border-radius:50%;' +
                    'background:rgba(99,102,241,0.12);color:#4338CA;' +
                    'font-size:10px;font-weight:700;flex-shrink:0;margin-top:1px;' +
                    'display:inline-flex;align-items:center;justify-content:center;' +
                  '">✓</span>' +
                  '<span style="font-size:12px;color:#374151;line-height:1.55;">' + d + '</span>' +
                  '</li>';
              }).join('') +
            '</ul>' +
          '</div>'
        : '') +

      '</div>'; // end white doc card
  }

  html += '</div></div>'; // end right panel + outer row
  return html;
};

// Wire doc list item clicks — called post-render from render.js
EAP.wireSpaceDocClicks = function() {
  document.querySelectorAll('.space-doc-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var docId = item.dataset.docId;
      EAP.state._openDocId = (EAP.state._openDocId === docId) ? null : docId;
      EAP.renderContent();
      if (EAP.wireSpaceDocClicks) EAP.wireSpaceDocClicks();
    });
    item.addEventListener('mouseenter', function() {
      if (EAP.state._openDocId !== item.dataset.docId) item.style.background = '#F8F7F4';
    });
    item.addEventListener('mouseleave', function() {
      if (EAP.state._openDocId !== item.dataset.docId) item.style.background = '';
    });
  });
};
