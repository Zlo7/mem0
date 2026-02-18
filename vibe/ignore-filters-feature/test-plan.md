# Ignore Filters Feature — Test Plan

## Unit tests

### `shouldIgnoreTurn.test.ts`
Cover at minimum:
- ignores `HEARTBEAT_OK` when `ignoreHeartbeat=true`
- does not ignore heartbeat when `ignoreHeartbeat=false`
- ignores cron sessions when `ignoreCron=true`
- exact session key matching
- prefix matching (full key + rest portion)
- agent ID matching
- pattern substring matching
- no ignore when config arrays empty
- ignores empty config entries ("", "   ") safely
- deterministic reason string output per match type

### `isTrivialMessage.test.ts`
Cover:
- positive prefix match
- negative no-match
- leading whitespace in message handled via `trimStart`
- empty prefix entries ignored
- empty message handling

## Integration-ish checks (in `index.ts` tests or targeted harness)
- Recall path exits early on ignore.
- Capture path exits early on ignore.
- Manual memory tools remain callable even when ignore matches.

## Regression checks
- `ignoreHeartbeat` default true confirmed in runtime config.
- Existing config without new keys does not throw.

## Suggested test count target
- ~30 tests total (roughly what prior implementation had: 31 across 2 suites).
