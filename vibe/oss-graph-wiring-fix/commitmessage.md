fix(openclaw): wire OSS graph configuration through plugin index.ts

Enable graph materialization for OpenClaw mem0 OSS mode by passing
graph_store config to the Memory constructor when enableGraph is true.

Changes:
- Add graphStore to oss config type definition
- Accept enableGraph in OSSProvider constructor
- Pass graph_store config to Memory when enableGraph=true
- Add validation: fail fast with clear error if enableGraph=true but
  graphStore config is missing
- Add startup diagnostic logging when graph is enabled

This fixes the issue where enableGraph was parsed and logged but not
actually wired into the OSS Memory initialization path, causing Neo4j
to remain empty even with enableGraph: true.
