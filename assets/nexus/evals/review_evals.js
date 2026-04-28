#!/usr/bin/env node
/**
 * review_evals.js — Interactive eval review server.
 *
 * Reads an iteration directory produced by run_benchmark.js and serves a
 * side-by-side review UI: with_skill vs without_skill HTML outputs rendered
 * live in iframes, grading assertions, and a feedback textarea that
 * auto-saves to feedback.json.
 *
 * Usage:
 *   node skills/nexus/evals/review_evals.js \
 *     --workspace skills/nexus/evals/motion-workspace \
 *     [--iteration N]   # defaults to latest
 *     [--port 3117]
 *
 * Outputs:
 *   <workspace>/iteration-N/feedback.json
 */

import {createServer} from 'http';
import {spawnSync} from 'child_process';
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {parseArgs} from 'util';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printUsage() {
  console.error(`
Usage:
  node skills/nexus/review_evals.js \\
    --workspace <path/to/workspace> \\
    [--iteration N] [--port 3117]
`);
}

let args;
try {
  ({values: args} = parseArgs({
    options: {
      workspace: {type: 'string'},
      iteration: {type: 'string'},
      port: {type: 'string', default: '3117'}
    }
  }));
} catch (err) {
  console.error(`Error: ${err.message}`);
  printUsage();
  process.exit(1);
}

if (!args.workspace) {
  console.error('Error: --workspace is required');
  printUsage();
  process.exit(1);
}

