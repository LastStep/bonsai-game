---
name: asset-safety
description: "The files Unity owns and agents never edit by hand (.meta, scenes, prefabs, assets, ProjectSettings, the package manifest, generated folders), what to do instead, the one Safe Mode exception, and what to do when the guard refuses you. Read it before any change in a Unity project."
---

<!-- skills/asset-safety/SKILL.md: the game pack's rules for a Unity project's files, loaded as game:asset-safety; read
by builders and verifiers in a Unity project. Fields: README.md ("Skill files"). -->

# Asset safety in a Unity project

Unity owns a set of files. An agent that edits them corrupts the project in ways that do not show until someone
opens the Editor, and that are painful to undo. Below, `<unity>` is the Unity project's folder: the one that holds
`Assets/` and `ProjectSettings/`.

## Never edit, create, move or delete

| Pattern | Why | Do this instead |
|---|---|---|
| `*.meta` | Unity owns the GUIDs. A hand-made `.meta` silently breaks every reference to that asset | Let Unity make it. Commit each asset **together with** its `.meta` |
| `*.unity`, `*.prefab` | YAML with file-ID cross references. Hand edits look fine and break on load | Drive the live Editor (`game:unity-live-editor`) |
| `*.asset` | Serialized ScriptableObjects, the same problem | An Editor command, or a command you add to the project first |
| `<unity>/ProjectSettings/**` | Global, hard to undo, affects every build | Ask the director (`studio:desk-asks`): this is their call |
| `<unity>/Packages/manifest.json`, `packages-lock.json` | Dependency resolution; a wrong edit costs a reimport | Ask, then use the Package Manager |
| `Library/`, `Temp/`, `obj/`, `bin/`, `Logs/`, `Build*/`, `UserSettings/` | Generated. Never read, never commit | Nothing |

**Who enforces it.** The project names these paths in its `bonsai.yaml`: under `protected` (an agent changes one only
while its running task grants it) or `never_edit` (no agent, ever). Bonsai's guard refuses the rest. This skill says
why; the project's `bonsai.yaml` is the rule.

## A task that needs one

A task that truly needs to change a protected file says which, and why, in its plan, and the person grants it on the
task (`bonsai.allows`). A grant is the person's: never ask an agent for one, never write one yourself.

## The one exception: Safe Mode

If the Editor will not start because C# does not compile, no live-editor command can reach it: there is no Editor
to reach. In Safe Mode you may edit `.cs` files directly to fix the compile errors, and only that. Say in your report
that you did.

## A file Unity rewrites by itself

Some files Unity rewrites on every build and nobody edits by hand (a font asset in dynamic mode writes its letter
cache into itself). If one shows as changed after a build, put it back to its committed version
(`git restore <path>`), never commit it, and say so in your report. If the guard refuses even that, stop and say so.

## If the guard refuses you

The guard is right and you are wrong. Do not look for a way around it: do not shell out to `sed`, do not write
through a script, do not turn the guard off. Either use the live Editor, or report the task blocked and say what you
needed to change. Getting past a guard is a failed session, whatever the result looks like.
