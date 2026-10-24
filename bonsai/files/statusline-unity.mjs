// .trinetra/statusline/unity.mjs: the game pack's Unity segment for a status line, written into a project by
// bonsai init and update from the game pack's bonsai/files/statusline-unity.mjs (kind pack: an edit in the project is
// a conflict; its sha256 is in .bonsai/lock.json). A studio's status line runs every script in the project's
// .trinetra/statusline/ folder with Claude Code's status line JSON on stdin and a short timeout, and appends what each
// prints. This one prints the Unity version the project asks for and whether an Editor has it open:
//   unity:6000.4.12f1 open | unity:6000.4.12f1 open in 6000.4.4f1 | unity:6000.4.12f1 closed | unity:2022.3.10f1 lock?
// and nothing at all when the project holds no Unity project. It reads stdin for nothing: the project is the folder
// two above this file, and the Unity project is that folder or one folder below it (ProjectSettings/ProjectVersion.txt).
// Plain Node, no packages, no network, no writes; it only reads files and asks whether a process id is alive.
// Environment: NO_COLOR=1 (no colour); STATUSLINE_HIDE or BONSAI_STATUSLINE_HIDE listing unity (prints nothing).
// README.md in the pack ("The Unity segment") documents it.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CODES = { reset: '\x1b[0m', dim: '\x1b[2m', yel: '\x1b[0;33m', grn: '\x1b[0;32m' };

function readText(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

function readJson(p) {
  const t = readText(p);
  if (t === null) return null;
  try { return JSON.parse(t); } catch { return null; }
}

// Only printable text from files Unity wrote: no escape reaches the terminal.
function clean(s) {
  return String(s ?? '').replace(/[\x00-\x1f\x7f-\x9f]/g, '').trim();
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return Boolean(e) && e.code === 'EPERM'; }
}

function isUnity(d) {
  return existsSync(join(d, 'ProjectSettings', 'ProjectVersion.txt'));
}

/** The Unity project: the project's folder itself, or the first of at most 64 folders one below it. */
export function findUnity(root) {
  if (isUnity(root)) return root;
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return null; }
  let looked = 0;
  for (const e of entries) {
    if (looked >= 64) break;
    if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'Library') continue;
    looked++;
    const d = join(root, e.name);
    if (isUnity(d)) return d;
  }
  return null;
}

/** The version the project asks for, and whether an Editor has it open (Library/EditorInstance.json and its process). */
export function unityState(unityDir) {
  const pv = readText(join(unityDir, 'ProjectSettings', 'ProjectVersion.txt')) ?? '';
  const m = /m_EditorVersion:\s*(\S+)/.exec(pv);
  const version = m ? clean(m[1]) : null;
  const inst = readJson(join(unityDir, 'Library', 'EditorInstance.json'));
  if (inst && Number.isInteger(inst.process_id)) {
    const alive = pidAlive(inst.process_id);
    return { version, open: alive, editorVersion: alive && typeof inst.version === 'string' ? clean(inst.version) : null };
  }
  // No instance file: the lock file alone means an Editor is starting, or one crashed.
  return { version, open: existsSync(join(unityDir, 'Temp', 'UnityLockfile')) ? null : false, editorVersion: null };
}

/** The segment's text for a project folder, or '' when it holds no Unity project or the segment is hidden. */
export function segment(root, env = process.env) {
  const hide = `${env.STATUSLINE_HIDE ?? ''},${env.BONSAI_STATUSLINE_HIDE ?? ''}`.split(',').map((s) => s.trim().toLowerCase());
  if (hide.includes('unity')) return '';
  const dir = findUnity(root);
  if (!dir) return '';
  const paint = (name, text) => (env.NO_COLOR ? text : `${CODES[name]}${text}${CODES.reset}`);
  const u = unityState(dir);
  let s = `unity:${u.version ?? '?'}`;
  if (u.open === true) {
    s += ` ${paint('grn', 'open')}`;
    if (u.editorVersion && u.version && u.editorVersion !== u.version) s += ` ${paint('yel', `in ${u.editorVersion}`)}`;
  } else if (u.open === null) s += ` ${paint('yel', 'lock?')}`;
  else s += ` ${paint('dim', 'closed')}`;
  return s;
}

const self = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === self) {
  try {
    const out = segment(resolve(dirname(self), '..', '..'));
    if (out) process.stdout.write(`${out}\n`);
  } catch { /* a segment that cannot be read prints nothing */ }
}
