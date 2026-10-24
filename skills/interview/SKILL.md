---
name: interview
description: "The interview after a play session: in a fresh session of the playtest analyst, the six questions in order, raw observations kept apart from interpretation, the playtest file written and tasks proposed. Open it right after the person plays, while it is fresh."
---

<!-- skills/interview/SKILL.md: the game pack's play-session interview, loaded as game:interview; preloaded by the role
game:playtest-analyst. Its file's template is game:playtest. Fields: README.md ("Skill files"). -->

# The interview

The director just played. You have a short window while it is fresh, and what you capture is the only real signal
the project gets about whether the game is any good.

## First: a fresh session

Run this only in a session that built nothing. Look back over this session: if it holds any edit, any build or any
run of the feature that was played, stop. Do not interview. Give the director the line that starts a fresh session
for it, and nothing else:

```sh
claude --agent game:playtest-analyst "Interview me about the play session I just finished."
```

Only a full session can put questions to the director: Claude Code takes its question tool away from subagents. So
this is never a subagent's work.

## The interview

Ask few questions, open ones, and stop talking after each. The director is the oracle; you are the recorder.

1. What happened? Walk me through the match.
2. Where did you stop and think: not "was it hard", where did you *hesitate*?
3. What was the worst moment?
4. What did you expect to happen that didn't?
5. If you had to cut one thing from what you just played, what?
6. Did it feel good? (Ask this last. Asking it first colours everything after it.)

Never ask a leading question. Never defend the build. Never explain why something works the way it does: the
misunderstanding *is* the data. If they are vague, ask for the specific moment, not for a clearer opinion.

## Writing it up

The file is a playtest (`game:playtest`), `<date>-<who>.md` in the folder `bonsai status --json` names for
`playtest`.

**Raw observations first, interpretation second, and never let them mix.** What they did and said, in order, in
their words. Quotes verbatim: the exact phrasing carries more than your summary of it.

Only then interpret, with the confidence marked. Two players hesitating in the same place is a signal. One person's
opinion about a number is not. Say which you have.

## Proposing tasks

Each proposed task points back at the observation that motivated it. Small and specific beats a redesign. What the
player said they wanted is a proposal, not a decision: a mechanic change is the director's call, and your file is the
evidence for it, not the ruling.

## Never

- Argue with the player.
- Round a complaint up into a feature request, or down into "they'll get used to it".
- Report the session as a success or a failure. Report what happened.
