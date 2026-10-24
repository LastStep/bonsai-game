# game, a Bonsai pack

A game project's part of a studio, as a [Bonsai](https://github.com/LastStep/Bonsai) pack: the two roles a game
needs beside a workflow's builders and verifiers, the play-session interview and its record, and the rules for
working in a Unity project without breaking the files Unity owns. It is a Claude Code plugin (its roles and skills)
with a `bonsai/` folder (what Bonsai's engine reads when a project links the pack). It carries no code that runs.

## What a project gets

- **Two roles** (`agents/`), loaded as `game:<role>`, both helpers that call no one:
  - `game:playtest-analyst` interviews the person right after they play and writes the session's record. It runs in a
    session of its own, `claude --agent game:playtest-analyst`, never as a subagent: Claude Code takes the question
    tool away from subagents.
  - `game:producer` keeps `.bonsai/STATE.md` true, writes the daily brief, applies lanes, triages playtest notes and
    failures into tasks, and watches the milestone date. It never writes game code.
- **Four skills**: `game:interview` (the six questions after a play session), `game:playtest` (the template of the
  kind `playtest`), `game:asset-safety` (the files Unity owns and what to do instead) and `game:unity-live-editor`
  (driving the Editor from the command line).
- **One document kind**, `playtest`, the record of one play session, with its template in `game:playtest`.
- **A two-line block** in the project's `CLAUDE.md` naming the roles and the skills.

It declares no walls, no lanes, no labels and no protected paths. A Unity project names the files Unity owns in its
own `bonsai.yaml` (`protected` or `never_edit`); `game:asset-safety` lists them and says why.

**What it needs beside it.** `base`, Bonsai's own pack; **the studio pack** (`https://github.com/LastStep/bonsai-studio`),
whose `studio:brief` the producer writes the brief from and whose `studio:desk-asks` the skills point at for asking
the person (`pack.yaml` has no field for a dependency, so it is said here and in the block); and a workflow pack for the
lanes, builders and verifiers. Only one linked pack may declare a document kind (Bonsai refuses a link where two do),
so the workflow pack must not declare `playtest`.

**Not here yet.** The Unity part of a status line (the Unity version and whether its Editor is open) is to come with
this pack; where its file lands in a project is still being settled.

## How a project takes it

A project already linked adds the pack as an entry in its `bonsai.yaml`, after `base` and the studio pack:

```yaml
packs:
  - id: game                          # the pack
    source: "https://github.com/LastStep/bonsai-game.git"   # where it is fetched from
    path: null                        # the pack is at its repository's top
    ref: "v0.1.0"                     # its release tag; the lock records the commit
    roles: null                       # this project's limits for the pack's roles; null keeps the pack's
```

then runs `bonsai update`, which previews every change. Because the pack declares roles, a Bonsai that enforces them
writes two guard lines for them: adding the pack to a project already linked changes Bonsai's own guard, so the
person types `bonsai update --allow-exec --yes` themselves. A first link (`bonsai init --name <project> --source
https://github.com/LastStep/bonsai-game --ref v0.1.0 --yes`) writes them with `--yes`. The project's `bonsai.yaml`
gives `playtest` a folder under `documents` (`work/playtests` unless it names another). Moving to a newer release is
a person's step: change `ref`, then run `bonsai update`.

## The folder

| File | What it is |
|---|---|
| `.claude-plugin/plugin.json` | The plugin manifest Claude Code reads. JSON holds no comments, so it is documented here, under "plugin.json" |
| `agents/` | The pack's roles, one file each; a role loads as `game:<name>` |
| `skills/` | The pack's skills, one folder each with its `SKILL.md`, to the open Agent Skills standard; a skill loads as `game:<name>` |
| `bonsai/pack.yaml` | The Bonsai manifest (format `bonsai.pack/1`): id, version, needs, the block, the kind `playtest`, and the two roles with their limits. A `#` comment on every key documents it |
| `bonsai/block.md` | The pack's two lines in the project's `CLAUDE.md`; its leading comment documents it |
| `ci/check.sh` | Every check the pack has, in one script; its header documents each subcommand and argument |
| `.github/workflows/pack.yml` | The pack's CI and release, calling `ci/check.sh`. A `#` comment on every key |
| `.gitattributes` | Every file is text with LF line endings on every checkout, Windows included, so `sh ci/check.sh` runs there |
| `LICENSE` | MIT |
| `README.md` | This page |

`bonsai check --schema bonsai.pack` prints every field of `pack.yaml` with its allowed values.

## Role and skill files

Each file in `agents/` and `skills/` has one row here, and each row names a file there: `ci/check.sh` fails otherwise.

| File | What it is |
|---|---|
| `agents/playtest-analyst.md` | The role `game:playtest-analyst`: the interview after a play session and its record, in a fresh session of its own. Preloads `game:interview` and `game:playtest` |
| `agents/producer.md` | The role `game:producer`: STATE, the daily brief, lanes, triage into tasks, the milestone date; never game code. Preloads `studio:brief` |
| `skills/interview/SKILL.md` | The skill `game:interview`, no template: a fresh session first, the six questions in order, writing it up, proposing tasks |
| `skills/playtest/SKILL.md` | The skill `game:playtest`, the template of the document kind `playtest`: its fields table and the template to copy |
| `skills/asset-safety/SKILL.md` | The skill `game:asset-safety`, no template: the files Unity owns, what to do instead, Safe Mode, files Unity rewrites itself, a refusing guard |
| `skills/unity-live-editor/SKILL.md` | The skill `game:unity-live-editor`, no template: a ready Editor, the edit-refresh-console loop, screenshots as evidence, tests and builds, a warm Editor |

### How each kind of file documents itself

Every file the pack ships says its purpose, when to use it, and every field.

- **A YAML file** (`pack.yaml`, `pack.yml`): a short header, and a `#` comment on every key. `bonsai check --pack`
  fails a key in `bonsai/` without one.
- **A template skill** (`playtest`): a fields table, `| Field | Meaning | Allowed values | Example |`, above its
  template, the first fenced block after the table; `bonsai check --pack` holds the two equal.
- **A role file, and a skill that is no template**: an HTML comment just after the frontmatter, pointing here.
- **`ci/check.sh`**: its header. **`plugin.json`**: this page. **`block.md`**: its leading comment.

### Role files: frontmatter fields

| Field | Meaning | Allowed values | Example |
|---|---|---|---|
| `name` | The role's name; the file is `agents/<name>.md`, and the role loads as `game:<name>` | a lower-case letter, then lower-case letters, digits and dashes | `producer` |
| `description` | When to use the role, as Claude Code shows it to the caller choosing an agent | one line of text, quoted | `"Keeps STATE true, ..."` |
| `model` | The model Claude Code runs the role on; a caller may name another for one call | a Claude Code model alias (`opus`, `sonnet`, `haiku`), a full model id, or `inherit` | `opus` |
| `skills` | The skills loaded into the role's context when it starts as a subagent, each by its name as its plugin loads it (another pack's too) | a list of skill names | `[studio:brief]` |
| `maxTurns` | Claude Code's limit on the role's turns: a backstop where Bonsai's guard does not run, never the limit itself | a whole number, equal to the role's `max_turns` in `bonsai/pack.yaml` | `600` |

