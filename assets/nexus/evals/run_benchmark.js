#!/usr/bin/env node
/**
 * run_benchmark.js — Automated skill benchmark runner.
 *
 * For each case in evals.json, runs Claude twice (with_skill / without_skill),
 * grades outputs against assertions using the Anthropic API, and produces
 * iteration-N/ with grading.json, timing.json, and benchmark.json.
 *
 * Usage:
 *   node skills/nexus/evals/run_benchmark.js \
 *     --evals  skills/nexus/evals/motion-workspace/evals/evals.json \
 *     --skill  skills/nexus/skills/motion/SKILL.md \
 *     --workspace skills/nexus/evals/motion-workspace \
 *     [--iteration N]        # auto-detected if omitted
 *     [--ids 1,3,7]          # run specific cases only
 *     [--model claude-sonnet-4-6]
 *     [--workers 2]          # parallel case pairs
 *
 * Requirements:
 *   npm install @anthropic-ai/sdk
 *
 * Auth:
 *   Requires ANTHROPIC_API_KEY env var  OR  a long-lived Claude Code token
 *   created by running:  claude setup-token
 *
 * Fixture files referenced in evals.json must exist under the workspace
 * directory before running (e.g. evals/fixtures/eval-1-modal.html).
 */

import Anthropic from '@anthropic-ai/sdk';
import {spawn} from 'child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'fs';
import path from 'path';
import {parseArgs} from 'util';

// ---------------------------------------------------------------------------
// Shared CLI subprocess helper — async, pipes prompt via stdin
// ---------------------------------------------------------------------------

