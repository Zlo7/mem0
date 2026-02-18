# fix(openclaw): Wire OSS graph configuration through plugin `index.ts`

## Summary

Enable actual graph materialization for OpenClaw mem0 **open-source mode** by wiring plugin graph settings into the OSS `Memory(...)` initialization path.

Today, `enableGraph` is parsed/logged but not propagated into OSS config, so `add(...)` succeeds for vector/history storage while Neo4j remains empty.

## Problem

In `openclaw/index.ts`:
- `enableGraph` is accepted in plugin config and logged.
- But `OSSProvider._init()` only passes `embedder`, `vectorStore`, `llm`, `historyDbPath`, and `customPrompt` into `new Memory(config)`.
- No graph settings are forwarded for OSS mode.

Observed behavior:
- With `enableGraph: false`: no graph writes (expected).
- With `enableGraph: true`: still no graph nodes/edges (unexpected), because graph config is not wired into OSS init.

## Root Cause

Config-to-runtime mismatch in OSS path:
- Plugin-level graph intent (`enableGraph`) is disconnected from OSS `Memory` constructor config.
- Additionally, OSS expects **camelCase** keys (`enableGraph`, `graphStore`) in `new Memory(config)`; using snake_case (`graph_store`) does not activate graph materialization.
- Therefore, graph extraction/write pipeline never initializes for OSS.

## Proposed Fix

Confine change to `openclaw/index.ts`:

1. Extend OSS config mapping so graph-related OSS fields are accepted/resolved (including env expansion).
2. In `OSSProvider._init()`, when `enableGraph === true`, pass graph config into `Memory(config)` using OSS-native camelCase keys:
   - `config.enableGraph = true`
   - `config.graphStore = { ... }`
3. Add guardrails:
   - if `enableGraph === true` but required graph settings are missing, emit clear warning/error and fail fast.
   - if `enableGraph !== true`, omit graph config entirely.
4. Add startup diagnostics indicating effective graph runtime state (enabled + configured).

## Non-Goals

- No OpenClaw core changes.
- No direct Neo4j writes.
- No backfill logic changes in this PR.

## Testing Plan

1. Configure plugin OSS mode with valid Neo4j graph settings and `enableGraph: true`.
2. Restart gateway.
3. Submit 3–5 relational canary facts via normal memory add path.
4. Verify Neo4j now has non-zero nodes/relationships.
5. Disable graph (`enableGraph: false`) and verify graph writes stop.

## Expected Impact

- Restores intended behavior: OSS mode can materialize graph when explicitly enabled.
- Unblocks meaningful graph canary/pilot validation and subsequent backfill decisions.

## Risks

- Misconfigured graph settings may fail init; mitigated by explicit validation and logging.
- Potential token/cost overhead from graph extraction path when enabled.

## Rollout

- Merge wiring fix.
- Run short canary.
- If canary passes, re-run pilot quality gate.
- Then proceed with full backfill decision.
