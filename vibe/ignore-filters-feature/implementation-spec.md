# Ignore Filters Feature — Implementation Spec

## 1) Config and schema changes

### Type additions (in plugin config type)
```ts
ignoreCron?: boolean;
ignoreSessionKeys?: string[];
ignoreSessionKeyPrefixes?: string[];
ignoreAgentIds?: string[];
ignorePatterns?: string[];
ignoreHeartbeat?: boolean; // default true
ignoreTrivialMessages?: string[];
```

### Defaults
- `ignoreCron`: `false`
- `ignoreSessionKeys`: `[]`
- `ignoreSessionKeyPrefixes`: `[]`
- `ignoreAgentIds`: `[]`
- `ignorePatterns`: `[]`
- `ignoreHeartbeat`: `true`
- `ignoreTrivialMessages`: `[]`

### Schema wiring
- Extend `openclaw.plugin.json` config schema with these fields.
- Keep fields optional; apply defaults in runtime config normalization.

---

## 2) Core helpers

### `shouldIgnoreTurn(sessionKey, cfg, messageText?)`
Return `{ ignored: boolean; reason?: string }`.

Evaluation order (first match wins):
1. `ignoreHeartbeat` + message equals `HEARTBEAT_OK` (trimmed)
2. `ignoreCron` if session key indicates cron context
3. `ignoreSessionKeys` exact match on full session key
4. `ignoreSessionKeyPrefixes` prefix match on:
   - full key (`agent:...`)
   - rest portion after leading namespace (if present)
5. `ignoreAgentIds` matches parsed agent ID from session key
6. `ignorePatterns` substring match against session key and optionally message text

Recommended hardening:
- Trim config entries; discard empty strings to avoid accidental match-all behavior.
- Case handling: keep exact semantics unless explicitly deciding case-insensitive patterns.

### `isTrivialMessage(text, prefixes)`
- Returns true when `text.trimStart().startsWith(prefix)` for any configured prefix.
- Ignore empty/whitespace prefixes.

---

## 3) Hook gating in `openclaw/index.ts`

### Auto-recall path
Before any Mem0 search/injection work:
1. Resolve normalized config.
2. Run `shouldIgnoreTurn(...)`.
3. If ignored, skip recall and return early.
4. Optionally apply `isTrivialMessage` to skip recall for trivial messages.

### Auto-capture path
Before `memory.add` or equivalent:
1. Run `shouldIgnoreTurn(...)`.
2. Run `isTrivialMessage(...)`.
3. If either matches, skip capture.

### Logging
- Add debug logs when skipping with reason string (guarded by debug config if available).

---

## 4) Documentation requirements

Update docs to include:
- What each ignore key does.
- Default behavior callout: `ignoreHeartbeat: true`.
- Example snippets for:
  - ignoring cron
  - ignoring specific sessions/prefixes
  - ignoring agent IDs
  - ignoring trivial pings
- Clarify manual memory tools are unaffected.

---

## 5) Compatibility

- Backward-compatible by default for existing users except heartbeat skips.
- Existing projects with `autoRecall/autoCapture` keep prior behavior unless filters are configured.

---

## 6) Known pitfalls to avoid

1. Empty-string filter values causing overmatching.
2. Prefix matching only one key representation (must handle full + rest portions if that behavior is expected).
3. Guard not running when `sessionKey` is absent (define explicit fallback behavior).
4. Divergent logic between recall and capture paths (must share helper).