function runClaudeCli(prompt, {cwd, model, timeout = 120_000} = {}) {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--output-format', 'json'];
    if (model && model !== 'default') args.push('--model', model);
    const env = {...process.env};
    delete env.CLAUDECODE;

    const proc = spawn('claude', args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    proc.stdin.write(prompt);
    proc.stdin.end();

    let stdout = '';
    let stderr = '';
    let killed = false;
    proc.stdout.on('data', chunk => {
      stdout += chunk;
    });
    proc.stderr.on('data', chunk => {
      stderr += chunk;
    });

    const timer = setTimeout(() => {
      killed = true;
      proc.kill('SIGTERM');
    }, timeout);

    proc.on('close', code => {
      clearTimeout(timer);
      if (killed) {
        reject(new Error('timeout'));
      } else {
        resolve({stdout: stdout.trim(), stderr: stderr.trim(), code});
      }
    });

    proc.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// ---------------------------------------------------------------------------
// Executor — build prompt, call via SDK or claude -p subprocess
// ---------------------------------------------------------------------------

function buildExecutorPrompt(
  taskPrompt,
  fixturePaths,
  skillPath,
  inlineFiles = true
) {
  const lines = [];

  if (skillPath && existsSync(skillPath)) {
    if (inlineFiles) {
      const skillText = readFileSync(skillPath, 'utf8');
      lines.push(`<skill>\n${skillText}\n</skill>\n`);
      lines.push(
        'Follow the guidelines in the skill above for your implementation.\n'
      );
    } else {
      lines.push(
        `Read the skill file at ${skillPath} and follow its guidelines.\n`
      );
      lines.push(
        'IMPORTANT: The skill file may reference additional documents, examples, ' +
          'checklists, or patterns. Read ALL referenced files to understand the ' +
          'full skill context before generating your solution.\n'
      );
    }
  }

  lines.push(`Task: ${taskPrompt}\n`);

  if (!skillPath) {
    lines.push(
      'The output must be WCAG 2.2 compliant and meet all standards.\n'
    );
  }

  if (fixturePaths.length > 0) {
    if (inlineFiles) {
      for (const fp of fixturePaths) {
        if (existsSync(fp)) {
          const content = readFileSync(fp, 'utf8');
          lines.push(
            `<file name="${path.basename(fp)}">\n${content}\n</file>\n`
          );
        }
      }
    } else {
      lines.push(
        `Read the following input file(s) before starting:\n${fixturePaths.map(fp => `  - ${fp}`).join('\n')}\n`
      );
    }
  }

  lines.push(
    'Respond with your complete solution as a single, self-contained HTML file. ' +
      'Output ONLY the raw HTML — no markdown code fences, no explanation, no preamble. ' +
      'Start your response with <!DOCTYPE html> and end with </html>.'
  );

  return lines.join('\n');
}

async function runExecutorSdk(prompt, model, client, timeout) {
  const t0 = Date.now();
  try {
    const response = await Promise.race([
      withRetry(() =>
        client.messages.create({
          model,
          max_tokens: 8192,
          messages: [{role: 'user', content: prompt}]
        })
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeout * 1000)
      )
    ]);
    const elapsedMs = Date.now() - t0;
    const resultText = response.content?.[0]?.text ?? '';
    const totalTokens =
      (response.usage?.input_tokens ?? 0) +
      (response.usage?.output_tokens ?? 0);
    return {
      duration_ms: elapsedMs,
      total_duration_seconds: Math.round(elapsedMs / 100) / 10,
      total_tokens: totalTokens,
      result_text: resultText
    };
  } catch (exc) {
    const elapsedMs = Date.now() - t0;
    return {
      duration_ms: elapsedMs,
      total_duration_seconds: Math.round(elapsedMs / 100) / 10,
      total_tokens: 0,
      error: exc.message,
      result_text: ''
    };
  }
}

async function runExecutorSubprocess(prompt, cwd, model, timeout) {
  const t0 = Date.now();
  try {
    const {stdout} = await runClaudeCli(prompt, {
      cwd,
      model,
      timeout: timeout * 1000
    });
    const elapsedMs = Date.now() - t0;

    let durationMs = elapsedMs;
    let totalTokens = 0;
    let resultText = '';

    try {
      const data = JSON.parse(stdout);
      durationMs = data.duration_ms ?? elapsedMs;
      const usage = data.usage ?? {};
      totalTokens = (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0);
      resultText = data.result ?? '';
      if (resultText.startsWith('Not logged in')) {
        return {
          duration_ms: durationMs,
          total_duration_seconds: Math.round(durationMs / 100) / 10,
          total_tokens: 0,
          error: 'not_logged_in',
          result_text: ''
        };
      }
    } catch {
      resultText = stdout;
    }

    return {
      duration_ms: durationMs,
      total_duration_seconds: Math.round(durationMs / 100) / 10,
      total_tokens: totalTokens,
      result_text: resultText
    };
  } catch (exc) {
    const elapsedMs = Date.now() - t0;
    return {
      duration_ms: elapsedMs,
      total_duration_seconds: Math.round(elapsedMs / 100) / 10,
      total_tokens: 0,
      error: exc.message,
      result_text: ''
    };
  }
}

async function runExecutor(prompt, cwd, model, client, timeout, useSdk) {
  if (useSdk) return runExecutorSdk(prompt, model, client, timeout);
  return runExecutorSubprocess(prompt, cwd, model, timeout);
}

// ---------------------------------------------------------------------------
// Grader — evaluate executor output against assertions
// ---------------------------------------------------------------------------

const GRADER_PROMPT = `\
You are a precise accessibility code grader. Evaluate each assertion against the solution HTML below.
Be evidence-based — quote specific attributes, elements, or code from the solution.

Task: {case_name}

Assertions to evaluate:
{numbered_assertions}

--- solution.html ---
{solution_html}

Return ONLY the following JSON (no markdown fences, no text outside the JSON object):
{
  "summary": {"passed": <int>, "failed": <int>, "total": <int>},
  "expectations": [
    {"text": "<assertion text>", "passed": <true|false>, "evidence": "<quote or explanation>"}
  ]
}`;

async function gradeOutput(
  caseName,
  assertions,
  artifactsDir,
  model,
  client,
  useSdk,
  cwd
) {
  const solutionPath = path.join(artifactsDir, 'solution.html');
  const solutionHtml = existsSync(solutionPath)
    ? readFileSync(solutionPath, 'utf8')
    : '(no solution.html produced)';

  const numbered = assertions.map((a, i) => `${i + 1}. ${a}`).join('\n');
  const prompt = GRADER_PROMPT.replace('{case_name}', caseName)
    .replace('{numbered_assertions}', numbered)
    .replace('{solution_html}', solutionHtml.slice(0, 12_000));

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let text;
      if (useSdk) {
        const response = await withRetry(() =>
          client.messages.create({
            model,
            max_tokens: 4096,
            messages: [{role: 'user', content: prompt}]
          })
        );
        text = response.content?.[0]?.text?.trim() ?? '';
      } else {
        const {stdout: rawOut} = await runClaudeCli(prompt, {
          cwd,
          model,
          timeout: 120_000
        });
        let parsed;
        try {
          parsed = JSON.parse(rawOut);
        } catch {
          parsed = {};
        }
        text = parsed.result ?? rawOut;
      }

      text = text
        .replace(/^```(?:json)?\s*/m, '')
        .replace(/\s*```$/m, '')
        .trim();
      const grading = JSON.parse(text);
      if (!('summary' in grading) || !('expectations' in grading)) {
        throw new Error('Invalid grading schema');
      }
      return grading;
    } catch (exc) {
      if (attempt === 2) {
        return {
          summary: {
            passed: 0,
            failed: assertions.length,
            total: assertions.length
          },
          expectations: assertions.map(a => ({
            text: a,
            passed: false,
            evidence: `Grader error: ${exc.message}`
          })),
          grader_error: exc.message
        };
      }
      await sleep(2 ** attempt * 1000);
    }
  }
}

