# Ignore Filters — Rebuild Checklist (from clean repo)

Use this checklist to re-implement the feature from scratch in a clean branch.

## 0) Prep
- [ ] Create branch (example): `git checkout -b feat/ignore-filters-rebuild`
- [ ] Read these specs first:
  - [ ] `vibe/ignore-filters-feature/overview.md`
  - [ ] `vibe/ignore-filters-feature/implementation-spec.md`
  - [ ] `vibe/ignore-filters-feature/test-plan.md`

## 1) Config type + schema
- [ ] Add config fields to Mem0 plugin config type (`openclaw/index.ts` or relevant config interface):
  - [ ] `ignoreCron?: boolean`
  - [ ] `ignoreSessionKeys?: string[]`
  - [ ] `ignoreSessionKeyPrefixes?: string[]`
  - [ ] `ignoreAgentIds?: string[]`
  - [ ] `ignorePatterns?: string[]`
  - [ ] `ignoreHeartbeat?: boolean`
  - [ ] `ignoreTrivialMessages?: string[]`
- [ ] Add same fields to `openclaw/openclaw.plugin.json` schema.
- [ ] Ensure defaults are applied in runtime normalization:
  - [ ] all false/empty by default except `ignoreHeartbeat: true`

## 2) Implement helpers
- [ ] Create `openclaw/src/shouldIgnoreTurn.ts`
  - [ ] Return `{ ignored: boolean, reason?: string }`
  - [ ] Implement ordered checks (heartbeat, cron, exact key, prefix, agentId, pattern)
  - [ ] Sanitize lists (trim + drop empty strings)
- [ ] Create `openclaw/src/isTrivialMessage.ts`
  - [ ] `text.trimStart().startsWith(prefix)` semantics
  - [ ] ignore empty/whitespace prefixes

## 3) Wire ignore behavior into hooks
- [ ] In auto-recall path (`openclaw/index.ts`), call `shouldIgnoreTurn` before recall search/injection.
- [ ] In auto-capture path, call `shouldIgnoreTurn` before add/write.
- [ ] Apply `isTrivialMessage` gating in both paths where intended.
- [ ] Add debug trace messages with skip reason (if debug mode exists).

## 4) Tests
- [ ] Add `openclaw/tests/shouldIgnoreTurn.test.ts`
  - [ ] heartbeat true/false behavior
  - [ ] cron match
  - [ ] exact session key match
  - [ ] prefix matching (full key + rest form)
  - [ ] agent ID match
  - [ ] pattern substring match
  - [ ] empty-string entries do not overmatch
- [ ] Add `openclaw/tests/isTrivialMessage.test.ts`
  - [ ] positive and negative prefix cases
  - [ ] leading whitespace behavior
  - [ ] empty prefix handling
- [ ] Ensure Jest infra exists/works:
  - [ ] `openclaw/jest.config.cjs`
  - [ ] `openclaw/tsconfig.test.json`
  - [ ] `openclaw/package.json` test script/deps

## 5) Docs
- [ ] Update `openclaw/README.md` with new config options + examples.
- [ ] Update `docs/integrations/openclaw.mdx` similarly.
- [ ] Explicitly call out default `ignoreHeartbeat: true`.
- [ ] Clarify manual memory tools still function for ignored sessions.

## 6) Validation run
- [ ] Run tests.
- [ ] Smoke-check with config examples:
  - [ ] ignore heartbeat only
  - [ ] ignore specific agent IDs
  - [ ] ignore cron sessions
  - [ ] ignore trivial short pings
- [ ] Confirm auto-recall and auto-capture are both skipped when matched.

## 7) Finalize
- [ ] Use `vibe/ignore-filters-feature/commitmessage.md` as commit message base.
- [ ] Use `vibe/ignore-filters-feature/pr.md` as PR body base.
- [ ] Verify no unrelated files are included.
