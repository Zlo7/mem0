feat(openclaw): add ignore filters to disable auto-recall/auto-capture for cron, sessions, and trivial messages

Add configurable ignore filters to the Mem0 OpenClaw plugin to allow users to disable auto-recall and auto-capture for:

- Cron job sessions (via ignoreCron: true)
- Specific session keys (exact match)
- Specific session key prefixes
- Specific agent IDs
- Arbitrary patterns (substring match)
- Heartbeat messages (via ignoreHeartbeat: true, default enabled)
- Custom trivial message prefixes (via ignoreTrivialMessages)

Implementation highlights:
- Add new config fields to Mem0Config + plugin schema
- Implement `shouldIgnoreTurn` helper and shared gating logic
- Implement `isTrivialMessage` helper
- Apply ignore checks to both recall and capture paths
- Add comprehensive Jest tests
- Update OpenClaw integration docs and README

Backwards compatibility:
- Session-level filters default off
- `ignoreHeartbeat` defaults on
- Manual memory tools remain available even when auto hooks are skipped
