---
name: unity-live-editor
description: "Driving the Unity Editor instead of editing its files: checking an instance is ready, the edit-refresh-console loop, saving scenes, screenshots as evidence, tests and builds from the command line, and keeping the Editor warm. Read it before any work on a Unity client."
---

<!-- skills/unity-live-editor/SKILL.md: the game pack's way of driving the Unity Editor, loaded as
game:unity-live-editor; read by builders in a Unity project. Fields: README.md ("Skill files"). -->

# Driving the Unity Editor

The rule is **drive the Editor, do not edit its files** (`game:asset-safety`). This is how, with the `unity`
command-line tool the project uses to reach a running Editor. Below, `<unity>` is the Unity project's folder.

## Before anything

```sh
unity status --format json      # an instance must report state "ready"
unity command                   # list the live-editor commands this project exposes
```

If nothing is ready:

1. `unity pipeline list`: is it in **Safe Mode**? Then C# does not compile. Fix the compile errors in `.cs` directly
   (the one allowed exception, `game:asset-safety`) and say so in your report.
2. Otherwise the Editor is not running or not reachable. Say so and stop: do not start hand-editing scenes because
   the Editor was inconvenient.

The Unity MCP server is another front door to the same Editor. When it is not connected, the command line is the
fallback, not a reason to stop; when neither is reachable, the task is blocked.

## The loop

1. **Stop Play Mode before editing C#**: `unity command editor_stop`.
2. New or changed files on disk are invisible to the Editor until it refreshes:
   `unity command menu --path "Assets/Refresh"`, then poll `recompile_status` until `completed`.
3. **Always check the console after touching Unity code**: `unity command console`. There is no separate log
   command; compile errors are silent otherwise.
4. Never run two Editor commands at once. On a timeout: wait 10 seconds, retry **once**, then stop and ask.
5. After changing a scene or prefab through commands: `unity command save_scene`.

## Evidence

A claim about the client is worth nothing without a picture. Capture the game view through an Editor command and put
the image's path in your report, under the project's artifacts folder (`artifacts/<task>-<what>.png`). The verifier
reads the screenshot: "it looks right" from the agent that made it is not evidence.

## Tests and builds

```sh
unity test <unity> --mode EditMode --report-format junit --output artifacts/editmode.xml --timeout 600
unity build <unity> --profile "Web Release" --output-path Build/Web
```

`unity test` exiting **8** means tests failed. That is a result, not a flake: do not retry it.

## Keep the Editor warm

A cold Editor start costs minutes on every rung. Leave one running with domain reload turned off and
**Application.runInBackground** on, so a ladder run takes seconds. If the ladder is slow, that is usually why: say so
in your report rather than skipping rungs.
