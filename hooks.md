# Claude Code Hooks: A Simple Guide

## What is a hook?

A hook is a command that Claude Code runs automatically at a set moment, so you don't have to remember to run it.

## The main moments hooks can run at

- **PreToolUse**: just before Claude uses a tool (for example, before it edits a file).
- **PostToolUse**: just after a tool finishes (for example, after Claude edits a file).
- **Stop**: when Claude finishes responding.
- **SessionStart**: when a Claude Code session begins.

## Where hooks are set up

Hooks live in a settings file:

- `.claude/settings.json`: shared with the project, so the whole team gets them.
- `.claude/settings.local.json`: personal to you, usually kept out of version control.

## A sketch of a hook

This example runs the linter after Claude edits or writes a file:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "bun x eslint app lib" }
        ]
      }
    ]
  }
}
```

- `matcher` says which tools trigger the hook.
- `command` is the shell command that runs.

This is a sketch. Check the field names against the official Claude Code hooks documentation before relying on them.

## Why use hooks?

Hooks make a rule happen every time, not just when someone remembers. Common uses are formatting files after edits, running checks before a session ends, or blocking commands you never want run.
