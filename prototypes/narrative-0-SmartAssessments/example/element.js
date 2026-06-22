/**
 * narrative-0-Demands — All Demands list + Demand detail prototype
 * Screens: All Demands list → Overview → Resource Assignments
 */

import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
import ReactDOM from '../node_modules/.pnpm/react-dom@16.14.0_react@16.14.0/node_modules/react-dom';

import '@servicenow/now-button';
import '@servicenow/now-badge';
import '@servicenow/now-highlighted-value';
import '@servicenow/now-icon';
import '@servicenow/now-list';
import '@servicenow/now-pagination-control';
import '@servicenow/now-toggle';
import '@servicenow/now-avatar';

import {
  createWorkspaceAppShell,
  injectWorkspaceAppShellStyles,
} from '../replica-app-shell/WorkspaceAppShell';

var WorkspaceAppShell = createWorkspaceAppShell(React);

// ─── Styles ────────────────────────────────────────────────────────────────────
var injectStyles = function() {
  var el = document.createElement('style');
  el.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, button, input, select, textarea {
      font-family: var(--now-font-family, 'Source Sans Pro', Lato, -apple-system, BlinkMacSystemFont, sans-serif);
    }

    /* ── Shell height fix ──────────────────────────────────────────────
       The replica shell uses min-height:100% on the page wrapper, which
       doesn't establish a height context for percentage children.
       Override to height:100% + overflow:hidden so our pages fill it.
    ─────────────────────────────────────────────────────────────────── */
    .workspace-app-shell__content { overflow: hidden !important; }
    .workspace-app-shell__page    { height: 100% !important; overflow: hidden !important; }

    /* ── Suppress webpack dev-server warnings overlay ──────────────── */
    #webpack-dev-server-client-overlay { display: none !important; }

    /* ── Breadcrumb ────────────────────────────────────────────────── */
    .snp-bc {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 20px; font-size: 13px; color: #293e40;
      border-bottom: 1px solid #e0e5e8; background: #fff; flex-shrink: 0;
    }
    .snp-bc-link {
      color: #0f7aab; cursor: pointer; display: flex; align-items: center; gap: 4px;
    }
    .snp-bc-link:hover { text-decoration: underline; }
    .snp-bc-sep { color: #b0bec5; font-size: 11px; }

    /* ── List page ─────────────────────────────────────────────────── */
    .snp-list-page { flex: 1; display: flex; flex-direction: column; background: #fff; overflow: hidden; }
    .snp-list-hdr {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 24px 10px; flex-shrink: 0;
    }
    .snp-list-title-grp { display: flex; align-items: center; gap: 10px; }
    .snp-list-title { font-size: 22px; font-weight: 700; color: #0f3349; letter-spacing: -0.2px; }
    .snp-list-actions { display: flex; align-items: center; gap: 6px; }
    .snp-filter-wrap { position: relative; display: inline-flex; }
    .snp-filter-dot {
      position: absolute; top: -3px; right: -3px;
      background: #0f7aab; color: #fff; border-radius: 50%;
      width: 15px; height: 15px; font-size: 9px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none; border: 1.5px solid #fff; z-index: 1;
    }
    .snp-list-body { flex: 1; overflow: auto; border-top: 1px solid #e8ecef; min-height: 0; }
    .snp-list-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 24px; border-top: 1px solid #e8ecef;
      font-size: 13px; color: #4b5563; flex-shrink: 0;
    }
    .snp-page-size-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 8px; border: 1px solid #d1d5db; border-radius: 4px;
      font-size: 13px; color: #374151; cursor: pointer; background: #fff;
      font-family: inherit;
    }

    /* ── Detail page ───────────────────────────────────────────────── */
    .snp-detail-page { flex: 1; display: flex; flex-direction: column; background: #fff; overflow: hidden; }
    .snp-detail-cols { flex: 1; display: flex; overflow: hidden; min-height: 0; }

    /* Sidebar */
    .snp-sidebar {
      width: 232px; flex-shrink: 0;
      border-right: 1px solid #e0e5e8;
      display: flex; flex-direction: column;
      background: #fff; overflow-y: auto;
    }
    .snp-sidebar-top {
      padding: 14px 16px 12px;
      border-bottom: 1px solid #eaecef;
    }
    .snp-sidebar-top-label {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.7px; color: #9ca3af; margin-bottom: 5px;
    }
    .snp-sidebar-top-title {
      font-size: 13px; font-weight: 600; color: #111827;
      line-height: 1.4; margin-bottom: 7px;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .snp-sidebar-top-meta {
      font-size: 12px; color: #6b7280;
      display: flex; align-items: center; gap: 6px;
    }
    .snp-sidebar-top-meta-sep { color: #d1d5db; }
    .snp-sidebar-nav { padding: 4px 0; }
    .snp-nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 18px; font-size: 14px; color: #293e40;
      cursor: pointer; user-select: none;
      border-left: 3px solid transparent;
    }
    .snp-nav-item:hover { background: #f0f5f7; }
    .snp-nav-item.is-active {
      background: #e5f2f7; border-left-color: #0f7aab;
      color: #0d3248; font-weight: 500;
    }
    .snp-sidebar-collapse {
      display: flex; align-items: center; justify-content: center;
      position: absolute; left: 218px; top: 50%; transform: translateY(-50%);
      width: 20px; height: 48px; background: #fff;
      border: 1px solid #e0e5e8; border-left: none;
      border-radius: 0 4px 4px 0; cursor: pointer; z-index: 10; color: #6b7280;
    }

    /* Main content — overview scrolls itself; resource tab manages its own height */
    .snp-main { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-width: 0; min-height: 0; }
    .snp-ov-scroll { flex: 1; overflow-y: auto; }

    /* ── Overview ──────────────────────────────────────────────────── */
    .snp-ov-title-area { padding: 20px 24px 16px; }
    .snp-ov-title { font-size: 24px; font-weight: 600; color: #0f3349; line-height: 1.25; }
    .snp-ov-body { padding: 0 24px 32px; }

    /* AI summary card */
    .snp-ai-card { border: 1px solid #00875a; border-left: 3px solid #00875a; border-radius: 8px; background: #fff; overflow: hidden; }
    .snp-ai-hdr { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; }
    .snp-ai-hdr-left { display: flex; align-items: center; gap: 8px; }
    .snp-ai-sparkle { font-size: 14px; color: #107869; line-height: 1; }
    .snp-ai-lbl { font-size: 14px; font-weight: 600; color: #107869; }
    .snp-ai-hdr-right { display: flex; align-items: center; gap: 2px; }
    .snp-ai-body { padding: 4px 20px 20px; border-top: 1px solid #e6f4ef; }
    .snp-ai-sec-title { font-size: 14px; font-weight: 600; color: #111827; margin: 16px 0 5px; }
    .snp-ai-sec-text { font-size: 14px; color: #374151; line-height: 1.55; }
    .snp-ai-sec-list { list-style: disc; padding-left: 20px; font-size: 14px; color: #374151; line-height: 1.65; }
    .snp-ai-ftr {
      display: flex; justify-content: space-between; align-items: center;
      padding: 9px 16px; border-top: 1px solid #e6f4ef;
      font-size: 12px; color: #6b7280;
    }
    .snp-ai-thumbs { display: flex; align-items: center; gap: 8px; }
    .snp-thumb { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; display: flex; align-items: center; font-family: inherit; }
    .snp-thumb:hover { color: #374151; }

    /* ── Resource assignments ──────────────────────────────────────── */
    .snp-ra { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
    .snp-ra-hdr {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 12px 12px 12px 20px; border-bottom: 1px solid #e0e5e8; flex-shrink: 0; gap: 12px;
    }
    .snp-ra-hdr-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
    .snp-ra-hdr-title {
      font-size: 20px; font-weight: 600; color: #0f3349;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 560px;
    }
    .snp-ra-hdr-icons { display: flex; align-items: center; gap: 2px; }
    .snp-ra-ctrl { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .snp-unassigned-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; margin-right: 4px; }
    .snp-dd-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 12px; height: 32px; border: 1px solid #c9d0d5; border-radius: 4px;
      font-size: 13px; color: #111827; background: #fff; cursor: pointer; white-space: nowrap;
      font-family: inherit;
    }
    .snp-dd-btn:hover { background: #f3f6f8; }
    .snp-dd-btn-primary {
      background: var(--now-color--primary, #032d42); color: #fff; border-color: transparent;
    }
    .snp-dd-btn-primary:hover { background: var(--now-color--primary-1, #0f3349); }
    .snp-ra-meta {
      display: flex; align-items: center; gap: 24px;
      padding: 7px 20px; border-bottom: 1px solid #e0e5e8; font-size: 12px; flex-shrink: 0;
    }
    .snp-meta-blk { display: flex; flex-direction: column; gap: 1px; }
    .snp-meta-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; font-weight: 600; }
    .snp-meta-val { color: #374151; font-size: 12px; }
    .snp-status-pending {
      display: inline-flex; align-items: center; gap: 4px;
      background: #fef3c7; color: #92400e;
      padding: 1px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;
    }
    .snp-grp-by-row {
      display: flex; justify-content: flex-end; align-items: center;
      padding: 5px 12px 5px 20px; border-bottom: 1px solid #e0e5e8;
      font-size: 12px; color: #4b5563; flex-shrink: 0; gap: 4px;
    }

    /* ── Two-panel resource table (Options 1 & 2) ─────────────────────
       Left panel: static, overflow:hidden  |  Right panel: scrolls freely
       Same pattern as Option 3 — no sticky columns, no z-index fights.    */
    .snp-ra-content-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }

    /* Panel containers */
    .snp-panels     { flex: 1; display: flex; overflow: hidden; min-height: 0; }
    .snp-ua-panels  { flex: 1; display: flex; overflow: hidden; min-height: 0; }
    .snp-ra-lp, .snp-ua-lp { flex-shrink: 0; overflow: hidden; border-right: 2px solid #c8ccd2; }
    .snp-ra-rp, .snp-ua-rp { flex: 1; overflow: auto; }

    /* Left table — plain, no sticky needed */
    .snp-ltbl { border-collapse: collapse; font-size: 13px; }
    .snp-ltbl th, .snp-ltbl td {
      padding: 8px 10px; white-space: nowrap; vertical-align: middle;
      border-bottom: 1px solid #e0e3e7; height: 38px;
    }
    .snp-ltbl th {
      background: #f8fafc; font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;
      border-bottom: 1px solid #e0e5e8; text-align: left;
      position: sticky; top: 0; z-index: 2;
    }
    .snp-ltbl td { background: #fff; color: #374151; }
    /* Person parent rows — left table tint */
    .snp-ltbl tr.row-r  td { background: rgba(234,60,16,  0.08); font-weight: 500; }
    .snp-ltbl tr.row-g  td { background: rgba(75, 166,107, 0.10); font-weight: 500; }
    .snp-ltbl tr.row-lg td { background: rgba(75, 166,107, 0.05); font-weight: 500; }
    .snp-ltbl tr:hover td { background: #f3f6f8; }
    .snp-ltbl tr.row-r:hover  td { background: rgba(234,60,16,  0.13); }
    .snp-ltbl tr.row-g:hover  td { background: rgba(75, 166,107, 0.16); }
    .snp-ltbl tr.row-lg:hover td { background: rgba(75, 166,107, 0.09); }

    /* Right table — month columns */
    .snp-rtbl { border-collapse: collapse; font-size: 13px; }
    .snp-rtbl th, .snp-rtbl td {
      padding: 8px 10px; white-space: nowrap; vertical-align: middle;
      border-bottom: 1px solid #f0f4f6; border-right: 1px solid rgba(0,0,0,0.04);
      min-width: 80px; height: 38px; text-align: center; font-variant-numeric: tabular-nums;
    }
    .snp-rtbl th {
      background: #f8fafc; font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;
      border-bottom: 1px solid #e0e5e8; border-right: 1px solid rgba(0,0,0,0.06);
      position: sticky; top: 0; z-index: 2;
    }
    .snp-rtbl td { background: #fff; color: #374151; }
    /* Person parent rows — right table vivid Horizon colours */
    .snp-rtbl tr.row-r  td { background: rgb(234,60,16);          color: #fff; font-weight: 700; }
    .snp-rtbl tr.row-g  td { background: rgb(75,166,107);          color: #fff; font-weight: 700; }
    .snp-rtbl tr.row-lg td { background: rgba(75,166,107,0.40);    color: rgb(27,94,32); font-weight: 700; }

    .snp-person-cell { display: flex; align-items: center; gap: 8px; }
    .snp-task-link { color: #0f7aab; cursor: pointer; padding-left: 36px; display: inline-block; }
    .snp-task-link:hover { text-decoration: underline; }
    .snp-drag { color: #bcc5cc; cursor: grab; font-size: 14px; padding: 0 2px; }
    .snp-more { color: #9ca3af; cursor: pointer; padding: 0 2px; }
    .snp-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
    .snp-pill-approved { background: rgba(75,166,107,0.15); color: rgb(27,94,32); }
    .snp-pill-pending { color: #374151; font-size: 13px; }
    .snp-date-cell { display: flex; align-items: center; gap: 4px; color: #374151; }

    /* ── Hub / Start page ──────────────────────────────────────────── */
    .hub-root {
      height: 100vh; display: flex; flex-direction: column;
      font-family: var(--now-font-family, 'Source Sans Pro', Lato, sans-serif);
      background: #f0f4f6;
    }
    .hub-header {
      background: rgb(3,45,66); padding: 48px 60px 44px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .hub-eyebrow {
      font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
      color: rgba(255,255,255,0.45); margin-bottom: 14px;
    }
    .hub-title {
      font-size: 36px; font-weight: 700; color: #fff;
      line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.5px;
    }
    .hub-subtitle {
      font-size: 15px; color: rgba(255,255,255,0.6);
      max-width: 540px; line-height: 1.6;
    }
    .hub-body {
      flex: 1; display: flex; align-items: center; justify-content: center;
      padding: 48px 60px;
    }
    .hub-cards { display: flex; gap: 20px; max-width: 1000px; width: 100%; }
    .hub-card {
      flex: 1; background: #fff; border-radius: 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.05);
      padding: 32px 28px 26px;
      display: flex; flex-direction: column; gap: 14px;
      cursor: pointer; transition: box-shadow 0.15s, transform 0.12s;
    }
    .hub-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(1,119,142,0.12);
      transform: translateY(-3px);
      border-color: rgba(1,119,142,0.25);
    }
    .hub-num {
      width: 52px; height: 52px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, rgb(1,119,142) 0%, rgb(3,45,66) 100%);
      flex-shrink: 0;
    }
    .hub-card-title { font-size: 18px; font-weight: 600; color: #0f3349; }
    .hub-card-desc { font-size: 14px; color: #6b7280; line-height: 1.55; flex: 1; }
    .hub-card-cta {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 18px; border-radius: 6px;
      background: rgb(3,45,66); color: #fff;
      font-size: 13px; font-weight: 500; border: none;
      cursor: pointer; font-family: inherit; align-self: flex-start;
      transition: background 0.15s; margin-top: 4px;
    }
    .hub-card-cta:hover { background: rgb(1,119,142); }
    .hub-footer {
      padding: 14px 60px; text-align: center;
      font-size: 11px; color: rgba(0,0,0,0.3);
      border-top: 1px solid rgba(0,0,0,0.07);
      letter-spacing: 0.3px;
    }
    /* Variant badge in breadcrumb */
    .snp-variant-badge {
      display: inline-flex; align-items: center;
      padding: 1px 8px; border-radius: 10px;
      background: rgba(1,119,142,0.10); color: rgb(1,119,142);
      font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
      margin-left: 4px;
    }
    .snp-to-hub {
      display: flex; align-items: center; gap: 4px;
      color: #0f7aab; cursor: pointer; font-size: 12px;
      padding: 2px 8px 2px 4px; border-radius: 4px;
      margin-right: 4px;
    }
    .snp-to-hub:hover { background: rgba(15,122,171,0.06); }

    /* Right action panel — part of the flex layout, not fixed */
    .snp-ra-body { flex: 1; display: flex; flex-direction: row; overflow: hidden; min-height: 0; }
    .snp-ra-right-panel {
      width: 40px; flex-shrink: 0;
      display: flex; flex-direction: column;
      align-items: center; padding-top: 10px; gap: 2px;
      border-left: 1px solid #e0e5e8; background: #fff;
    }

    /* ── Option 3 — two-panel approach: separate left + right tables ── */
    /* Left panel never scrolls. Right panel scrolls. JS syncs vertical scroll. */
    .snp-v3-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
    .snp-v3-hdr {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px 12px; border-bottom: 1px solid #e0e5e8; flex-shrink: 0;
    }
    .snp-v3-title { font-size: 18px; font-weight: 600; color: #111827; }
    .snp-v3-hdr-right { display: flex; align-items: center; gap: 6px; }

    /* Two-panel container */
    .snp-v3-panels { flex: 1; display: flex; overflow: hidden; min-height: 0; }

    /* Left panel: clips overflow, never scrolls horizontally */
    .snp-v3-lp {
      flex-shrink: 0;
      overflow: hidden;
      border-right: 2px solid #c0c5ca;
    }
    /* Right panel: scrolls freely */
    .snp-v3-rp { flex: 1; overflow: auto; }

    /* ── Left table ─────────────────────────────────────────────────── */
    .snp-v3-ltbl { border-collapse: collapse; font-size: 13px; }
    .snp-v3-ltbl th, .snp-v3-ltbl td {
      padding: 9px 10px; white-space: nowrap; vertical-align: middle;
      border-bottom: 1px solid #e0e3e7; height: 38px;
    }
    .snp-v3-ltbl th {
      background: #fff; font-size: 12px; font-weight: 600; color: #374151;
      text-align: left; border-bottom: 1px solid #c8ccd2;
      position: sticky; top: 0; z-index: 2;
    }
    .snp-v3-ltbl td { background: #fff; color: #374151; }
    .snp-v3-ltbl tr:hover td { background: #f3f6f8; }

    /* ── Right table (month columns, grey read-only) ────────────────── */
    .snp-v3-rtbl { border-collapse: collapse; font-size: 13px; }
    .snp-v3-rtbl th, .snp-v3-rtbl td {
      padding: 9px 12px; white-space: nowrap; vertical-align: middle;
      border-bottom: 1px solid #d8dbe0; border-right: 1px solid #d4d8dc;
      min-width: 108px; height: 38px; text-align: right;
    }
    .snp-v3-rtbl th {
      background: #e6e9ed; font-size: 12px; font-weight: 600; color: #374151;
      border-bottom: 1px solid #c0c4ca;
      position: sticky; top: 0; z-index: 2;
    }
    .snp-v3-rtbl td {
      background: #eaecef; color: #374151; font-variant-numeric: tabular-nums;
    }
    .snp-v3-rtbl tr:hover td { background: #dde1e6; }

    .snp-v3-status-pending { color: #374151; }

    /* ── Custom toggle ──────────────────────────────────────────────── */
    .snp-toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
    .snp-toggle-track {
      width: 32px; height: 18px; border-radius: 9px; background: #c9d0d5;
      position: relative; transition: background 0.2s; flex-shrink: 0;
    }
    .snp-toggle-track.on { background: rgb(75,166,107); }
    .snp-toggle-thumb {
      position: absolute; top: 2px; left: 2px;
      width: 14px; height: 14px; border-radius: 50%; background: #fff;
      transition: left 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    }
    .snp-toggle-track.on .snp-toggle-thumb { left: 16px; }

    /* ── Split tray layout ──────────────────────────────────────────── */
    .snp-split { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
    .snp-top-tray { flex: 1; overflow: hidden; min-height: 0; display: flex; flex-direction: column; }
    .snp-split-handle {
      height: 7px; flex-shrink: 0; cursor: row-resize;
      background: #eef0f3; border-top: 1px solid #d6dade; border-bottom: 1px solid #d6dade;
      display: flex; align-items: center; justify-content: center;
    }
    .snp-split-handle::after {
      content: ''; display: block; width: 32px; height: 3px;
      border-radius: 2px; background: #b0b8c1;
    }
    .snp-split-handle:hover { background: #e0e5e8; }
    .snp-split-handle:hover::after { background: #7f8c99; }

    /* ── Bottom (unassigned) tray ───────────────────────────────────── */
    .snp-ua-tray { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 120px; }
    .snp-ua-hdr {
      display: flex; justify-content: space-between; align-items: center;
      padding: 7px 12px 7px 20px; border-bottom: 1px solid #e0e5e8;
      background: #f8fafc; flex-shrink: 0;
    }
    .snp-ua-hdr-left { display: flex; align-items: center; gap: 8px; }
    .snp-ua-title { font-size: 13px; font-weight: 600; color: #111827; }
    .snp-ua-tbl-wrap { flex: 1; overflow: auto; min-height: 0; }

    /* ── Empty state ────────────────────────────────────────────────── */
    .snp-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 28px 20px; text-align: center;
    }
    .snp-empty-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px; }
    .snp-empty-sub { font-size: 13px; color: #6b7280; }

    /* ── Overview layout ───────────────────────────────────────────── */
    .snp-ov-layout { flex: 1; display: flex; flex-direction: row; overflow: hidden; min-height: 0; }
    .snp-ov-right-panel {
      width: 40px; flex-shrink: 0;
      display: flex; flex-direction: column;
      align-items: center; padding-top: 10px; gap: 2px;
      border-left: 1px solid #e0e5e8; background: #fff;
    }

    /* ── Assessment card ───────────────────────────────────────────── */
    .snp-score-box {
      border: 1px solid #d1d5db; border-radius: 6px;
      padding: 10px 14px; margin: 14px 0 4px;
      background: #f9fafb;
    }
    .snp-score-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px; }
    .snp-score-val   { font-size: 14px; color: #374151; line-height: 1.5; }

    .snp-team { margin-top: 16px; }
    .snp-team-hdr {
      font-size: 14px; font-weight: 600; color: #374151;
      text-decoration: underline; margin-bottom: 6px;
    }
    .snp-pf-row  { display: flex; align-items: center; gap: 6px; margin: 8px 0 3px; }
    .snp-pf-pass { font-size: 14px; font-weight: 600; color: #16a34a; }
    .snp-pf-fail { font-size: 14px; font-weight: 600; color: #dc2626; }
    .snp-pf-list { list-style: disc; padding-left: 24px; margin: 2px 0 4px; }
    .snp-pf-list li { font-size: 14px; color: #374151; line-height: 1.6; }

    /* ── Sparkle nav icon ──────────────────────────────────────────── */
    .snp-nav-sparkle-icon {
      font-size: 13px; width: 16px; height: 16px;
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0; line-height: 1;
    }
  `;
  document.head.appendChild(el);
};

// ─── Data ──────────────────────────────────────────────────────────────────────
var DEMANDS = [
  { key: 'DMND410099a', number: 'DMND410099', name: 'Automated Data Retention & Deletion System',       portfolio: 'HR',                        state: 'Draft',        startDate: '2025-04-16', endDate: '2025-05-16' },
  { key: 'DMND410081',  number: 'DMND410081', name: 'Landing Page for New Product Launch',               portfolio: 'Marketing',                  state: 'Draft',        startDate: '2025-04-01', endDate: '2025-06-30' },
  { key: 'DMND410076',  number: 'DMND410076', name: 'User Account Provisioning Automation',              portfolio: 'Consumer Digital product',   state: 'Submitted',    startDate: '2025-02-28', endDate: '2025-05-10' },
  { key: 'DMND410071',  number: 'DMND410071', name: 'Office 365 Email Forwarding Rules Monitoring',      portfolio: '(empty)',                    state: 'Draft',        startDate: '2025-03-01', endDate: '2025-05-01' },
  { key: 'DMND410070',  number: 'DMND410070', name: 'Automated Incident Response for Cyber Threats',     portfolio: '(empty)',                    state: 'Submitted',    startDate: '2025-03-01', endDate: '2025-06-15' },
  { key: 'DMND410066',  number: 'DMND410066', name: 'Password Expiry Notification',                      portfolio: 'HR',                        state: 'Submitted',    startDate: '2025-04-01', endDate: '2025-10-01' },
  { key: 'DMND410065',  number: 'DMND410065', name: 'Automated Incident Ticket Routing',                 portfolio: 'Application Modernization',  state: 'Screening',    startDate: '2025-02-01', endDate: '2025-12-30' },
  { key: 'DMND410064',  number: 'DMND410064', name: 'Cloud Resource Optimization',                       portfolio: 'Enterprise Ventures',        state: 'Qualified',    startDate: '2025-01-01', endDate: '2025-06-01' },
  { key: 'DMND410063',  number: 'DMND410063', name: 'Automated Security Audits',                         portfolio: 'Business Transformation',    state: 'Approved',     startDate: '2025-03-01', endDate: '2025-07-30' },
  { key: 'DMND900160',  number: 'DMND900160', name: 'Active Directory Account Cleanup',                  portfolio: 'Consumer Digital product',   state: 'Complete',     startDate: '2025-04-16', endDate: '2025-05-16' },
  { key: 'DMND410058',  number: 'DMND410058', name: 'Automated VPN Access Management',                   portfolio: 'Consumer Digital product',   state: 'AI Qualified', startDate: '2025-02-28', endDate: '2025-02-16' },
  { key: 'DMND410057',  number: 'DMND410057', name: 'Office 365 Group Expiration Management',            portfolio: 'Business Transformation',    state: 'Draft',        startDate: '2025-01-01', endDate: '2025-06-30' },
  { key: 'DMND410055',  number: 'DMND410055', name: 'MS Teams Meeting Room Setup Automation',            portfolio: 'Business Transformation',    state: 'Draft',        startDate: '2025-01-01', endDate: '2025-08-30' },
  { key: 'DMND410054',  number: 'DMND410054', name: 'Automated User Role Assignment',                    portfolio: 'HR',                        state: 'Screening',    startDate: '2025-03-01', endDate: '2025-04-15' },
  { key: 'DMND410052',  number: 'DMND410052', name: 'Password Reset Self-Service Portal',                portfolio: 'HR',                        state: 'Screening',    startDate: '2025-02-28', endDate: '2025-05-28' },
  { key: 'DMND410099b', number: 'DMND410099', name: 'Automated Role Management System',                  portfolio: 'Business Transformation',    state: 'Qualified',    startDate: '2025-04-16', endDate: '2025-05-16' },
  { key: 'DMND410097a', number: 'DMND410097', name: 'Self-Service Password Recovery Hub',                portfolio: 'HR',                        state: 'Complete',     startDate: '2025-02-28', endDate: '2025-02-16' },
  { key: 'DMND410099c', number: 'DMND410099', name: 'Dynamic User Role Automation',                      portfolio: 'Consumer Digital product',   state: 'Screening',    startDate: '2025-01-01', endDate: '2025-06-30' },
  { key: 'DMND410097b', number: 'DMND410097', name: 'Password Recovery Self-Service Interface',          portfolio: 'Consumer Digital product',   state: 'Qualified',    startDate: '2025-01-01', endDate: '2025-08-30' },
  { key: 'DMND410099d', number: 'DMND410099', name: 'Automated Role Assignment Tool',                    portfolio: 'Application Modernization',  state: 'Submitted',    startDate: '2025-03-01', endDate: '2025-04-15' },
];

var STATE_CFG = {
  'Draft':        { color: 'critical', variant: 'secondary' },
  'Submitted':    { color: 'info',     variant: 'secondary' },
  'Screening':    { color: 'purple',   variant: 'secondary' },
  'Qualified':    { color: 'teal',     variant: 'secondary' },
  'Approved':     { color: 'positive', variant: 'primary'   },
  'Complete':     { color: 'warning',  variant: 'secondary' },
  'AI Qualified': { color: 'positive', variant: 'primary'   },
};

// valid Seismic icon names (from component-map.md)
var NAV_ITEMS = [
  { id: 'overview',             label: 'Overview',             icon: 'table-outline'              },
  { id: 'playbook',             label: 'Playbook',             icon: 'arrow-clockwise-outline'    },
  { id: 'details',              label: 'Details',              icon: 'list-outline'                },
  { id: 'financials',           label: 'Financials',           icon: 'chart-bar-vertical-outline'  },
  { id: 'resource-assignments', label: 'Resource assignments', icon: 'user-group-outline'          },
  { id: 'demand-tasks',         label: 'Demand tasks',         icon: 'circle-check-outline'        },
  { id: 'docs',                 label: 'Docs',                 icon: 'document-outline'            },
  { id: 'smart-assessments',    label: 'Smart assessments',    icon: '__sparkle__'                 },
  { id: 'similar-demands',      label: 'Similar Demands',      icon: 'magnifying-glass-outline'    },
];

var RESOURCE_PEOPLE = [
  {
    key: 'albert', name: 'Albert Flores', cls: 'r', hours: 50,
    tasks: [
      { key: 'at1', name: 'Conduct Training Sessions',     startDate: '2024-01-01', endDate: '2024-04-01', hours: 25 },
      { key: 'at2', name: 'Evaluate System Effectiveness', startDate: '2024-01-01', endDate: '2024-04-01', hours: 25 },
    ],
  },
  {
    key: 'esther', name: 'Esther Howard', cls: 'g', hours: 20,
    tasks: [
      { key: 'et1', name: 'Monitor System Adoption and Fe...', startDate: '2024-01-01', endDate: '2024-04-01', hours: 10 },
      { key: 'et2', name: 'Evaluate System Effectiveness',     startDate: '2024-01-01', endDate: '2024-04-01', hours: 10 },
    ],
  },
  {
    key: 'ronald', name: 'Ronald Richards', cls: 'lg', hours: 10,
    tasks: [
      { key: 'rt1', name: 'Refine System Based on Feedbac', startDate: '2024-01-01', endDate: '2024-01-01', hours: 10 },
    ],
  },
];

var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function iconBtn(icon, label, size) {
  return React.createElement('now-button-iconic', {
    key: icon,
    icon: icon,
    variant: 'secondary',
    size: size || 'md',
    ref: function(el) {
      if (!el || el._aria) return;
      el._aria = true;
      el.configAria = { 'aria-label': label };
    },
  });
}

function stateCell(s) {
  var c = STATE_CFG[s] || { color: 'gray', variant: 'secondary' };
  return {
    value: s,
    highlightedValue: {
      value: s === 'AI Qualified' ? '✦ ' + s : s,
      color: c.color, variant: c.variant, size: 'md',
      showIcon: s !== 'AI Qualified', iconName: 'circle-fill',
    },
  };
}

function ddBtn(label, primary) {
  return React.createElement('button', {
    key: label,
    className: 'snp-dd-btn' + (primary ? ' snp-dd-btn-primary' : ''),
  },
    label,
    React.createElement('now-icon', { icon: 'chevron-down-outline', size: 'sm' })
  );
}

// ─── Demands List Page ─────────────────────────────────────────────────────────
function DemandsListPage(props) {
  var onDemandClick = props.onDemandClick;
  var page          = props.page;
  var setPage       = props.setPage;
  var onToHub       = props.onToHub  || function() {};
  var variant       = props.variant  || 1;

  var colDefs = JSON.stringify({
    columns: [
      { key: 'name',      type: 'link',   label: 'Name',       grow: 3   },
      { key: 'number',    type: 'string', label: 'Number',     grow: 1.2 },
      { key: 'portfolio', type: 'string', label: 'Portfolio',  grow: 2   },
      { key: 'state',     type: 'string', label: 'State',      grow: 1.4 },
      { key: 'score',     type: 'string', label: 'Score',      grow: 0.6 },
      { key: 'startDate', type: 'string', label: 'Start date', grow: 1   },
      { key: 'endDate',   type: 'string', label: 'End date',   grow: 1   },
    ],
  });

  var rowDefs = JSON.stringify({
    rows: DEMANDS.map(function(d) {
      return {
        key: d.key,
        cells: {
          name:      { value: d.key, label: d.name },
          number:    { value: d.number },
          portfolio: { value: d.portfolio },
          state:     stateCell(d.state),
          score:     { value: '-' },
          startDate: { value: d.startDate },
          endDate:   { value: d.endDate },
        },
      };
    }),
  });

  return React.createElement('div', { className: 'snp-list-page' },

    React.createElement('div', { className: 'snp-bc' },
      React.createElement('span', { className: 'snp-to-hub', onClick: onToHub },
        '‹ Hub'
      ),
      React.createElement('span', { className: 'snp-bc-sep', style: { marginRight: '4px' } }, '|'),
      React.createElement('now-icon', { icon: 'home-outline', size: 'sm' }),
      React.createElement('span', { className: 'snp-bc-sep' }, '›'),
      React.createElement('span', { style: { fontWeight: 500 } }, 'Demands'),
      React.createElement('span', { className: 'snp-variant-badge' }, 'Option ' + variant)
    ),

    React.createElement('div', { className: 'snp-list-hdr' },
      React.createElement('div', { className: 'snp-list-title-grp' },
        React.createElement('span', { className: 'snp-list-title' }, 'All Demands'),
        React.createElement('now-badge', { value: 107 })
      ),
      React.createElement('div', { className: 'snp-list-actions' },
        iconBtn('magnifying-glass-outline', 'Search'),
        iconBtn('arrow-clockwise-outline', 'Refresh'),
        iconBtn('gear-outline', 'Settings'),
        React.createElement('div', { className: 'snp-filter-wrap' },
          iconBtn('filter-outline', 'Filter'),
          React.createElement('span', { className: 'snp-filter-dot' }, '1')
        ),
        React.createElement('now-button', { label: 'Create New Demand', variant: 'primary', size: 'md' })
      )
    ),

    React.createElement('div', {
      className: 'snp-list-body',
      ref: function(el) {
        if (!el || el._bound) return;
        el._bound = true;
        el.addEventListener('NOW_LIST#CELL_LINK_CLICKED', function(e) {
          var cell = e.detail && e.detail.payload && e.detail.payload.cell;
          var v = cell && cell.value;
          if (!v) return;
          for (var i = 0; i < DEMANDS.length; i++) {
            if (DEMANDS[i].key === v) { onDemandClick(DEMANDS[i]); return; }
          }
        });
      },
    },
      React.createElement('now-list', {
        'column-definitions': colDefs,
        'row-definitions':    rowDefs,
        'selection-enabled':  'true',
        style: { display: 'block' },
      })
    ),

    React.createElement('div', { className: 'snp-list-footer' },
      React.createElement('span', null, 'Showing 1–10 of 80'),
      React.createElement('now-pagination-control', {
        'current-page': page,
        'total-count': 107,
        'page-size': 15,
        ref: function(el) {
          if (!el || el._bound) return;
          el._bound = true;
          el.addEventListener('NOW_PAGINATION_CONTROL#PAGE_CHANGED', function(e) {
            if (e.detail && e.detail.value) setPage(e.detail.value);
          });
        },
      }),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        React.createElement('span', null, 'Showing 1–15 of 107'),
        React.createElement('button', { className: 'snp-page-size-btn' },
          '15 ',
          React.createElement('now-icon', { icon: 'chevron-down-outline', size: 'sm' })
        )
      )
    )
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab(props) {
  var demand = props.demand;

  function aiCardHdr(title) {
    return React.createElement('div', { className: 'snp-ai-hdr' },
      React.createElement('div', { className: 'snp-ai-hdr-left' },
        React.createElement('span', { className: 'snp-ai-sparkle' }, '✶'),
        React.createElement('span', { className: 'snp-ai-lbl' }, title),
        React.createElement('now-icon', { icon: 'circle-info-outline', size: 'sm', style: { color: '#9ca3af' } })
      ),
      React.createElement('div', { className: 'snp-ai-hdr-right' },
        iconBtn('arrow-clockwise-outline', 'Refresh', 'sm'),
        iconBtn('chevron-up-outline', 'Collapse', 'sm')
      )
    );
  }

  function aiCardFtr() {
    return React.createElement('div', { className: 'snp-ai-ftr' },
      React.createElement('span', null, 'Check AI-generated summaries for accuracy'),
      React.createElement('div', { className: 'snp-ai-thumbs' },
        React.createElement('button', { className: 'snp-thumb' },
          React.createElement('now-icon', { icon: 'thumbs-up-outline', size: 'sm' })
        ),
        React.createElement('button', { className: 'snp-thumb' },
          React.createElement('now-icon', { icon: 'thumbs-down-outline', size: 'sm' })
        )
      )
    );
  }

  // ── Summary body ───────────────────────────────────────────────────────────
  var summaryBody = React.createElement('div', { className: 'snp-ai-body' },
    React.createElement('p', { className: 'snp-ai-sec-title' }, 'Business requirement'),
    React.createElement('p', { className: 'snp-ai-sec-text' },
      'The Automated Data Retention & Deletion System demand aims to implement a compliant, automated solution to enforce data retention schedules and secure deletion of data past its regulatory or operational lifetime across IT systems. Automation will reduce manual errors, ensure audit-readiness, optimize storage costs, and help avoid regulatory fines, supporting the organization\'s data privacy and governance objectives.'
    ),
    React.createElement('p', { className: 'snp-ai-sec-title' }, 'Key risks of performing'),
    React.createElement('ul', { className: 'snp-ai-sec-list' },
      React.createElement('li', null, 'Accidental data deletion'),
      React.createElement('li', null, 'Misconfiguration of automation policies')
    ),
    React.createElement('p', { className: 'snp-ai-sec-title' }, 'Key risks of not performing'),
    React.createElement('ul', { className: 'snp-ai-sec-list' },
      React.createElement('li', null, 'Regulatory fines and compliance violations'),
      React.createElement('li', null, 'Higher data storage/maintenance costs')
    ),
    React.createElement('p', { className: 'snp-ai-sec-title' }, 'Cost'),
    React.createElement('ul', { className: 'snp-ai-sec-list' },
      React.createElement('li', null, '$170,000 implementation'),
      React.createElement('li', null, '$35,000 annual maintenance')
    ),
    React.createElement('p', { className: 'snp-ai-sec-title' }, 'Monetary Benefit'),
    React.createElement('ul', { className: 'snp-ai-sec-list' },
      React.createElement('li', null, '$280,000 annual savings'),
      React.createElement('li', null, '$1.4–12.9 million annual cost avoidance (errors, fines, storage)')
    ),
    React.createElement('p', { className: 'snp-ai-sec-title' }, 'ROI'),
    React.createElement('ul', { className: 'snp-ai-sec-list' },
      React.createElement('li', null, '65% first year')
    )
  );

  // ── Assessment body ────────────────────────────────────────────────────────
  var TEAMS = [
    {
      name: 'Legal Team Assessment',
      pass: [
        'Compliant with major laws and keeps audit logs.',
        'Clear policies exist but some legal hold procedures need tightening.',
      ],
      fail: [
        'Retention schedules lack clear ownership and accountability, risking outdated or inconsistent enforcement.',
      ],
    },
    {
      name: 'Database/IT Team Assessment',
      pass: [
        'Monitoring dashboards exist but need tuning for alert accuracy.',
        'Automation targets manual errors and supports multiple data types well.',
      ],
      fail: [
        'Comprehensive data mapping is incomplete—more work needed.',
        'Backup policies have gaps, risking non-compliance and potential data loss during retention periods.',
      ],
    },
    {
      name: 'Business Team Assessment',
      pass: [
        'Audit support is well designed and documented.',
        'Reduces storage costs by automatically deleting data past retention, optimizing infrastructure spending.',
        'Supports audit and reporting requirements with detailed logs and compliance documentation',
      ],
      fail: [
        'Initial investment and ongoing maintenance costs can be high; requires business case justification.',
        'Change management impact on business processes needs evaluation and staff training for smooth adoption.',
        'Requires coordination with multiple departments, which may impact timelines due to varying priorities.',
      ],
    },
  ];

  var assessmentChildren = [
    React.createElement('p', { key: 'intro', className: 'snp-ai-sec-text', style: { marginTop: '4px' } },
      'This assessment of the demand titled “' + demand.name + '” has been conducted according to the guidelines outlined in the knowledge base (KB) article. The evaluation considers feedback from key stakeholder groups including Legal, Database/IT, and Finance/Business teams.'
    ),
    React.createElement('div', { key: 'score', className: 'snp-score-box' },
      React.createElement('p', { className: 'snp-score-title' }, 'Assessment Score'),
      React.createElement('p', { className: 'snp-score-val' },
        'Score: ', React.createElement('strong', null, '7 out of 10'),
        ' (Good – Mostly compliant with minor gaps or challenges; manageable with mitigation)'
      )
    ),
  ];

  TEAMS.forEach(function(t) {
    assessmentChildren.push(
      React.createElement('div', { key: t.name, className: 'snp-team' },
        React.createElement('p', { className: 'snp-team-hdr' }, t.name),
        React.createElement('div', { className: 'snp-pf-row' },
          React.createElement('span', { style: { color: '#16a34a', display: 'inline-flex', alignItems: 'center', flexShrink: 0 } },
            React.createElement('now-icon', { icon: 'circle-check-fill', size: 'sm' })
          ),
          React.createElement('span', { className: 'snp-pf-pass' }, 'Pass')
        ),
        React.createElement('ul', { className: 'snp-pf-list' },
          t.pass.map(function(p, i) { return React.createElement('li', { key: i }, p); })
        ),
        React.createElement('div', { className: 'snp-pf-row' },
          React.createElement('span', { style: { color: '#dc2626', display: 'inline-flex', alignItems: 'center', flexShrink: 0 } },
            React.createElement('now-icon', { icon: 'circle-close-fill', size: 'sm' })
          ),
          React.createElement('span', { className: 'snp-pf-fail' }, 'Fail')
        ),
        React.createElement('ul', { className: 'snp-pf-list' },
          t.fail.map(function(f, i) { return React.createElement('li', { key: i }, f); })
        )
      )
    );
  });

  var assessmentBody = React.createElement('div', { className: 'snp-ai-body' }, assessmentChildren);

  return React.createElement('div', { className: 'snp-ov-layout' },
    React.createElement('div', { className: 'snp-ov-scroll' },
      React.createElement('div', { className: 'snp-ov-title-area' },
        React.createElement('h1', { className: 'snp-ov-title' }, demand.name)
      ),
      React.createElement('div', { className: 'snp-ov-body' },
        React.createElement('div', { className: 'snp-ai-card' },
          aiCardHdr('Summary by Now Assist'),
          summaryBody,
          aiCardFtr()
        ),
        React.createElement('div', { className: 'snp-ai-card', style: { marginTop: '16px' } },
          aiCardHdr('Assessment by Now Assist'),
          assessmentBody,
          aiCardFtr()
        )
      )
    ),
    React.createElement('div', { className: 'snp-ov-right-panel' },
      iconBtn('plus-outline', 'Add', 'sm'),
      iconBtn('paperclip-outline', 'Attach', 'sm'),
      iconBtn('clipboard-outline', 'Notes', 'sm')
    )
  );
}

// ─── Option 3 data ────────────────────────────────────────────────────────────

var RESOURCE_ROLES = [
  { key: 'r1', group: '', role: 'Architect',         count: 1, type: 'FTE', status: 'Pending', startDate: '2026-01-01', endDate: '2026-12-31' },
  { key: 'r2', group: '', role: 'Project Manager',   count: 1, type: 'FTE', status: 'Pending', startDate: '2026-01-01', endDate: '2026-12-31' },
  { key: 'r3', group: '', role: 'Software Engineer', count: 1, type: 'FTE', status: 'Pending', startDate: '2026-01-01', endDate: '2026-12-31' },
  { key: 'r4', group: '', role: 'Quality Analyst',   count: 1, type: 'FTE', status: 'Pending', startDate: '2026-01-01', endDate: '2026-12-31' },
  { key: 'r5', group: '', role: 'DevOps Engineer',   count: 1, type: 'FTE', status: 'Pending', startDate: '2026-01-01', endDate: '2026-12-31' },
  { key: 'r6', group: '', role: 'Business Analyst',  count: 1, type: 'FTE', status: 'Pending', startDate: '2026-01-01', endDate: '2026-12-31' },
  { key: 'r7', group: '', role: 'Data Engineer',     count: 1, type: 'FTE', status: 'Pending', startDate: '2026-01-01', endDate: '2026-12-31' },
];

// Hours per FTE per month (Jan–Dec 2026) — matching reference data pattern
// Jan 160 · Feb 168 · Mar 168 · Apr 176 · May 184 · Jun 168 · Jul 176 · Aug 168 · Sep 176 · Oct 184 · Nov 160 · Dec 168
var FTE_HOURS_2026 = [160, 168, 168, 176, 184, 168, 176, 168, 176, 184, 160, 168];

var MONTHS_V3 = [
  'Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026',
  'Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026',
];

function ResourceAssignmentsV3(props) {
  var demand = props.demand;
  var lpRef = React.useRef(null); // left panel
  var rpRef = React.useRef(null); // right panel

  function onRightScroll(e) {
    if (lpRef.current) lpRef.current.scrollTop = e.target.scrollTop;
  }

  return React.createElement('div', { className: 'snp-v3-wrap' },

    React.createElement('div', { className: 'snp-v3-hdr' },
      React.createElement('span', { className: 'snp-v3-title' }, 'Resource assignments'),
      React.createElement('div', { className: 'snp-v3-hdr-right' },
        React.createElement('now-button', { label: 'New', variant: 'primary', size: 'md' }),
        iconBtn('filter-outline', 'Filter', 'md'),
        iconBtn('ellipsis-h-outline', 'More', 'md')
      )
    ),

    React.createElement('div', { className: 'snp-v3-panels' },

      // ── LEFT PANEL — static, no horizontal scroll ──────────────────
      React.createElement('div', {
        className: 'snp-v3-lp',
        ref: function(el) { lpRef.current = el; },
      },
        React.createElement('table', { className: 'snp-v3-ltbl' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', { style: { width: '28px', padding: '9px 4px' } }),
              React.createElement('th', { style: { width: '150px' } }, 'Group'),
              React.createElement('th', { style: { width: '160px' } }, 'Role'),
              React.createElement('th', { style: { width: '100px' } }, 'Start'),
              React.createElement('th', { style: { width: '100px' } }, 'End'),
              React.createElement('th', { style: { width: '44px', textAlign: 'center' } }, '#'),
              React.createElement('th', { style: { width: '52px' } }, 'Type'),
              React.createElement('th', { style: { width: '100px' } }, 'Status')
            )
          ),
          React.createElement('tbody', null,
            RESOURCE_ROLES.map(function(r) {
              return React.createElement('tr', { key: r.key },
                React.createElement('td', { style: { padding: '9px 4px' } },
                  React.createElement('span', { className: 'snp-drag' }, '⠿')
                ),
                React.createElement('td', null, r.group),
                React.createElement('td', null, r.role || React.createElement('span', { style: { color: '#9ca3af' } }, '—')),
                React.createElement('td', null, r.startDate),
                React.createElement('td', null, r.endDate),
                React.createElement('td', { style: { textAlign: 'center' } }, r.count),
                React.createElement('td', null, r.type),
                React.createElement('td', null,
                  React.createElement('span', { className: 'snp-v3-status-pending' }, r.status)
                )
              );
            })
          )
        )
      ),

      // ── RIGHT PANEL — month columns, scrolls freely ─────────────────
      React.createElement('div', {
        className: 'snp-v3-rp',
        ref: function(el) { rpRef.current = el; },
        onScroll: onRightScroll,
      },
        React.createElement('table', { className: 'snp-v3-rtbl' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              MONTHS_V3.map(function(m) {
                return React.createElement('th', { key: m }, m);
              })
            )
          ),
          React.createElement('tbody', null,
            RESOURCE_ROLES.map(function(r) {
              return React.createElement('tr', { key: r.key },
                FTE_HOURS_2026.map(function(hrs, i) {
                  return React.createElement('td', { key: i },
                    (r.count * hrs).toLocaleString() + 'hr'
                  );
                })
              );
            })
          )
        )
      )
    )
  );
}

// ─── Resource Assignments Tab (Options 1 & 2 — two-panel approach) ──────────────
function ResourceAssignmentsTab(props) {
  var demand  = props.demand;
  var variant = props.variant || 1;

  if (variant === 3) return React.createElement(ResourceAssignmentsV3, { demand: demand });

  var uaS = React.useState(variant === 2); var showUA = uaS[0]; var setShowUA = uaS[1];
  var htS = React.useState(null);          var btmH   = htS[0]; var setBtmH   = htS[1];

  var topLRef = React.useRef(null);
  var topRRef = React.useRef(null);
  var botLRef = React.useRef(null);
  var botRRef = React.useRef(null);

  function onTopRightScroll(e) {
    if (topLRef.current) topLRef.current.scrollTop = e.target.scrollTop;
    if (showUA && botRRef.current) botRRef.current.scrollLeft = e.target.scrollLeft;
  }
  function onBotRightScroll(e) {
    if (botLRef.current) botLRef.current.scrollTop = e.target.scrollTop;
    if (topRRef.current) topRRef.current.scrollLeft = e.target.scrollLeft;
  }

  var dragging = React.useRef(false);
  var dragY    = React.useRef(0);
  var dragH    = React.useRef(0);
  function onHandleDown(e) {
    dragging.current = true;
    dragY.current = e.clientY;
    dragH.current = typeof btmH === 'number' ? btmH : 300;
    function move(ev) {
      if (!dragging.current) return;
      setBtmH(Math.max(100, Math.min(600, dragH.current + (dragY.current - ev.clientY))));
    }
    function up() {
      dragging.current = false;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    e.preventDefault();
  }

  // ── Row builders ─────────────────────────────────────────────────────────────
  var topLRows = [];
  var topRRows = [];

  if (variant !== 2) {
    // Option 1: single "Unknown" resource row (red) + demand name as the task
    // 80hr/month = sum of the previous three example resources (50+20+10)
    var totalHrs = 80;
    var demandTask = demand ? demand.name : 'Resource requirement';

    // Parent row \u2014 Unknown resource (red, vivid in right panel)
    topLRows.push(React.createElement('tr', { key: 'unk-l', className: 'row-r' },
      React.createElement('td', { style: { padding: '8px 4px' } }, React.createElement('span', { className: 'snp-drag' }, '\u28BF')),
      React.createElement('td', { style: { padding: '8px 4px' } }, React.createElement('span', { className: 'snp-more' }, '\u22EE')),
      React.createElement('td', null,
        React.createElement('div', { className: 'snp-person-cell' },
          React.createElement('now-icon', { icon: 'chevron-down-outline', size: 'sm', style: { color: '#6b7280', flexShrink: 0 } }),
          React.createElement('span', { style: { color: '#6b7280', fontStyle: 'italic', fontWeight: 500 } }, 'Unknown')
        )
      ),
      React.createElement('td', null), React.createElement('td', null), React.createElement('td', null),
      React.createElement('td', null),  // Resource status \u2014 blank for unknown
      React.createElement('td', null),
      React.createElement('td', null, '2026-01-01')
    ));
    topRRows.push(React.createElement('tr', { key: 'unk-r', className: 'row-r' },
      MONTHS.map(function(m) { return React.createElement('td', { key: m }, totalHrs + 'hr'); })
    ));

    // Child row \u2014 demand name as the task
    topLRows.push(React.createElement('tr', { key: 'unk-task-l' },
      React.createElement('td', { style: { padding: '8px 4px' } }, React.createElement('span', { className: 'snp-drag' }, '\u28BF')),
      React.createElement('td', { style: { padding: '8px 4px' } }, React.createElement('span', { className: 'snp-more' }, '\u22EE')),
      React.createElement('td', null, React.createElement('span', { className: 'snp-task-link' }, demandTask)),
      React.createElement('td', null), React.createElement('td', null), React.createElement('td', null),
      React.createElement('td', null), React.createElement('td', null),
      React.createElement('td', null, '2026-01-01')
    ));
    topRRows.push(React.createElement('tr', { key: 'unk-task-r' },
      MONTHS.map(function(m) { return React.createElement('td', { key: m }, totalHrs + 'hr'); })
    ));
  }

  var botLRows = [];
  var botRRows = [];
  if (variant === 2) {
    botLRows.push(React.createElement('tr', { key: 'ua-l' },
      React.createElement('td', { style: { padding: '8px 4px' } }, React.createElement('span', { className: 'snp-drag' }, '\u28BF')),
      React.createElement('td', { style: { padding: '8px 4px' } }, React.createElement('span', { className: 'snp-more' }, '\u22EE')),
      React.createElement('td', null, React.createElement('span', { className: 'snp-task-link' }, demand ? demand.name : '')),
      React.createElement('td', null), React.createElement('td', null), React.createElement('td', null),
      React.createElement('td', null), React.createElement('td', null), React.createElement('td', null)
    ));
    botRRows.push(React.createElement('tr', { key: 'ua-r' },
      MONTHS.map(function(m, i) { return React.createElement('td', { key: m }, FTE_HOURS_2026[i] + 'hr'); })
    ));
  }

  // ── Table header / right-head helpers ─────────────────────────────────────
  function lHead(cols) {
    return React.createElement('thead', null, React.createElement('tr', null,
      React.createElement('th', { style: { width: '28px', padding: '8px 4px' } }),
      React.createElement('th', { style: { width: '28px', padding: '8px 4px' } }),
      React.createElement('th', { style: { width: '200px' } }, cols[0]),
      React.createElement('th', { style: { width: '100px' } }, cols[1]),
      React.createElement('th', { style: { width: '70px'  } }, cols[2]),
      React.createElement('th', { style: { width: '100px' } }, cols[3]),
      React.createElement('th', { style: { width: '120px' } }, cols[4]),
      React.createElement('th', { style: { width: '90px'  } }, cols[5]),
      React.createElement('th', { style: { width: '100px' } }, cols[6])
    ));
  }
  function rHead() {
    return React.createElement('thead', null, React.createElement('tr', null,
      MONTHS.map(function(m) { return React.createElement('th', { key: m }, m); })
    ));
  }

  var TOP_COLS = ['Resource & task','Parent Item','Type','Owner','Resource status','Task effort','Start date'];
  var BOT_COLS = ['Task','Parent Item','Type','Owner','Task effort','Group','Role'];

  return React.createElement('div', { className: 'snp-ra' },

    React.createElement('div', { className: 'snp-ra-hdr' },
      React.createElement('div', { className: 'snp-ra-hdr-left' },
        React.createElement('span', { className: 'snp-ra-hdr-title' }, demand ? demand.name : ''),
        React.createElement('div', { className: 'snp-ra-hdr-icons' },
          iconBtn('pencil-outline', 'Edit', 'sm'),
          iconBtn('arrow-clockwise-outline', 'Refresh', 'sm'),
          iconBtn('link-outline', 'Copy link', 'sm')
        )
      ),
      React.createElement('div', { className: 'snp-ra-ctrl' },
        React.createElement('div', { className: 'snp-toggle-wrap',
          onClick: function() { setShowUA(function(p) { return !p; }); } },
          React.createElement('span', { style: { fontSize: '13px', color: '#374151' } }, 'Unassigned tasks'),
          React.createElement('div', { className: 'snp-toggle-track' + (showUA ? ' on' : '') },
            React.createElement('div', { className: 'snp-toggle-thumb' })
          )
        ),
        ddBtn('Hours'), ddBtn('Monthly'), ddBtn('New', true),
        iconBtn('ellipsis-h-outline', 'More', 'sm')
      )
    ),

    React.createElement('div', { className: 'snp-ra-body' },
    React.createElement('div', { className: 'snp-ra-content-wrap' },

      React.createElement('div', { className: 'snp-ra-meta' },
        React.createElement('div', { className: 'snp-meta-blk' },
          React.createElement('span', { className: 'snp-meta-lbl' }, 'Timeline'),
          React.createElement('span', { className: 'snp-meta-val' }, '01-01-2026 \u2192 31-12-2026')
        ),
        React.createElement('div', { className: 'snp-meta-blk' },
          React.createElement('span', { className: 'snp-meta-lbl' }, 'Status'),
          React.createElement('span', { className: 'snp-status-pending' }, 'Pending')
        )
      ),

      React.createElement('div', { className: 'snp-grp-by-row' },
        React.createElement('span', { style: { color: '#6b7280' } }, 'Group by'),
        React.createElement('span', { style: { color: '#374151', fontWeight: 500 } }, 'Parent item'),
        React.createElement('now-icon', { icon: 'chevron-down-outline', size: 'sm' })
      ),

      React.createElement('div', { className: 'snp-split' },

        // ── Top tray — two-panel so month headers always show ──────
        React.createElement('div', { className: 'snp-top-tray', style: { position: 'relative' } },
          React.createElement('div', { className: 'snp-panels' },
            React.createElement('div', { className: 'snp-ra-lp', ref: function(el) { topLRef.current = el; } },
              React.createElement('table', { className: 'snp-ltbl' },
                lHead(TOP_COLS),
                React.createElement('tbody', null, topLRows)
              )
            ),
            React.createElement('div', { className: 'snp-ra-rp',
              ref: function(el) { topRRef.current = el; },
              onScroll: onTopRightScroll },
              React.createElement('table', { className: 'snp-rtbl' },
                rHead(),
                React.createElement('tbody', null, topRRows)
              )
            )
          ),
          variant === 2 && React.createElement('div', {
            style: {
              position: 'absolute', top: '38px', left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff',
            }
          },
            React.createElement('div', { className: 'snp-empty' },
              React.createElement('div', { style: { fontSize: '22px', color: '#d1d5db', marginBottom: '8px' } }, '\u2630'),
              React.createElement('p', { className: 'snp-empty-sub' }, 'No records to display.')
            )
          )
        ),

        // ── Drag handle ───────────────────────────────────────────────
        showUA && React.createElement('div', { key: 'handle',
          className: 'snp-split-handle', onMouseDown: onHandleDown }),

        // ── Bottom tray (unassigned tasks) ────────────────────────────
        showUA && React.createElement('div', { key: 'ua',
          className: 'snp-ua-tray',
          style: btmH !== null ? { height: btmH, flex: 'none' } : {} },

          React.createElement('div', { className: 'snp-ua-hdr' },
            React.createElement('div', { className: 'snp-ua-hdr-left' },
              React.createElement('span', { className: 'snp-ua-title' }, 'Unassigned tasks'),
              React.createElement('now-badge', { value: variant === 2 ? 1 : 0 })
            ),
            iconBtn('filter-outline', 'Filter', 'sm')
          ),

          React.createElement('div', { className: 'snp-ua-panels' },
            React.createElement('div', { className: 'snp-ua-lp', ref: function(el) { botLRef.current = el; } },
              React.createElement('table', { className: 'snp-ltbl' },
                lHead(BOT_COLS),
                React.createElement('tbody', null,
                  botLRows.length > 0
                    ? botLRows
                    : [React.createElement('tr', { key: 'empty' },
                        React.createElement('td', { colSpan: 9, style: { textAlign: 'center', padding: '32px', color: '#9ca3af' } },
                          'No Results'))]
                )
              )
            ),
            React.createElement('div', { className: 'snp-ua-rp',
              ref: function(el) { botRRef.current = el; },
              onScroll: onBotRightScroll },
              React.createElement('table', { className: 'snp-rtbl' },
                rHead(),
                React.createElement('tbody', null, botRRows)
              )
            )
          )
        )
      )
    ), // end snp-ra-content-wrap

    React.createElement('div', { className: 'snp-ra-right-panel' },
      iconBtn('gear-outline', 'Settings', 'sm'),
      iconBtn('filter-outline', 'Filter', 'sm'),
      iconBtn('circle-question-outline', 'Help', 'sm')
    )
    ) // end snp-ra-body
  );
}

// ─── Demand Detail Page ────────────────────────────────────────────────────────
function DemandDetailPage(props) {
  var demand   = props.demand;
  var tab      = props.tab;
  var setTab   = props.setTab;
  var onBack   = props.onBack;
  var variant  = props.variant || 1;

  return React.createElement('div', { className: 'snp-detail-page' },

    // Full-width breadcrumb
    React.createElement('div', { className: 'snp-bc' },
      React.createElement('span', {
        className: 'snp-bc-link',
        onClick: onBack,
      },
        React.createElement('now-icon', { icon: 'inbox-outline', size: 'sm' }),
        'Demands'
      ),
      React.createElement('span', { className: 'snp-bc-sep' }, '>'),
      React.createElement('span', { style: { color: '#293e40' } }, demand.name),
      React.createElement('span', { className: 'snp-variant-badge' }, 'Option ' + variant)
    ),

    // Two-column layout
    React.createElement('div', { className: 'snp-detail-cols' },

      // Left sidebar
      React.createElement('div', { className: 'snp-sidebar' },
        React.createElement('div', { className: 'snp-sidebar-top' },
          React.createElement('div', { className: 'snp-sidebar-top-label' }, 'Current demand'),
          React.createElement('div', { className: 'snp-sidebar-top-title' }, demand.name),
          React.createElement('div', { className: 'snp-sidebar-top-meta' },
            React.createElement('span', null,
              'State ', React.createElement('strong', { style: { color: '#111827' } }, demand.state)
            ),
            React.createElement('span', { className: 'snp-sidebar-top-meta-sep' }, '|'),
            React.createElement('span', null,
              'Type ', React.createElement('strong', { style: { color: '#111827' } }, 'Project')
            )
          )
        ),
        React.createElement('nav', { className: 'snp-sidebar-nav' },
          NAV_ITEMS.map(function(item) {
            return React.createElement('div', {
              key: item.id,
              className: 'snp-nav-item' + (tab === item.id ? ' is-active' : ''),
              onClick: function() { setTab(item.id); },
            },
              item.icon === '__sparkle__'
                ? React.createElement('span', { className: 'snp-nav-sparkle-icon' }, '✦')
                : React.createElement('now-icon', { icon: item.icon, size: 'sm' }),
              item.label
            );
          })
        )
      ),

      // Main content
      React.createElement('div', { className: 'snp-main' },
        tab === 'resource-assignments'
          ? React.createElement(ResourceAssignmentsTab, { demand: demand, variant: variant })
          : React.createElement(OverviewTab, { demand: demand })
      )
    )
  );
}

// ─── Hub start page ───────────────────────────────────────────────────────────

var OPTION_CARDS = [
  {
    num: 3,
    title: 'Role-Based Capacity Planning',
    desc: 'Resources are defined by role type rather than named individual — Architect, Software Engineer, Quality Analyst, etc. Monthly effort is pre-calculated per role as read-only values. Suited to early-stage demands where you know what skills are needed but not yet who will fill them.',
  },
];

function StartPage(props) {
  var onSelect = props.onSelect;

  return React.createElement('div', { className: 'hub-root' },

    React.createElement('div', { className: 'hub-header' },
      React.createElement('div', { className: 'hub-eyebrow' }, 'Demand Management'),
      React.createElement('h1', { className: 'hub-title' }, 'Smart Assessments'),
      React.createElement('p', { className: 'hub-subtitle' },
        'Explore a design variant of the resource assignment view.'
      )
    ),

    React.createElement('div', { className: 'hub-body' },
      React.createElement('div', { className: 'hub-cards' },
        OPTION_CARDS.map(function(opt) {
          return React.createElement('div', {
            key: opt.num,
            className: 'hub-card',
            onClick: function() { onSelect(opt.num); },
          },
            React.createElement('div', { className: 'hub-num' }, opt.num),
            React.createElement('div', { className: 'hub-card-title' }, opt.title),
            React.createElement('div', { className: 'hub-card-desc' }, opt.desc),
            React.createElement('button', {
              className: 'hub-card-cta',
              onClick: function(e) { e.stopPropagation(); onSelect(opt.num); },
            }, 'Launch prototype')
          );
        })
      )
    ),

    React.createElement('div', { className: 'hub-footer' },
      'ServiceNow AINPX · Demand Management Research · Resource Assignment A/B Testing'
    )
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
function DemandsApp(props) {
  var variant  = props.variant  || 1;
  var onToHub  = props.onToHub  || function() {};
  var vs = React.useState('list');     var view = vs[0]; var setView = vs[1];
  var ds = React.useState(null);       var demand = ds[0]; var setDemand = ds[1];
  var ts = React.useState('overview'); var tab = ts[0];  var setTab  = ts[1];
  var ps = React.useState(1);          var page = ps[0]; var setPage = ps[1];

  if (view === 'detail' && demand) {
    return React.createElement(DemandDetailPage, {
      demand: demand, tab: tab, setTab: setTab, variant: variant,
      onBack: function() { setView('list'); },
    });
  }

  return React.createElement(DemandsListPage, {
    onDemandClick: function(d) { setDemand(d); setTab('overview'); setView('detail'); },
    page: page, setPage: setPage,
    onToHub: onToHub, variant: variant,
  });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
injectStyles();
injectWorkspaceAppShellStyles();

var BASE_MODULES = [
  { id: 'home',    label: 'Home',    icon: 'grid-four-outline',  group: 'top' },
  { id: 'inbox',   label: 'Inbox',   icon: 'lightbulb-outline',  group: 'top' },
  { id: 'demands', label: 'Demands', icon: 'filter-fill',        group: 'top' },
  { id: 'docs',    label: 'Docs',    icon: 'clipboard-outline',  group: 'top' },
  { id: 'users',   label: 'Users',   icon: 'user-group-outline', group: 'top' },
  { id: 'list',    label: 'List',    icon: 'list-fill',          group: 'top' },
  { id: 'teams',   label: 'Teams',   icon: 'user-group-outline', group: 'bottom' },
];

// ─── App — manages hub ↔ prototype routing ────────────────────────────────────
function App() {
  var vs = React.useState(null);
  var variant = vs[0]; var setVariant = vs[1];

  // Hub screen — no shell, full viewport
  if (variant === null) {
    return React.createElement(StartPage, { onSelect: setVariant });
  }

  // Prototype screen — wire the chosen variant into the demands module
  var onToHub = function() { setVariant(null); };
  var modules = BASE_MODULES.map(function(m) {
    if (m.id !== 'demands') return m;
    return Object.assign({}, m, {
      pageProps: { variant: variant, onToHub: onToHub },
      page: DemandsApp,
    });
  });

  return React.createElement(WorkspaceAppShell, {
    title: 'Strategic Planning Workspace',
    userName: 'John Lonan',
    modules: modules,
    activeModuleId: 'demands',
    showTabs: false,
  });
}

var container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(React.createElement(App), container);