A session started as `claude --agent game:<role>` gets no preloaded skills (measured by the workflow pack on Claude
Code 2.1.300), so each role's body names the skills to open as well.

### Skill files: frontmatter fields

| Field | Meaning | Allowed values | Example |
|---|---|---|---|
| `name` | The skill's name; the folder is `skills/<name>/`, and the skill loads as `game:<name>` | a lower-case letter, then lower-case letters, digits and dashes | `interview` |
| `description` | What the skill holds and when to open it: Claude reads it to decide whether to load the skill | one line of text, quoted | `"The interview after a play session: ..."` |

## Roles and their limits

Each role is a file in `agents/` and an entry in `bonsai/pack.yaml`'s `roles`. Both are helpers (they call no one),
neither is the person's own session, and both write files (the playtest file; STATE, the brief and task files). Their
limits are a helper's as the workflow pack's researcher has them, each max equal to its default:

| Role | max_turns | minutes | actions | red_runs |
|---|---|---|---|---|
| `playtest-analyst` | 600 | 30 | 150 | none |
| `producer` | 600 | 30 | 150 | none |

A project sets its own default and max for any limit under the pack's entry in its `bonsai.yaml` (`roles:`).

## plugin.json

| Field | Meaning | Allowed values | Example |
|---|---|---|---|
| `name` | The plugin's name, which Claude Code puts before every role and skill (`game:producer`) | the pack's id, exactly as `bonsai/pack.yaml`'s `id` | `"game"` |
| `description` | What the pack is, in a sentence, as Claude Code's plugin lists show it | text | `"A game project's part of a studio ..."` |
| `author` | Who makes the pack | an object; `name` is the maker's name | `{"name": "Trinetra"}` |
| `repository` | Where the pack's source is | a URL | `"https://github.com/LastStep/bonsai-game"` |
| `license` | The pack's license | an SPDX id | `"MIT"` |

**Never add `version`** (below).

## Versions and releases

- **A project pins the pack by commit.** `bonsai.yaml` names a tag or commit; Bonsai's lock records the 40-character
  commit and refuses a tag that later moves. `plugin.json` never carries a `version`, and `claude plugin validate
  --json` warns about that one thing, which `ci/check.sh` allows.
- **`bonsai/pack.yaml`'s `version` names tags only.** A release is a tag `v` and that version (`v0.1.0`). To release:
  raise `version`, commit, push, then tag that commit `v<version>` and push the tag. The CI checks everything again,
  checks that the tag equals the version, and makes the GitHub release with its notes.

## Checks, CI and release

`ci/check.sh` is Bonsai's pack template's script, unchanged (its header documents each subcommand):

- `sh ci/check.sh check <bonsai> <folder> <source> <commit> [<path>]`: `bonsai check --pack` on the folder; this page's
  rows against `agents/` and `skills/`; a scratch project linked to the pack at the commit, with `claude` off the PATH
  and a temporary Bonsai home; `bonsai check` there. Locally, from the pack's top, on committed work:
  `sh ci/check.sh check "$(command -v bonsai)" . . "$(git rev-parse HEAD)"`.
- `sh ci/check.sh validate <folder>`: `claude plugin validate --json`, failing on every error and warning but the
  missing `version`. It needs no Claude login.
- `sh ci/check.sh release <tag> <folder>`: fails unless the tag is `v` and `pack.yaml`'s `version`.

`.github/workflows/pack.yml` runs on every push and pull request (it uses no secret): `check` on Linux and Windows
with a bonsai built from `BONSAI_COMMIT` (Bonsai `v1.0.0-rc.2` today); `validate` on Linux with the pinned Claude
Code; then `release`, which checks the tag the version needs on every push and, on a `v*` tag only, makes the GitHub
release.
