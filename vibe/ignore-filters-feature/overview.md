# Ignore Filters Feature — Reconstruction Overview

This folder reconstructs the original feature description for the `ignore-filters-feature` branch so the feature can be re-implemented from a clean repo **using only these docs**.

## Goal
Add configurable ignore filters to the OpenClaw Mem0 plugin so `autoRecall` and `autoCapture` can be skipped for selected turns/sessions while keeping manual memory tools available.

## User-facing outcomes
- Users can skip memory hooks for cron sessions.
- Users can ignore exact session keys, session key prefixes, or agent IDs.
- Users can ignore turns by substring patterns.
- Heartbeat keep-alive messages are ignored by default.
- Trivial user messages (custom prefixes) can be ignored.

## Config surface (Mem0 plugin)
Add these config keys:
1. `ignoreCron?: boolean`
2. `ignoreSessionKeys?: string[]`
3. `ignoreSessionKeyPrefixes?: string[]`
4. `ignoreAgentIds?: string[]`
5. `ignorePatterns?: string[]`
6. `ignoreHeartbeat?: boolean` (default `true`)
7. `ignoreTrivialMessages?: string[]`

## Required behavior
- All new filters default to disabled/empty **except** `ignoreHeartbeat`, which defaults to `true`.
- Ignore checks must gate both:
  - auto-recall injection path
  - auto-capture/write path
- If ignored, execution exits early and does not call Mem0 add/search for that turn.
- Manual tools (`memory_search`, `memory_store`, etc.) remain available.

## Source files to implement/update
- `openclaw/index.ts`
- `openclaw/openclaw.plugin.json`
- `openclaw/README.md`
- `docs/integrations/openclaw.mdx`
- `openclaw/src/shouldIgnoreTurn.ts` (new)
- `openclaw/src/isTrivialMessage.ts` (new)
- `openclaw/tests/shouldIgnoreTurn.test.ts` (new)
- `openclaw/tests/isTrivialMessage.test.ts` (new)
- test infra updates:
  - `openclaw/package.json`
  - `openclaw/jest.config.cjs`
  - `openclaw/tsconfig.test.json`

## Reimplementation acceptance criteria
- Config validates with schema and defaults correctly.
- Auto-recall and auto-capture are both skipped when any ignore condition matches.
- Unit tests pass and cover edge cases.
- Docs fully describe new config keys and default heartbeat behavior.
