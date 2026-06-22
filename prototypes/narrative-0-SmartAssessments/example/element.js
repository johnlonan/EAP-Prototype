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
      width: 256px; flex-shrink: 0;
      border-right: 1px solid #d6d3d1;
      display: flex; flex-direction: column;
      background: #fff; overflow-y: auto;
      position: relative;
    }
    .snp-sidebar-top { padding: 16px 0 4px; }
    .snp-sidebar-demand-label {
      font-size: 12px; color: #6b7280; padding-left: 12px; margin-bottom: 3px;
    }
    .snp-sidebar-demand-title {
      font-size: 16px; font-weight: 700; color: #10171a; line-height: 1.3;
      font-family: 'Cabin', var(--now-font-family, 'Source Sans Pro', Lato, sans-serif);
      padding-left: 12px; margin-bottom: 8px;
      display: -webkit-box; -webkit-line-clamp: 1;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .snp-sidebar-meta-row { display: flex; align-items: center; }
    .snp-sidebar-meta-item { display: flex; align-items: center; gap: 6px; padding: 0 12px; }
    .snp-sidebar-meta-lbl { font-size: 12px; color: #6b7280; }
    .snp-sidebar-meta-val { font-size: 12px; color: #10171a; }
    .snp-sidebar-meta-sep { font-size: 12px; color: #d1d5db; }
    .snp-sidebar-nav { padding: 12px 0; }
    .snp-nav-item {
      display: flex; align-items: stretch;
      cursor: pointer; user-select: none; min-height: 32px;
    }
    .snp-nav-item-bar { width: 4px; flex-shrink: 0; background: transparent; }
    .snp-nav-item.is-active .snp-nav-item-bar { background: #5CAEC4; }
    .snp-nav-item-content {
      flex: 1; display: flex; align-items: center; gap: 8px;
      padding: 6px 8px; font-size: 16px; color: #10171a;
    }
    .snp-nav-item.is-active .snp-nav-item-content { background: #eef7fa; padding-left: 4px; }
    .snp-nav-item:hover:not(.is-active) .snp-nav-item-content { background: #f5f4f2; }
    .snp-nav-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 16px; height: 16px; flex-shrink: 0; color: #10171a;
    }
    .snp-nav-icon svg { display: block; }
    .snp-sidebar-collapse {
      position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
      width: 20px; height: 20px; background: #f5f5f4;
      border: 1px solid #9ca3af; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10;
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
  'Draft':        { color: 'gray',     variant: 'secondary' },
  'Submitted':    { color: 'info',     variant: 'secondary' },
  'Screening':    { color: 'purple',   variant: 'secondary' },
  'Qualified':    { color: 'teal',     variant: 'secondary' },
  'Approved':     { color: 'positive', variant: 'primary'   },
  'Complete':     { color: 'gray',     variant: 'secondary' },
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
      color: c.color, variant: c.variant, size: 'sm',
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
      React.createElement('now-icon', { icon: 'home-outline', size: 'sm' }),
      React.createElement('span', { className: 'snp-bc-sep' }, '›'),
      React.createElement('span', { style: { fontWeight: 500 } }, 'Demands')
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

// ─── Nav SVGs (exact paths from design) ────────────────────────────────────────
var _S = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">';
var _E = '</svg>';
var NAV_SVG = {
  'overview': _S +
    '<path d="M3.00012 2.50001C3.00012 2.29778 2.87829 2.11547 2.69146 2.03807C2.50462 1.96068 2.28956 2.00346 2.14656 2.14646L1.32135 2.97167C1.12609 3.16694 1.12609 3.48352 1.32135 3.67878C1.50743 3.86486 1.80367 3.87361 2.00012 3.70505V4.50001C2.00012 4.77616 2.22397 5.00001 2.50012 5.00001C2.77626 5.00001 3.00012 4.77616 3.00012 4.50001V2.50001Z" fill="currentColor"/>' +
    '<path d="M4.50012 3C4.22398 3 4.00012 3.22386 4.00012 3.5C4.00012 3.77614 4.22398 4 4.50012 4H13.5001C13.7763 4 14.0001 3.77614 14.0001 3.5C14.0001 3.22386 13.7763 3 13.5001 3H4.50012Z" fill="currentColor"/>' +
    '<path d="M4.50012 7C4.22398 7 4.00012 7.22386 4.00012 7.5C4.00012 7.77614 4.22398 8 4.50012 8H13.5001C13.7763 8 14.0001 7.77614 14.0001 7.5C14.0001 7.22386 13.7763 7 13.5001 7H4.50012Z" fill="currentColor"/>' +
    '<path d="M4.00012 11.5C4.00012 11.2239 4.22398 11 4.50012 11H13.5001C13.7763 11 14.0001 11.2239 14.0001 11.5C14.0001 11.7761 13.7763 12 13.5001 12H4.50012C4.22398 12 4.00012 11.7761 4.00012 11.5Z" fill="currentColor"/>' +
    '<path d="M1.99252 7.0237C1.98708 7.03693 1.98107 7.05297 1.97466 7.07228C1.88765 7.33436 1.60465 7.47627 1.34258 7.38925C1.0805 7.30223 0.938592 7.01924 1.02561 6.75717C1.0929 6.55452 1.19818 6.34771 1.38665 6.19826C1.58464 6.04124 1.80716 6 2.00013 6C2.54629 6 3.00012 6.46662 3.00012 7.08076C3.00012 7.22674 2.95378 7.35688 2.9166 7.4435C2.87563 7.53892 2.82247 7.63364 2.76796 7.72092C2.70939 7.81472 2.64218 7.91109 2.57234 8.00518C2.81425 8.04019 3.0001 8.24839 3.0001 8.5C3.0001 8.77614 2.77624 9 2.5001 9H1.50011C1.30033 9 1.11971 8.88107 1.04079 8.69753C0.961866 8.51402 0.999754 8.30114 1.13714 8.15612C1.30114 7.98029 1.4601 7.79959 1.61125 7.61257C1.73087 7.46458 1.84155 7.31648 1.91978 7.19122C1.95902 7.12839 1.98399 7.08095 1.99771 7.04899C1.99626 7.03878 1.99452 7.03 1.99252 7.0237Z" fill="currentColor"/>' +
    '<path d="M1.98672 10C1.57437 10 1.25185 10.2443 1.06118 10.5939C0.928946 10.8363 1.01827 11.14 1.2607 11.2723C1.37459 11.3344 1.502 11.3476 1.61881 11.319C1.59643 11.3765 1.58457 11.4384 1.58476 11.5019C1.58495 11.5641 1.59667 11.6246 1.61846 11.6809C1.50174 11.6524 1.37447 11.6657 1.2607 11.7277C1.01827 11.86 0.928946 12.1637 1.06118 12.4061L1.09705 12.4719C1.27464 12.7974 1.61587 13 1.98672 13C2.54784 13 3.00013 12.5319 3.00013 11.9754C3.00013 11.804 2.95033 11.6394 2.86058 11.4995C2.95382 11.3542 3.00013 11.1856 3.00013 11.0134C3.00013 10.4537 2.54641 10 1.98672 10Z" fill="currentColor"/>' +
    _E,
  'playbook': _S +
    '<path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1464 1.14645C10.9512 1.34171 10.9512 1.65829 11.1464 1.85355L12.2929 3H9.5C8.11929 3 7 4.11929 7 5.5V7.5C7 7.77614 7.22386 8 7.5 8C7.77614 8 8 7.77614 8 7.5V5.5C8 4.67157 8.67157 4 9.5 4H12.2929L11.1464 5.14645C10.9512 5.34171 10.9512 5.65829 11.1464 5.85355C11.3417 6.04882 11.6583 6.04882 11.8536 5.85355L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645Z" fill="currentColor"/>' +
    '<path d="M11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645L13 9.29289L14.1464 8.14645C14.3417 7.95118 14.6583 7.95118 14.8536 8.14645C15.0488 8.34171 15.0488 8.65829 14.8536 8.85355L13.7071 10L14.8536 11.1464C15.0488 11.3417 15.0488 11.6583 14.8536 11.8536C14.6583 12.0488 14.3417 12.0488 14.1464 11.8536L13 10.7071L11.8536 11.8536C11.6583 12.0488 11.3417 12.0488 11.1464 11.8536C10.9512 11.6583 10.9512 11.3417 11.1464 11.1464L12.2929 10L11.1464 8.85355C10.9512 8.65829 10.9512 8.34171 11.1464 8.14645Z" fill="currentColor"/>' +
    '<path d="M1.85355 4.14645C1.65829 3.95118 1.34171 3.95118 1.14645 4.14645C0.951184 4.34171 0.951184 4.65829 1.14645 4.85355L2.29289 6L1.14645 7.14645C0.951185 7.34171 0.951185 7.65829 1.14645 7.85355C1.34171 8.04882 1.65829 8.04882 1.85355 7.85355L3 6.70711L4.14645 7.85355C4.34171 8.04882 4.65829 8.04882 4.85355 7.85355C5.04882 7.65829 5.04882 7.34171 4.85355 7.14645L3.70711 6L4.85355 4.85355C5.04882 4.65829 5.04882 4.34171 4.85355 4.14645C4.65829 3.95118 4.34171 3.95118 4.14645 4.14645L3 5.29289L1.85355 4.14645Z" fill="currentColor"/>' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 10C6.11929 10 5 11.1193 5 12.5C5 13.8807 6.11929 15 7.5 15C8.88071 15 10 13.8807 10 12.5C10 11.1193 8.88071 10 7.5 10ZM6 12.5C6 11.6716 6.67157 11 7.5 11C8.32843 11 9 11.6716 9 12.5C9 13.3284 8.32843 14 7.5 14C6.67157 14 6 13.3284 6 12.5Z" fill="currentColor"/>' +
    _E,
  'details': _S +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M9.00051 2.49946C9.00055 1.67109 9.67157 1 10.5 1C11.1389 1 11.7534 1.36648 11.9415 2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H7.5C7.77614 2 8 2.22386 8 2.5C8 2.77614 7.77614 3 7.5 3H2.5C2.22386 3 2 3.22386 2 3.5V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V3.5C13 3.22386 12.7761 3 12.5 3H11.9999V9.49995C11.9999 9.57762 11.9819 9.65422 11.9471 9.72368L10.9466 11.7232C10.8619 11.8925 10.6887 11.9995 10.4994 11.9995C10.31 11.9994 10.1369 11.8924 10.0522 11.7231L9.05224 9.72306C9.01752 9.65361 8.99945 9.57703 8.99946 9.49938L9.00051 2.49946ZM10.5 2C10.2239 2 10.0005 2.22336 10.0005 2.49953L9.99948 9.38146L10.4996 10.3818L10.9999 9.38183V2.41457C10.9999 2.19556 10.837 2 10.5 2ZM3 5.5C3 5.22386 3.22386 5 3.5 5H7.5C7.77614 5 8 5.22386 8 5.5C8 5.77614 7.77614 6 7.5 6H3.5C3.22386 6 3 5.77614 3 5.5ZM3 7.5C3 7.22386 3.22386 7 3.5 7H7.5C7.77614 7 8 7.22386 8 7.5C8 7.77614 7.77614 8 7.5 8H3.5C3.22386 8 3 7.77614 3 7.5ZM3 9.5C3 9.22386 3.22386 9 3.5 9H7.5C7.77614 9 8 9.22386 8 9.5C8 9.77614 7.77614 10 7.5 10H3.5C3.22386 10 3 9.77614 3 9.5Z" fill="currentColor"/>' +
    _E,
  'financials': _S +
    '<path d="M1 2H3V1H1V2Z" fill="currentColor"/>' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.9659 3.31823C10.8921 3.12912 10.7113 3.0034 10.5083 3.00007C10.3053 2.99674 10.1205 3.11646 10.0405 3.30304L8.45612 7H6.86048L5.97444 4.34189C5.9088 4.14495 5.72829 4.00906 5.52088 4.00043C5.31347 3.99181 5.1223 4.11224 5.04053 4.30304L3.88469 7H1V8H3.45612L2.04053 11.303L2.95967 11.697L4.54408 8H6.13972L7.02576 10.6581C7.0914 10.8551 7.27191 10.9909 7.47932 10.9996C7.68673 11.0082 7.8779 10.8878 7.95967 10.697L9.11551 8H11.7195L12.0343 8.80677L12.9659 8.44323L12.7929 8H15V7H12.4027L10.9659 3.31823ZM11.3292 7L10.4784 4.81984L9.54408 7H11.3292ZM8.02754 8H7.19381L7.55857 9.09427L8.02754 8ZM5.80639 7L5.44163 5.90573L4.97266 7H5.80639Z" fill="currentColor"/>' +
    '<path d="M7 2H5V1H7V2Z" fill="currentColor"/>' +
    '<path d="M9 2H11V1H9V2Z" fill="currentColor"/>' +
    '<path d="M15 2H13V1H15V2Z" fill="currentColor"/>' +
    '<path d="M1 15H3V14H1V15Z" fill="currentColor"/>' +
    '<path d="M7 15H5V14H7V15Z" fill="currentColor"/>' +
    '<path d="M9 15H11V14H9V15Z" fill="currentColor"/>' +
    '<path d="M15 15H13V14H15V15Z" fill="currentColor"/>' +
    _E,
  'resource-assignments': _S +
    '<path d="M9.32402 7.121C10.0303 6.6792 10.5 5.89446 10.5 5C10.5 3.61929 9.38071 2.5 8 2.5C6.61929 2.5 5.5 3.61929 5.5 5C5.5 5.89446 5.96974 6.6792 6.67598 7.121C5.93378 7.27111 5.34817 7.55904 4.9113 7.97454C4.84146 8.04096 4.77632 8.10979 4.71564 8.18079C4.52671 7.86353 4.25408 7.59731 3.92982 7.39843C4.28257 7.03782 4.5 6.5443 4.5 6C4.5 4.89543 3.60457 4 2.5 4C1.39543 4 0.5 4.89543 0.5 6C0.5 6.5443 0.717432 7.03782 1.07018 7.39843C0.436489 7.78709 0 8.43296 0 9.21429V10C0 10.5523 0.447715 11 1 11H4V11.5C4 12.3284 4.67157 13 5.5 13H10.5C11.3284 13 12 12.3284 12 11.5V11H15C15.5523 11 16 10.5523 16 10V9.21429C16 8.43296 15.5635 7.78708 14.9298 7.39843C15.2826 7.03781 15.5 6.5443 15.5 6C15.5 4.89543 14.6046 4 13.5 4C12.3954 4 11.5 4.89543 11.5 6C11.5 6.5443 11.7174 7.03781 12.0702 7.39843C11.7459 7.5973 11.4733 7.86353 11.2844 8.1808C11.2237 8.1098 11.1585 8.04096 11.0887 7.97454C10.6518 7.55904 10.0662 7.27111 9.32402 7.121ZM8 6.5C7.17157 6.5 6.5 5.82843 6.5 5C6.5 4.17157 7.17157 3.5 8 3.5C8.82843 3.5 9.5 4.17157 9.5 5C9.5 5.82843 8.82843 6.5 8 6.5ZM3.5 6C3.5 6.55228 3.05228 7 2.5 7C1.94772 7 1.5 6.55228 1.5 6C1.5 5.44772 1.94772 5 2.5 5C3.05228 5 3.5 5.44772 3.5 6ZM12 9.21429C12 8.61319 12.5965 8 13.5 8C14.4035 8 15 8.61319 15 9.21429V10H12V9.21429ZM13.5 7C12.9477 7 12.5 6.55228 12.5 6C12.5 5.44772 12.9477 5 13.5 5C14.0523 5 14.5 5.44772 14.5 6C14.5 6.55228 14.0523 7 13.5 7ZM2.5 8C3.40351 8 4 8.61319 4 9.21429V10H1V9.21429C1 8.61319 1.59649 8 2.5 8ZM5 10.3571C5 9.65446 5.18762 9.0918 5.60047 8.69914C6.0176 8.30241 6.74747 8 8 8C9.25253 8 9.9824 8.30241 10.3995 8.69914C10.8124 9.0918 11 9.65446 11 10.3571V11.5C11 11.7761 10.7761 12 10.5 12H5.5C5.22386 12 5 11.7761 5 11.5V10.3571Z" fill="currentColor"/>' +
    _E,
  'demand-tasks': _S +
    '<path d="M4.85355 3.14645C5.04882 3.34171 5.04882 3.65829 4.85355 3.85355L2.85355 5.85355C2.65829 6.04882 2.34171 6.04882 2.14645 5.85355L1.14645 4.85355C0.951184 4.65829 0.951184 4.34171 1.14645 4.14645C1.34171 3.95118 1.65829 3.95118 1.85355 4.14645L2.5 4.79289L4.14645 3.14645C4.34171 2.95118 4.65829 2.95118 4.85355 3.14645Z" fill="currentColor"/>' +
    '<path d="M5 5.5C5 5.22386 5.22386 5 5.5 5H13.5C13.7761 5 14 5.22386 14 5.5C14 5.77614 13.7761 6 13.5 6H5.5C5.22386 6 5 5.77614 5 5.5Z" fill="currentColor"/>' +
    '<path d="M4.5 8H13.5C13.7761 8 14 8.22386 14 8.5C14 8.77614 13.7761 9 13.5 9H4.5C4.22386 9 4 8.77614 4 8.5C4 8.22386 4.22386 8 4.5 8Z" fill="currentColor"/>' +
    '<path d="M4.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H4.5C4.22386 12 4 11.7761 4 11.5C4 11.2239 4.22386 11 4.5 11Z" fill="currentColor"/>' +
    '<path d="M3 8.5C3 8.77614 2.77614 9 2.5 9C2.22386 9 2 8.77614 2 8.5C2 8.22386 2.22386 8 2.5 8C2.77614 8 3 8.22386 3 8.5Z" fill="currentColor"/>' +
    '<path d="M2.5 12C2.77614 12 3 11.7761 3 11.5C3 11.2239 2.77614 11 2.5 11C2.22386 11 2 11.2239 2 11.5C2 11.7761 2.22386 12 2.5 12Z" fill="currentColor"/>' +
    _E,
  'docs': _S +
    '<path d="M5 8.5C5 8.22386 5.22386 8 5.5 8H10.5C10.7761 8 11 8.22386 11 8.5C11 8.77614 10.7761 9 10.5 9H5.5C5.22386 9 5 8.77614 5 8.5Z" fill="currentColor"/>' +
    '<path d="M5.5 10C5.22386 10 5 10.2239 5 10.5C5 10.7761 5.22386 11 5.5 11H10.5C10.7761 11 11 10.7761 11 10.5C11 10.2239 10.7761 10 10.5 10H5.5Z" fill="currentColor"/>' +
    '<path d="M3.5 1C2.67157 1 2 1.67157 2 2.5V13.5C2 14.3284 2.67157 15 3.5 15H12.5C13.3284 15 14 14.3284 14 13.5V5.70095C14 5.28767 13.8295 4.89269 13.5287 4.60926L10.1318 1.40832C9.85346 1.14606 9.48549 1 9.10308 1H3.5ZM3 2.5C3 2.22386 3.22386 2 3.5 2H9V4.5C9 5.32843 9.67157 6 10.5 6H13V13.5C13 13.7761 12.7761 14 12.5 14H3.5C3.22386 14 3 13.7761 3 13.5V2.5ZM12.4852 5H10.5C10.2239 5 10 4.77614 10 4.5V2.65817L12.4852 5Z" fill="currentColor"/>' +
    _E,
  'smart-assessments': _S +
    '<path d="M3.08535 3H2.5C2.22386 3 2 3.22386 2 3.5V13.5C2 13.7761 2.22386 14 2.5 14H7.50801C7.69677 14.3531 7.93587 14.6882 8.22153 15H2.5C1.67157 15 1 14.3284 1 13.5V3.5C1 2.67157 1.67157 2 2.5 2H3.08535C3.29127 1.4174 3.84689 1 4.5 1H8.5C9.15311 1 9.70873 1.4174 9.91465 2H10.5C11.3284 2 12 2.67157 12 3.5V6C11.627 6 11.272 6.13864 11 6.38194V3.5C11 3.22386 10.7761 3 10.5 3H9.91465C9.70873 3.5826 9.15311 4 8.5 4H4.5C3.84689 4 3.29127 3.5826 3.08535 3ZM4 2.5C4 2.77614 4.22386 3 4.5 3H8.5C8.77614 3 9 2.77614 9 2.5C9 2.22386 8.77614 2 8.5 2H4.5C4.22386 2 4 2.22386 4 2.5Z" fill="currentColor"/>' +
    '<path d="M7 10.2058V8.66368L5.62346 10.2796L3.83914 8.63255C3.63623 8.44525 3.3199 8.4579 3.1326 8.66081C2.9453 8.86372 2.95795 9.18005 3.16086 9.36735L5.32753 11.3674C5.42751 11.4596 5.56078 11.5072 5.6966 11.4991C5.83242 11.4909 5.95905 11.4278 6.04729 11.3242L7 10.2058Z" fill="currentColor"/>' +
    '<path d="M12.4105 7.21453C12.317 7.08013 12.1637 7 12 7C11.8363 7 11.683 7.08013 11.5895 7.21453C11.4955 7.34966 11.1631 7.63354 10.6366 7.77983C10.1336 7.91958 9.47321 7.92668 8.72318 7.55257C8.56818 7.47526 8.38422 7.48367 8.23693 7.5748C8.08964 7.66593 8 7.8268 8 8V12C8 13.6255 9.29756 15.2782 11.8679 15.9822C11.9544 16.0059 12.0456 16.0059 12.1321 15.9822C14.7024 15.2782 16 13.6255 16 12V8C16 7.8268 15.9104 7.66593 15.7631 7.5748C15.6158 7.48367 15.4318 7.47526 15.2768 7.55257C14.5268 7.92668 13.8664 7.91958 13.3634 7.77983C12.8369 7.63354 12.5045 7.34966 12.4105 7.21453ZM9 12V8.72909C9.70742 8.92889 10.3592 8.89476 10.9043 8.74333C11.3395 8.62242 11.7162 8.42352 12 8.20323C12.2838 8.42352 12.6605 8.62242 13.0957 8.74333C13.6408 8.89476 14.2926 8.92889 15 8.72909V12C15 13.0152 14.1876 14.3386 12 14.9803C9.81243 14.3386 9 13.0152 9 12Z" fill="currentColor"/>' +
    _E,
  'similar-demands': _S +
    '<path d="M10.7269 10.0195C11.5219 9.06578 12.0002 7.83875 12.0002 6.5C12.0002 3.46243 9.53781 1 6.50024 1C3.46268 1 1.00024 3.46243 1.00024 6.5C1.00024 7.78743 1.44259 8.97154 2.18358 9.90865C2.22611 9.77925 2.25588 9.64396 2.2714 9.50425L2.30759 9.17856C2.33321 8.94797 2.40899 8.75473 2.51867 8.59886C2.18766 7.97222 2.00024 7.25799 2.00024 6.5C2.00024 4.01472 4.01496 2 6.50024 2C8.98553 2 11.0002 4.01472 11.0002 6.5C11.0002 8.63043 9.51978 10.4151 7.53152 10.8813C7.43756 11.0987 7.28772 11.2619 7.1099 11.3708C7.38703 11.4656 7.59024 11.6452 7.71954 11.8644C8.58034 11.6695 9.36455 11.2728 10.0198 10.7266L14.1467 14.8536C14.342 15.0489 14.6586 15.0489 14.8538 14.8536C15.0491 14.6583 15.0491 14.3417 14.8538 14.1465L10.7269 10.0195Z" fill="currentColor"/>' +
    '<path d="M6.27752 7.10371C6.12968 7.67968 5.67993 8.12943 5.10396 8.27727L4.5829 8.41102C4.4727 8.43931 4.4727 8.59582 4.5829 8.62411L5.10402 8.75787C5.67995 8.90571 6.12969 9.35542 6.27756 9.93135L6.41127 10.4522C6.43956 10.5624 6.59607 10.5624 6.62436 10.4522L6.75808 9.93135C6.90594 9.35543 7.35568 8.90571 7.93162 8.75787L8.45273 8.62411C8.56293 8.59582 8.56293 8.43931 8.45273 8.41102L7.93167 8.27727C7.35571 8.12943 6.90595 7.67968 6.75811 7.10371L6.62436 6.58265C6.59608 6.47245 6.43956 6.47245 6.41127 6.58265L6.27752 7.10371Z" fill="currentColor"/>' +
    '<path d="M0.614931 12.265C2.00947 12.1101 3.11034 11.0092 3.26529 9.61468L3.30148 9.28899C3.32783 9.05177 3.67267 9.05177 3.69903 9.28899L3.73522 9.61468C3.89017 11.0092 4.99103 12.1101 6.38557 12.265L6.71126 12.3012C6.94848 12.3276 6.94848 12.6724 6.71126 12.6988L6.38557 12.735C4.99103 12.8899 3.89017 13.9908 3.73522 15.3853L3.69903 15.711C3.67267 15.9482 3.32783 15.9482 3.30148 15.711L3.26529 15.3853C3.11034 13.9908 2.00947 12.8899 0.61493 12.735L0.289241 12.6988C0.0520232 12.6724 0.052024 12.3276 0.289242 12.3012L0.614931 12.265Z" fill="currentColor"/>' +
    _E,
};

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
      React.createElement('span', { style: { color: '#293e40' } }, demand.name)
    ),

    // Two-column layout
    React.createElement('div', { className: 'snp-detail-cols' },

      // Left sidebar
      React.createElement('div', { className: 'snp-sidebar' },
        React.createElement('div', { className: 'snp-sidebar-top' },
          React.createElement('div', { className: 'snp-sidebar-demand-label' }, 'Current demand'),
          React.createElement('div', { className: 'snp-sidebar-demand-title' }, demand.name),
          React.createElement('div', { className: 'snp-sidebar-meta-row' },
            React.createElement('div', { className: 'snp-sidebar-meta-item' },
              React.createElement('span', { className: 'snp-sidebar-meta-lbl' }, 'State'),
              React.createElement('span', { className: 'snp-sidebar-meta-val' }, demand.state)
            ),
            React.createElement('span', { className: 'snp-sidebar-meta-sep' }, '|'),
            React.createElement('div', { className: 'snp-sidebar-meta-item' },
              React.createElement('span', { className: 'snp-sidebar-meta-lbl' }, 'Type'),
              React.createElement('span', { className: 'snp-sidebar-meta-val' }, 'Project')
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
              React.createElement('div', { className: 'snp-nav-item-bar' }),
              React.createElement('div', { className: 'snp-nav-item-content' },
                React.createElement('span', {
                  className: 'snp-nav-icon',
                  dangerouslySetInnerHTML: { __html: NAV_SVG[item.id] || '' },
                }),
                item.label
              )
            );
          })
        ),
        React.createElement('div', { className: 'snp-sidebar-collapse' },
          React.createElement('span', { dangerouslySetInnerHTML: { __html: '<svg width="11" height="12" viewBox="0 0 11 12" fill="none"><path d="M7.87629 2.17075C8.05813 2.37857 8.03707 2.69445 7.82925 2.8763L4.2593 6.00001L7.82925 9.12372C8.03707 9.30556 8.05813 9.62144 7.87629 9.82926C7.69445 10.0371 7.37857 10.0581 7.17075 9.8763L3.17075 6.3763C3.06224 6.28135 3 6.14419 3 6.00001C3 5.85583 3.06224 5.71866 3.17075 5.62372L7.17075 2.12372C7.37857 1.94188 7.69445 1.96294 7.87629 2.17075Z" fill="#454D5B"/></svg>' } })
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
