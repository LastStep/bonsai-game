<!--
bonsai/block.md: the game pack's part of the instruction block Bonsai writes into a linked project's CLAUDE.md.
Every session reads it, so it is two lines: the roles and the skills. The engine writes the lines after this comment;
the comment stays in the pack. README.md says more.
-->
Game (pack game): after the person plays, the interview runs in a fresh session, `claude --agent game:playtest-analyst` (skills `game:interview`, `game:playtest`); the producer, `game:producer`, keeps STATE true and writes the daily brief (`studio:brief`, from the studio pack, which every project with this pack also takes).
In a Unity project, read `game:asset-safety` before touching any file Unity owns, and `game:unity-live-editor` before driving the Editor.
