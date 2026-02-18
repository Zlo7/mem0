# Summary
This PR adds configurable ignore filters to the OpenClaw Mem0 plugin so auto memory hooks can be skipped for selected turns/sessions while preserving manual memory tools.

## What’s included
- New config options:
  - `ignoreCron`
  - `ignoreSessionKeys`
  - `ignoreSessionKeyPrefixes`
  - `ignoreAgentIds`
  - `ignorePatterns`
  - `ignoreHeartbeat` (default `true`)
  - `ignoreTrivialMessages`
- Shared ignore decision helper (`shouldIgnoreTurn`)
- Trivial-message helper (`isTrivialMessage`)
- Gating in both auto-recall and auto-capture flows
- Unit tests covering ignore semantics and edge cases
- Docs updates in OpenClaw README + docs site integration page

## Why
Users need predictable control over when automatic memory hooks run, especially for cron sessions, heartbeats, and low-signal messages.

## Backward compatibility
- Existing setups continue to work.
- Ignore filters are opt-in except `ignoreHeartbeat` defaulting to true to suppress keepalive noise.
- Manual memory operations are unchanged.

## Validation
- Unit tests for helper semantics
- Hook-level checks that ignored turns skip recall/capture
- Docs examples for common filter configurations