// ---------------------------------------------------------------------------
// Directory helpers
// ---------------------------------------------------------------------------

function nextIteration(workspace) {
  const entries = readdirSync(workspace, {withFileTypes: true});
  const nums = entries
    .filter(e => e.isDirectory() && /^iteration-\d+/.test(e.name))
    .map(e => parseInt(e.name.match(/^iteration-(\d+)/)[1], 10))
    .sort((a, b) => a - b);
  return nums.length > 0 ? nums[nums.length - 1] + 1 : 1;
}

function makeRunDirs(iterationDir, caseName) {
  for (const config of ['with_skill', 'without_skill']) {
    mkdirSync(path.join(iterationDir, caseName, config, 'outputs'), {
      recursive: true
    });
    mkdirSync(path.join(iterationDir, caseName, config, 'html-artifacts'), {
      recursive: true
    });
  }
}

// ---------------------------------------------------------------------------
// Concurrency helper (equivalent to ThreadPoolExecutor)
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async fn on transient Anthropic API errors (429, 500, 529).
 * Uses exponential backoff with jitter to avoid thundering herd on retry.
 */
async function withRetry(fn, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.status ?? err.statusCode;
      const isRetryable = status === 429 || status === 500 || status === 529;
      if (!isRetryable || attempt === maxAttempts - 1) throw err;
      // Exponential backoff: 2s, 4s, 8s, 16s — plus up to 1s of random jitter
      const delay = Math.min(
        2000 * 2 ** attempt + Math.random() * 1000,
        30_000
      );
      console.warn(
        `  [retry] API error ${status} on attempt ${attempt + 1}/${maxAttempts} — waiting ${Math.round(delay / 1000)}s`
      );
      await sleep(delay);
    }
  }
}

/**
 * Run fn(item) for each item with at most maxWorkers in-flight at once.
 * Returns array of {ok, value} | {ok: false, error} in original order.
 */
async function runConcurrent(items, maxWorkers, fn) {
  const results = new Array(items.length);
  // qi is read/incremented synchronously before any await — safe in single-threaded JS
  let qi = 0;

  async function worker() {
    while (qi < items.length) {
      const idx = qi++;
      try {
        results[idx] = {ok: true, value: await fn(items[idx], idx)};
      } catch (err) {
        results[idx] = {ok: false, error: err};
      }
    }
  }

  await Promise.all(
    Array.from({length: Math.min(maxWorkers, items.length)}, worker)
  );
  return results;
}

// ---------------------------------------------------------------------------
// Single benchmark case runner (with_skill + without_skill run in parallel)
// ---------------------------------------------------------------------------

