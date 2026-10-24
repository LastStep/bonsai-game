---
name: playtest
description: "The playtest template (document kind playtest): one play session's record, raw observations kept apart from interpretation, with the player's own verdict and proposed tasks. Every field, what it may hold, and the template to copy. Use it after the interview."
---

# The playtest template

The template of the document kind `playtest`, which this pack declares in `bonsai/pack.yaml` (its folder; it has no
id and no statuses). A playtest records one play session, written by the playtest analyst (`game:playtest-analyst`)
after the interview (`game:interview`), while it is fresh.

**Where it goes:** one file per session, named after its date and who played (`2026-10-16-person.md`), in the folder
the project's `bonsai.yaml` gives the kind `playtest` under `documents` (`work/playtests` unless the project changed
it). Copy the template below, fill every field as the table says, and keep only the pointer comment on the first line:
the docs stay here.

| Field | Meaning | Allowed values | Example |
|---|---|---|---|
| `date` | The day of the session | a date, `YYYY-MM-DD` | `2026-10-16` |
| `who` | Who played: the person who directs the project, a group of friends, or another player by an alias | `person`, `friends`, or an alias | `person` |
| `players` | How many played | a whole number | `1` |
| `build` | What was played | where it ran: a local editor, a web build, a deployed address | `web build` |
| `version` | The commit the build was made from | a commit's hash, or `unknown` when nobody can say | `3f9a01b` |
| `duration_min` | How long the session lasted, in minutes | a whole number | `25` |
| `method` | How it was observed | `solo`, `observed` (watched in silence) or `interview` | `interview` |

```markdown
---
date: <YYYY-MM-DD>   # a playtest; every field and how to fill it: skill game:playtest
who: person
players: 1
build: <local editor, web build or a deployed address>
version: <commit>
duration_min: 0
method: interview
---

# Playtest: <who>, <date>

## Raw observations

**Written before any interpretation.** What happened, in order, as neutrally as possible: what they did, where they
hesitated, what they said out loud, what they got wrong, where they stopped. Times if you have them. Resist explaining
anything here.

- ...

## Quotes

Verbatim. The exact words matter more than the summary of them.

> "..."

## Numbers

Match length, turns, who won, anything counted.

## What this suggests

**Now** you interpret. Separate what was observed from what it might mean, and mark the confidence. Two players
hesitating in the same place is a signal; one player's opinion about a number is not.

## Proposed tasks

- [ ] <one line each, linked to the observation that motivated it; the task's id once it is written>

## The director's verdict

Did it feel good? What was the worst moment? What would you cut?
```
