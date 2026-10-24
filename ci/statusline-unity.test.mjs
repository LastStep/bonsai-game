// ci/statusline-unity.test.mjs: the Unity segment's test (bonsai/files/statusline-unity.mjs), run by
// sh ci/check.sh segment, which the pack's CI runs on Linux and Windows. Each case builds a fixture project in a
// temporary folder, puts the script where bonsai init writes it (.trinetra/statusline/unity.mjs), runs it the way a
// status line does (node, Claude Code's status line JSON on stdin, NO_COLOR=1) and compares what it prints.
// Plain node:test, no packages.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, '..', 'bonsai', 'files', 'statusline-unity.mjs');
const base = mkdtempSync(join(tmpdir(), 'game-segment-'));
after(() => rmSync(base, { recursive: true, force: true }));
const DEAD_PID = 2147483646;

function write(p, text) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
}

// A project folder with the script in place; unity: the Unity project's folder inside it ('' for the top, null for none).
function project(name, unity, version = '6000.4.12f1') {
  const root = join(base, name);
  mkdirSync(join(root, '.trinetra', 'statusline'), { recursive: true });
  copyFileSync(script, join(root, '.trinetra', 'statusline', 'unity.mjs'));
  if (unity !== null) {
    write(join(root, unity, 'ProjectSettings', 'ProjectVersion.txt'),
      `m_EditorVersion: ${version}\nm_EditorVersionWithRevision: ${version} (3ca267ce8005)\n`);
  }
  return root;
}

function run(root, env = {}) {
  const r = spawnSync(process.execPath, [join(root, '.trinetra', 'statusline', 'unity.mjs')], {
    input: JSON.stringify({ workspace: { current_dir: root }, cwd: root }),
    env: { ...process.env, NO_COLOR: '1', STATUSLINE_HIDE: '', BONSAI_STATUSLINE_HIDE: '', ...env },
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

test('an Editor open on the project one folder down prints its version and open', () => {
  const root = project('open', 'Client');
  write(join(root, 'Client', 'Library', 'EditorInstance.json'), JSON.stringify({ process_id: process.pid, version: '6000.4.12f1' }));
  assert.equal(run(root), 'unity:6000.4.12f1 open\n');
});

test('an Editor of another version says which one has it open', () => {
  const root = project('other', 'Client');
  write(join(root, 'Client', 'Library', 'EditorInstance.json'), JSON.stringify({ process_id: process.pid, version: '6000.4.4f1' }));
  assert.equal(run(root), 'unity:6000.4.12f1 open in 6000.4.4f1\n');
});

test('an instance file whose process is gone prints closed', () => {
  const root = project('gone', 'Client');
  write(join(root, 'Client', 'Library', 'EditorInstance.json'), JSON.stringify({ process_id: DEAD_PID, version: '6000.4.12f1' }));
  assert.equal(run(root), 'unity:6000.4.12f1 closed\n');
});

test('only the lock file prints lock?', () => {
  const root = project('lock', '', '2022.3.10f1');
  write(join(root, 'Temp', 'UnityLockfile'), '');
  assert.equal(run(root), 'unity:2022.3.10f1 lock?\n');
});

test('a Unity project at the top with no Editor prints closed', () => {
  const root = project('top', '', '2022.3.10f1');
  assert.equal(run(root), 'unity:2022.3.10f1 closed\n');
});

test('a project with no Unity project prints nothing', () => {
  assert.equal(run(project('none', null)), '');
});

test('STATUSLINE_HIDE listing unity prints nothing', () => {
  assert.equal(run(project('hidden', 'Client'), { STATUSLINE_HIDE: 'cost,unity' }), '');
});

test('colour is on without NO_COLOR, and an escape in Unity\'s files never reaches the terminal', () => {
  const root = project('colour', 'Client', '6000.4.12f1\x1b[2J');
  write(join(root, 'Client', 'Library', 'EditorInstance.json'), JSON.stringify({ process_id: process.pid, version: '6000.4.12f1\x1b[2J' }));
  const out = run(root, { NO_COLOR: '' });
  assert.equal(out, 'unity:6000.4.12f1[2J \x1b[0;32mopen\x1b[0m\n');
});