const workspaceDir = path.resolve(args.workspace);
if (!existsSync(workspaceDir)) {
  console.error(`Error: workspace not found: ${workspaceDir}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Iteration discovery
// ---------------------------------------------------------------------------

function resolveIterationDir(workspace, iterationArg) {
  const entries = readdirSync(workspace, {withFileTypes: true});
  const iterDirs = entries
    .filter(e => e.isDirectory() && /^iteration-\d+/.test(e.name))
    .sort((a, b) => {
      const aNum = parseInt(a.name.match(/^iteration-(\d+)/)[1], 10);
      const bNum = parseInt(b.name.match(/^iteration-(\d+)/)[1], 10);
      return aNum - bNum;
    });

  if (iterDirs.length === 0) return null;

  if (iterationArg) {
    const n = parseInt(iterationArg, 10);
    const match = iterDirs.find(
      e => parseInt(e.name.match(/^iteration-(\d+)/)[1], 10) === n
    );
    return match ? match.name : null;
  }

  return iterDirs[iterDirs.length - 1].name;
}

const iterationDirName = resolveIterationDir(workspaceDir, args.iteration);

if (!iterationDirName) {
  console.error('Error: no iteration directories found in workspace');
  process.exit(1);
}

const iterationDir = path.join(workspaceDir, iterationDirName);
if (!existsSync(iterationDir)) {
  console.error(`Error: iteration directory not found: ${iterationDir}`);
  process.exit(1);
}

const feedbackPath = path.join(iterationDir, 'feedback.json');
const port = parseInt(args.port, 10);

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

function readJsonSafe(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function htmlToDataUri(filePath) {
  try {
    const content = readFileSync(filePath);
    return `data:text/html;base64,${content.toString('base64')}`;
  } catch {
    return null;
  }
}

function loadEvals() {
  const entries = readdirSync(iterationDir, {withFileTypes: true});
  const evalDirs = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .sort((a, b) => {
      const aId =
        readJsonSafe(path.join(iterationDir, a.name, 'eval_metadata.json'))
          ?.eval_id ?? 999;
      const bId =
        readJsonSafe(path.join(iterationDir, b.name, 'eval_metadata.json'))
          ?.eval_id ?? 999;
      return aId - bId;
    });

  const evals = [];
  for (const entry of evalDirs) {
    const evalDir = path.join(iterationDir, entry.name);
    const metadata = readJsonSafe(path.join(evalDir, 'eval_metadata.json'));
    if (!metadata) continue;

    const loadConfig = config => {
      const configDir = path.join(evalDir, config);
      if (!existsSync(configDir)) return null;

      // html-artifacts takes priority over outputs
      const htmlPaths = [
        path.join(configDir, 'html-artifacts', 'solution.html'),
        path.join(configDir, 'outputs', 'solution.html')
      ];
      const htmlPath = htmlPaths.find(p => existsSync(p)) ?? null;

      return {
        dataUri: htmlPath ? htmlToDataUri(htmlPath) : null,
        timing: readJsonSafe(path.join(configDir, 'timing.json')),
        grading: readJsonSafe(path.join(configDir, 'grading.json'))
      };
    };

    evals.push({
      id: metadata.eval_id ?? evals.length,
      name: metadata.eval_name ?? entry.name,
      prompt: metadata.prompt ?? '(no prompt)',
      assertions: metadata.assertions ?? [],
      with_skill: loadConfig('with_skill'),
      without_skill: loadConfig('without_skill')
    });
  }

  return evals;
}

function loadFeedback() {
  const data = readJsonSafe(feedbackPath);
  if (!data?.reviews) return {};
  return Object.fromEntries(data.reviews.map(r => [r.eval_id, r.feedback]));
}

function saveFeedback(evalId, text) {
  const existing = readJsonSafe(feedbackPath) ?? {reviews: []};
  const idx = existing.reviews.findIndex(r => r.eval_id === evalId);
  const entry = {
    eval_id: evalId,
    feedback: text,
    timestamp: new Date().toISOString()
  };
  if (idx >= 0) existing.reviews[idx] = entry;
  else existing.reviews.push(entry);
  existing.status = 'in_progress';
  writeFileSync(feedbackPath, JSON.stringify(existing, null, 2));
}

// ---------------------------------------------------------------------------
// HTML page
// ---------------------------------------------------------------------------

/**
 * Embed an object as JSON inside a <script> block safely.
 * Escapes </ so </script> in content cannot terminate the block early.
 */
function safeJson(obj) {
  return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

function buildPage(evals, feedback) {
  const data = {evals, feedback, iterationDirName, workspace: workspaceDir};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Eval Review \u00b7 iteration-${iterationDirName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #f5f4f0; --surface: #fff; --border: #e2e0d8;
      --text: #1a1a18; --muted: #888680; --accent: #d97757;
      --green: #4e8a4e; --red: #c04040; --radius: 8px;
    }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #1a1a18; color: #f5f4f0; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; position: sticky; top: 0; z-index: 100; }
    header h1 { font-size: 0.95rem; font-weight: 600; }
    .nav-controls { display: flex; align-items: center; gap: 12px; }
    .nav-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #f5f4f0; padding: 5px 14px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; }
    .nav-btn:hover { background: rgba(255,255,255,0.2); }
    .nav-btn:disabled { opacity: 0.35; cursor: default; }
    .counter { font-size: 0.82rem; color: rgba(255,255,255,0.6); min-width: 54px; text-align: center; }
    .submit-btn { background: var(--accent); border: none; color: #fff; padding: 6px 18px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
    .submit-btn:hover { opacity: 0.88; }
    main { flex: 1; width: 100%; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
    .prompt-card { padding: 16px 20px; }
    .prompt-card p { font-size: 0.95rem; line-height: 1.6; }
    .outputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .output-card { overflow: hidden; display: flex; flex-direction: column; }
    .output-card-header { padding: 10px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .config-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
    .config-label.with { color: var(--green); }
    .config-label.without { color: var(--muted); }
    .stats { font-size: 0.75rem; color: var(--muted); }
    .output-iframe { width: 100%; height: 500px; border: none; display: block; }
    .empty-msg { padding: 48px; text-align: center; color: var(--muted); font-size: 0.9rem; }
    .assertions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .assertions-card { padding: 16px; }
    .assertions-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .pass-badge { font-size: 0.8rem; font-weight: 700; padding: 2px 9px; border-radius: 12px; }
    .pass-badge.high { background: #e8f3e8; color: var(--green); }
    .pass-badge.low  { background: #fceaea; color: var(--red); }
    .assertion { display: flex; gap: 10px; align-items: flex-start; padding: 7px 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; line-height: 1.4; }
    .assertion:last-child { border-bottom: none; padding-bottom: 0; }
    .a-icon { font-size: 1rem; flex-shrink: 0; }
    .a-body { flex: 1; }
    .evidence { font-size: 0.78rem; color: var(--muted); margin-top: 3px; font-style: italic; }
    .feedback-card { padding: 16px 20px; }
    .feedback-card textarea { width: 100%; min-height: 90px; border: 1px solid var(--border); border-radius: 5px; padding: 10px 12px; font-size: 0.9rem; font-family: inherit; resize: vertical; outline: none; margin-top: 8px; }
    .feedback-card textarea:focus { border-color: var(--accent); }
    .save-status { font-size: 0.75rem; color: var(--muted); margin-top: 6px; height: 16px; }
    .save-status.saved { color: var(--green); }
    @media (max-width: 900px) { .outputs-grid, .assertions-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>

<header>
  <h1>Eval Review \u2014 iteration-${iterationDirName}</h1>
  <div class="nav-controls">
    <button class="nav-btn" id="prevBtn" onclick="navigate(-1)">\u2190 Prev</button>
    <span class="counter" id="counter"></span>
    <button class="nav-btn" id="nextBtn" onclick="navigate(1)">Next \u2192</button>
    <button class="submit-btn" onclick="submitAll()">Submit All Reviews</button>
  </div>
</header>

<main>
  <div class="card prompt-card">
    <div class="label">Prompt</div>
    <p id="promptText"></p>
  </div>

  <div class="outputs-grid">
    <div class="card output-card">
      <div class="output-card-header">
        <span class="config-label with">With Skill</span>
        <span class="stats" id="withStats"></span>
      </div>
      <div id="withOutput"></div>
    </div>
    <div class="card output-card">
      <div class="output-card-header">
        <span class="config-label without">Without Skill</span>
        <span class="stats" id="withoutStats"></span>
      </div>
      <div id="withoutOutput"></div>
    </div>
  </div>

  <div class="assertions-grid" id="assertionsGrid"></div>

  <div class="card feedback-card">
    <div class="label">Your Feedback</div>
    <textarea id="feedbackText" placeholder="Notes, observations, what worked or didn't..."></textarea>
    <div class="save-status" id="saveStatus"></div>
  </div>
</main>

<script>
const DATA = ${safeJson(data)};
const evals    = DATA.evals;
const feedback = DATA.feedback;

let current   = 0;
let saveTimer = null;

function navigate(dir) {
  saveCurrent();
  current = Math.max(0, Math.min(evals.length - 1, current + dir));
  render();
}

function render() {
  const ev = evals[current];
  document.getElementById('counter').textContent = (current + 1) + ' / ' + evals.length;
  document.getElementById('prevBtn').disabled = current === 0;
  document.getElementById('nextBtn').disabled = current === evals.length - 1;
  document.getElementById('promptText').textContent = ev.prompt;
  renderOutput('with',    'withOutput',    'withStats',    ev.with_skill);
  renderOutput('without', 'withoutOutput', 'withoutStats', ev.without_skill);
  renderAssertions(ev);
  document.getElementById('feedbackText').value = feedback[ev.id] ?? '';
  const s = document.getElementById('saveStatus');
  s.textContent = '';
  s.className = 'save-status';
}

function renderOutput(side, outputId, statsId, config) {
  const container = document.getElementById(outputId);
  const statsEl   = document.getElementById(statsId);

  // Clear children safely
  while (container.firstChild) container.removeChild(container.firstChild);
  statsEl.textContent = '';

  if (!config) {
    const msg = document.createElement('div');
    msg.className = 'empty-msg';
    msg.textContent = 'No data';
    container.appendChild(msg);
    return;
  }

  // Stats line
  const parts = [];
  if (config.grading?.summary) {
    const s = config.grading.summary;
    parts.push(s.passed + '/' + s.total + ' passed');
  }
  if (config.timing?.total_duration_seconds != null) {
    parts.push(config.timing.total_duration_seconds.toFixed(1) + 's');
  }
  if (config.timing?.total_tokens) {
    parts.push(config.timing.total_tokens.toLocaleString() + ' tokens');
  }
  statsEl.textContent = parts.join(' \u00b7 ');

  if (config.dataUri) {
    const iframe = document.createElement('iframe');
    iframe.className = 'output-iframe';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.src = config.dataUri;
    container.appendChild(iframe);
  } else {
    const msg = document.createElement('div');
    msg.className = 'empty-msg';
    msg.textContent = 'No HTML output';
    container.appendChild(msg);
  }
}

function renderAssertions(ev) {
  const grid = document.getElementById('assertionsGrid');
  while (grid.firstChild) grid.removeChild(grid.firstChild);
  if (!ev.assertions?.length) return;

  for (const side of ['with_skill', 'without_skill']) {
    const config  = ev[side];
    const grading = config?.grading;
    const label   = side === 'with_skill' ? 'With Skill' : 'Without Skill';

    const card = document.createElement('div');
    card.className = 'card assertions-card';

    const header = document.createElement('div');
    header.className = 'assertions-header';

    const lbl = document.createElement('div');
    lbl.className = 'label';
    lbl.textContent = label + ' \u2014 Assertions';
    header.appendChild(lbl);

    if (grading?.summary) {
      const s   = grading.summary;
      const pct = s.total > 0 ? Math.round(s.passed / s.total * 100) : 0;
      const badge = document.createElement('span');
      badge.className = 'pass-badge ' + (pct >= 80 ? 'high' : 'low');
      badge.textContent = pct + '%';
      header.appendChild(badge);
    }
    card.appendChild(header);

    const expectations = grading?.expectations ?? [];
    ev.assertions.forEach((text, i) => {
      const exp    = expectations[i];
      const passed = exp?.passed;

      const row = document.createElement('div');
      row.className = 'assertion';

      const icon = document.createElement('span');
      icon.className = 'a-icon';
      icon.textContent = passed === true ? '\u2705' : passed === false ? '\u274c' : '\u2013';
      row.appendChild(icon);

      const body = document.createElement('div');
      body.className = 'a-body';

      const textNode = document.createTextNode(text);
      body.appendChild(textNode);

      if (exp?.evidence) {
        const ev_div = document.createElement('div');
        ev_div.className = 'evidence';
        ev_div.textContent = exp.evidence;
        body.appendChild(ev_div);
      }
      row.appendChild(body);
      card.appendChild(row);
    });

    grid.appendChild(card);
  }
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

function saveCurrent() {
  const ev   = evals[current];
  const text = document.getElementById('feedbackText').value;
  feedback[ev.id] = text;
  persistFeedback(ev.id, text);
}

function persistFeedback(evalId, text) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fetch('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eval_id: evalId, feedback: text }),
    })
    .then(r => { if (r.ok) showSaved(); })
    .catch(() => {});
  }, 600);
}

function showSaved() {
  const el = document.getElementById('saveStatus');
  el.textContent = 'Saved';
  el.className = 'save-status saved';
  setTimeout(() => { el.textContent = ''; el.className = 'save-status'; }, 2000);
}

document.getElementById('feedbackText').addEventListener('input', () => {
  const ev = evals[current];
  feedback[ev.id] = document.getElementById('feedbackText').value;
  persistFeedback(ev.id, feedback[ev.id]);
});

function submitAll() {
  saveCurrent();
  fetch('/submit', { method: 'POST' })
    .then(r => r.json())
    .then(d => alert('Reviews saved to:\\n' + d.path))
    .catch(() => alert('Error saving reviews'));
}

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigate(-1);
});

render();
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const evals = loadEvals();
    const feedback = loadFeedback();
    const html = buildPage(evals, feedback);
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
    return;
  }

  if (req.method === 'POST' && req.url === '/feedback') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const {eval_id, feedback} = JSON.parse(body);
        saveFeedback(eval_id, feedback);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok: true}));
      } catch {
        res.writeHead(400);
        res.end('Bad request');
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/submit') {
    const existing = readJsonSafe(feedbackPath) ?? {reviews: []};
    existing.status = 'complete';
    writeFileSync(feedbackPath, JSON.stringify(existing, null, 2));
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ok: true, path: feedbackPath}));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Eval Review  : ${url}`);
  console.log(`Workspace    : ${workspaceDir}`);
  console.log(`Iteration    : iteration-${iterationDirName}`);
  console.log(`Feedback     : ${feedbackPath}`);
  console.log();
  console.log('Navigate with arrow keys or Prev/Next buttons.');
  console.log('Feedback auto-saves. Press Ctrl+C to stop.\n');

  const open =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open';
  try {
    spawnSync(open, [url], {stdio: 'ignore'});
  } catch {
    /* ignore */
  }
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is in use. Try --port XXXX`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
