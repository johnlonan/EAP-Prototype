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
  // Track which doc is open (expanded) — stored on state to survive tab switches
  s._openDocId = s._openDocId || null;

  var html =
    '<div style="' +
      'display:flex;height:100%;' +
      'background:#F1F0ED;' +
    '">' +

    // Left: doc list
    '<div style="' +
      'width:280px;flex-shrink:0;' +
      'display:flex;flex-direction:column;' +
      'border-right:1px solid #E1E0DD;' +
      'background:#FFFFFF;' +
    '">' +

    // List header
    '<div style="' +
      'padding:14px 16px 10px;' +
      'border-bottom:1px solid #E1E0DD;' +
    '">' +
      '<span style="font-size:12px;font-weight:600;color:#111111;">' + sp.name + '</span>' +
      '<div style="font-size:11px;color:#797874;margin-top:2px;">' + docs.length + ' documents</div>' +
    '</div>' +

    // Doc list items
    '<div style="flex:1;overflow-y:auto;padding:6px 0;">';

  docs.forEach(function(doc) {
    var isOpen = s._openDocId === doc.id;
    var person = EAP.people && EAP.people[doc.author];
    var initials = person ? person.initials : doc.author.substring(0,2).toUpperCase();
    var color    = person ? person.color : '#6B7280';

    html +=
      '<div class="space-doc-item" data-doc-id="' + doc.id + '" style="' +
        'padding:10px 16px;' +
        'border-bottom:1px solid rgba(0,0,0,0.04);' +
        'cursor:pointer;' +
        'transition:background 100ms ease;' +
        (isOpen ? 'background:#F1F0ED;border-left:2px solid #4338CA;padding-left:14px;' : 'border-left:2px solid transparent;') +
      '">' +
        '<div style="font-size:12px;font-weight:' + (isOpen ? '600' : '400') + ';color:#111111;line-height:1.4;margin-bottom:4px;">' + doc.title + '</div>' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="' +
            'width:16px;height:16px;border-radius:50%;' +
            'background:' + color + ';color:#fff;' +
            'font-size:8px;font-weight:600;' +
            'display:inline-flex;align-items:center;justify-content:center;' +
          '">' + initials + '</span>' +
          '<span style="font-size:10px;color:#797874;">' + doc.date + '</span>' +
        '</div>' +
      '</div>';
  });

  html += '</div></div>'; // end list panel

  // Right: doc detail or empty state
  var openDoc = s._openDocId ? docs.filter(function(d){ return d.id === s._openDocId; })[0] : null;

  html += '<div style="flex:1;overflow-y:auto;padding:0;">';

  if (!openDoc) {
    // Empty state — prompt to select a doc
    html +=
      '<div style="' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'height:100%;color:#BBBBB7;gap:8px;' +
      '">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#CCCBC8;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
        '<span style="font-size:12px;">Select a document to read</span>' +
      '</div>';
  } else {
    var person = EAP.people && EAP.people[openDoc.author];
    var aName  = person ? person.name : openDoc.author;
    var aColor = person ? person.color : '#6B7280';
    var aInit  = person ? person.initials : openDoc.author.substring(0,2).toUpperCase();

    html +=
      '<div style="max-width:640px;padding:28px 32px;">' +

      // Doc title + meta
      '<h2 style="font-size:18px;font-weight:600;color:#111111;margin:0 0 8px;line-height:1.3;">' + openDoc.title + '</h2>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #E1E0DD;">' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="width:20px;height:20px;border-radius:50%;background:' + aColor + ';color:#fff;font-size:9px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;">' + aInit + '</span>' +
          '<span style="font-size:12px;color:#585753;">' + aName + '</span>' +
        '</div>' +
        '<span style="font-size:11px;color:#9CA3AF;">' + openDoc.date + '</span>' +
        // Attendees
        (function() {
          var names = (openDoc.attendees || []).map(function(k) {
            var p = EAP.people && EAP.people[k];
            return p ? p.name.split(' ')[0] : k;
          });
          if (openDoc.external) names.push(openDoc.external);
          return names.length
            ? '<span style="font-size:11px;color:#9CA3AF;">Attendees: ' + names.join(', ') + '</span>'
            : '';
        })() +
      '</div>' +

      // Summary
      '<p style="font-size:13px;color:#374151;line-height:1.6;margin:0 0 20px;">' + openDoc.summary + '</p>' +

      // Decisions
      (openDoc.decisions && openDoc.decisions.length
        ? '<div style="background:#F8F7F4;border-radius:10px;padding:16px 18px;">' +
            '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#797874;margin-bottom:10px;">Key decisions</div>' +
            '<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;">' +
              openDoc.decisions.map(function(d) {
                return '<li style="display:flex;gap:8px;font-size:12px;color:#374151;line-height:1.5;">' +
                  '<span style="color:#4338CA;flex-shrink:0;margin-top:2px;">&#10003;</span>' +
                  d + '</li>';
              }).join('') +
            '</ul>' +
          '</div>'
        : '') +

      '</div>';
  }

  html += '</div></div>'; // end detail + outer

  return html;
};

// Wire doc list item clicks — called by renderInsights or a post-render hook
EAP.wireSpaceDocClicks = function() {
  document.querySelectorAll('.space-doc-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var docId = item.dataset.docId;
      EAP.state._openDocId = (EAP.state._openDocId === docId) ? null : docId;
      // Re-render content only (chrome and filter bar unchanged)
      EAP.renderContent();
      EAP.wireSpaceDocClicks();
    });
    item.addEventListener('mouseenter', function() {
      if (EAP.state._openDocId !== item.dataset.docId) item.style.background = '#F8F7F4';
    });
    item.addEventListener('mouseleave', function() {
      if (EAP.state._openDocId !== item.dataset.docId) item.style.background = '';
    });
  });
};