async function runBenchmarkCase({
  caseDef,
  skillPath,
  workspaceDir,
  iterationDir,
  model,
  graderModel,
  client,
  executorTimeout,
  useSdk
}) {
  const caseName = caseDef.eval_name;
  const assertions = caseDef.assertions ?? [];

  const fixturePaths = (caseDef.files ?? []).map(f =>
    path.resolve(workspaceDir, f)
  );
  const missing = fixturePaths.filter(p => !existsSync(p));
  if (missing.length > 0) {
    throw new Error(`Missing fixtures: ${missing.join(', ')}`);
  }

  makeRunDirs(iterationDir, caseName);
  const caseDir = path.join(iterationDir, caseName);

  writeFileSync(
    path.join(caseDir, 'eval_metadata.json'),
    JSON.stringify(
      {
        eval_id: caseDef.id,
        eval_name: caseName,
        prompt: caseDef.prompt,
        assertions
      },
      null,
      2
    )
  );

  async function runConfig(config, useSkill) {
    const configDir = path.join(caseDir, config);
    const artifactsDir = path.join(configDir, 'html-artifacts');

    const prompt = buildExecutorPrompt(
      caseDef.prompt,
      fixturePaths,
      useSkill ? path.resolve(skillPath) : null,
      useSdk
    );

    const timing = await runExecutor(
      prompt,
      workspaceDir,
      model ?? 'claude-sonnet-4-6',
      client,
      executorTimeout,
      useSdk
    );
    writeFileSync(
      path.join(configDir, 'timing.json'),
      JSON.stringify(timing, null, 2)
    );

    // Extract HTML from result_text and save as solution.html for the grader
    const resultText = timing.result_text ?? '';
    let doctypeIdx = resultText.toLowerCase().indexOf('<!doctype html');
    if (doctypeIdx === -1)
      doctypeIdx = resultText.toLowerCase().indexOf('<html');
    if (doctypeIdx !== -1) {
      const htmlContent = resultText
        .slice(doctypeIdx)
        .replace(/\s*```\s*$/, '')
        .replace(/`★ Insight\s*─+[^`]*─+`[\s\S]*?(?=\n`─|$)/g, '')
        .replace(/★ Insight\s*─+[\s\S]*?─+/g, '')
        .trim();
      writeFileSync(path.join(artifactsDir, 'solution.html'), htmlContent);
    }

    const grading = await gradeOutput(
      caseName,
      assertions,
      artifactsDir,
      graderModel,
      client,
      useSdk,
      workspaceDir
    );

    const summary = grading.summary ?? {};
    const passed = summary.passed ?? 0;
    const total = summary.total ?? assertions.length;
    const passRate =
      total > 0 ? Math.round((passed / total) * 10000) / 10000 : 0.0;
    grading.summary.pass_rate = passRate;
    writeFileSync(
      path.join(configDir, 'grading.json'),
      JSON.stringify(grading, null, 2)
    );

    return [
      config,
      {
        config,
        pass_rate: passRate,
        passed,
        failed: total - passed,
        total,
        time_seconds: Math.round(timing.duration_ms / 100) / 10,
        total_tokens: timing.total_tokens ?? 0
      }
    ];
  }

  // Run without_skill first to establish baseline, then with_skill
  const [, withoutSkillData] = await runConfig('without_skill', false);
  const [, withSkillData] = await runConfig('with_skill', true);

  return {
    eval_name: caseName,
    eval_id: caseDef.id,
    results: {
      with_skill: withSkillData,
      without_skill: withoutSkillData
    }
  };
}

// ---------------------------------------------------------------------------
// Benchmark aggregation
// ---------------------------------------------------------------------------

function calcStats(values) {
  if (values.length === 0) return {mean: 0.0, stddev: 0.0, min: 0.0, max: 0.0};
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const stddev =
    n > 1
      ? Math.sqrt(values.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n)
      : 0.0;
  const r = v => Math.round(v * 10000) / 10000;
  return {
    mean: r(mean),
    stddev: r(stddev),
    min: r(Math.min(...values)),
    max: r(Math.max(...values))
  };
}

function aggregate(runResults) {
  const byConfig = {};
  for (const r of runResults) {
    for (const [config, data] of Object.entries(r.results)) {
      (byConfig[config] ??= []).push(data);
    }
  }

  const summary = {};
  for (const [config, items] of Object.entries(byConfig)) {
    summary[config] = {
      pass_rate: calcStats(items.map(d => d.pass_rate)),
      time_seconds: calcStats(items.map(d => d.time_seconds)),
      tokens: calcStats(items.map(d => d.total_tokens))
    };
  }

  const configs = ['with_skill', 'without_skill'].filter(c => c in summary);
  if (configs.length === 2) {
    const a = summary[configs[0]];
    const b = summary[configs[1]];
    const signed = (n, decimals) =>
      `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}`;
    summary.delta = {
      pass_rate: signed(a.pass_rate.mean - b.pass_rate.mean, 2),
      time_seconds: signed(a.time_seconds.mean - b.time_seconds.mean, 1),
      tokens: signed(Math.round(a.tokens.mean - b.tokens.mean), 0)
    };
  }

  return summary;
}

function buildBenchmarkJson({
  skillName,
  skillPath,
  selectedCases,
  runResults,
  runSummary,
  model,
  graderModel,
  totalElapsed
}) {
  const runs = [];
  for (const r of runResults) {
    for (const [config, data] of Object.entries(r.results)) {
      runs.push({
        eval_id: r.eval_id,
        eval_name: r.eval_name,
        configuration: config,
        run_number: 1,
        result: {
          pass_rate: data.pass_rate,
          passed: data.passed,
          failed: data.failed,
          total: data.total,
          time_seconds: data.time_seconds,
          tokens: data.total_tokens,
          tool_calls: 0,
          errors: 0
        },
        expectations: [], // full detail lives in grading.json
        notes: []
      });
    }
  }

  return {
    metadata: {
      skill_name: skillName,
      skill_path: skillPath,
      executor_model: model ?? 'default',
      grader_model: graderModel,
      timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      evals_run: selectedCases.map(c => c.id),
      runs_per_configuration: 1,
      total_elapsed_seconds: Math.round(totalElapsed * 10) / 10
    },
    runs,
    run_summary: runSummary,
    notes: []
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  let args;
  try {
    ({values: args} = parseArgs({
      options: {
        evals: {type: 'string'},
        skill: {type: 'string'},
        workspace: {type: 'string'},
        iteration: {type: 'string'},
        ids: {type: 'string'},
        model: {type: 'string'},
        'grader-model': {type: 'string', default: 'claude-sonnet-4-6'},
        workers: {type: 'string', default: '2'},
        timeout: {type: 'string', default: '900'},
        'dry-run': {type: 'boolean', default: false}
      }
    }));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    printUsage();
    process.exit(1);
  }

  if (!args.evals || !args.skill || !args.workspace) {
    console.error('Error: --evals, --skill, and --workspace are required');
    printUsage();
    process.exit(1);
  }

  const evalsPath = path.resolve(args.evals);
  const skillPath = path.resolve(args.skill);
  const workspaceDir = path.resolve(args.workspace);

  const errors = [];
  if (!existsSync(evalsPath)) errors.push(`evals file not found: ${evalsPath}`);
  if (!existsSync(skillPath)) errors.push(`SKILL.md not found: ${skillPath}`);
  if (!existsSync(workspaceDir))
    errors.push(`workspace not found: ${workspaceDir}`);
  if (errors.length > 0) {
    errors.forEach(e => console.error(`Error: ${e}`));
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(evalsPath, 'utf8'));
  const allCases = Array.isArray(raw) ? raw : (raw.evals ?? []);
  const skillName =
    (Array.isArray(raw) ? null : raw.skill_name) ??
    path.basename(path.dirname(skillPath));

  let selected = allCases;
  if (args.ids) {
    const ids = new Set(args.ids.split(',').map(x => parseInt(x.trim(), 10)));
    selected = allCases.filter(c => ids.has(c.id));
    if (selected.length === 0) {
      console.error(
        `Error: no cases matched ids ${[...ids]}. Available: ${allCases.map(c => c.id).join(', ')}`
      );
      process.exit(1);
    }
  }

  const iteration = args.iteration
    ? parseInt(args.iteration, 10)
    : nextIteration(workspaceDir);
  const modelSuffix = args.model ? `_${args.model}` : '';
  const iterationDir = path.join(
    workspaceDir,
    `iteration-${iteration}${modelSuffix}`
  );

  const workers = parseInt(args.workers, 10);
  const timeout = parseInt(args.timeout, 10);
  const graderModel = args['grader-model'];
  const useSdk = Boolean(process.env.ANTHROPIC_API_KEY);
  const authMethod = useSdk
    ? 'Anthropic SDK (ANTHROPIC_API_KEY)'
    : 'claude -p subprocess (setup-token)';

  console.log(`Benchmark : ${skillName}`);
  console.log(`Skill     : ${skillPath}`);
  console.log(`Workspace : ${workspaceDir}`);
  console.log(`Iteration : iteration-${iteration}${modelSuffix}`);

  console.log(
    `Cases     : ${selected.length} — ids ${selected.map(c => c.id).join(', ')}`
  );
  console.log(
    `Workers   : ${workers} (each case runs with_skill + without_skill in parallel)`
  );
  console.log(`Timeout   : ${timeout}s per executor run`);
  console.log(`Auth      : ${authMethod}`);
  console.log();

  if (args['dry-run']) {
    for (const c of selected) {
      const fixtures = (c.files ?? []).join(', ');
      console.log(
        `  case ${String(c.id).padStart(2)}  ${c.eval_name.padEnd(35)}  ` +
          `${(c.assertions ?? []).length} assertions  ` +
          `fixtures: ${fixtures || '(none)'}`
      );
    }
    return;
  }

  mkdirSync(iterationDir, {recursive: true});
  const client = useSdk ? new Anthropic() : null;
  const allResults = [];
  const t0 = Date.now();

  const outcomes = await runConcurrent(selected, workers, async caseDef => {
    const result = await runBenchmarkCase({
      caseDef,
      skillPath,
      workspaceDir,
      iterationDir,
      model: args.model ?? null,
      graderModel,
      client,
      executorTimeout: timeout,
      useSdk
    });

    const ws = result.results.with_skill ?? {};
    const wos = result.results.without_skill ?? {};
    const delta = (ws.pass_rate ?? 0) - (wos.pass_rate ?? 0);
    const pct = n => `${Math.round(n * 100)}%`;
    console.log(
      `  ${result.eval_name.padEnd(35)}` +
        `  with=${ws.passed ?? 0}/${ws.total ?? 0}` +
        `  without=${wos.passed ?? 0}/${wos.total ?? 0}` +
        `  delta=${delta >= 0 ? '+' : ''}${pct(delta)}`
    );

    return result;
  });

  for (const {ok, value, error} of outcomes) {
    if (ok) {
      allResults.push(value);
    } else {
      console.error(`  FAILED: ${error?.message ?? error}`);
    }
  }

  const totalElapsed = (Date.now() - t0) / 1000;

  if (allResults.length === 0) {
    console.error('No cases completed.');
    process.exit(1);
  }

  const runSummary = aggregate(allResults);
  const benchmark = buildBenchmarkJson({
    skillName,
    skillPath,
    selectedCases: selected,
    runResults: allResults,
    runSummary,
    model: args.model ?? null,
    graderModel,
    totalElapsed
  });

  const benchmarkPath = path.join(iterationDir, 'benchmark.json');
  writeFileSync(benchmarkPath, JSON.stringify(benchmark, null, 2));

  // Summary table
  console.log();
  console.log('='.repeat(65));
  console.log(`Done in ${Math.round(totalElapsed)}s  —  ${iterationDir}`);
  console.log();
  console.log(
    `  ${'Config'.padEnd(18)}  ${'Pass Rate'.padStart(12)}  ${'Avg Time'.padStart(10)}  ${'Avg Tokens'.padStart(12)}`
  );
  console.log(
    `  ${'-'.repeat(18)}  ${'-'.repeat(12)}  ${'-'.repeat(10)}  ${'-'.repeat(12)}`
  );

  for (const config of ['with_skill', 'without_skill']) {
    if (!(config in runSummary)) continue;
    const s = runSummary[config];
    console.log(
      `  ${config.padEnd(18)}  ${`${Math.round(s.pass_rate.mean * 100)}%`.padStart(12)}` +
        `  ${`${s.time_seconds.mean.toFixed(1)}s`.padStart(10)}` +
        `  ${Math.round(s.tokens.mean).toLocaleString().padStart(12)}`
    );
  }

  if ('delta' in runSummary) {
    const d = runSummary.delta;
    console.log(
      `  ${'-'.repeat(18)}  ${'-'.repeat(12)}  ${'-'.repeat(10)}  ${'-'.repeat(12)}`
    );
    console.log(
      `  ${'delta'.padEnd(18)}  ${d.pass_rate.padStart(12)}` +
        `  ${(d.time_seconds + 's').padStart(10)}` +
        `  ${d.tokens.padStart(12)}`
    );
  }

  console.log();
  console.log(`  benchmark.json -> ${benchmarkPath}`);
}

function printUsage() {
  console.error(`
Usage:
  node skills/nexus/evals/run_benchmark.js \\
    --evals  <path/to/evals.json> \\
    --skill  <path/to/SKILL.md> \\
    --workspace <path/to/workspace> \\
    [--iteration N] [--ids 1,3,7] [--model <model>]
    [--grader-model <model>] [--workers 2] [--timeout 300] [--dry-run]

Auth:
  If ANTHROPIC_API_KEY is set, the Anthropic SDK is used directly.
  Otherwise, falls back to 'claude -p' subprocess — run 'claude setup-token' first.
`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
