type IgnoreFilterConfig = {
  ignoreCron: boolean;
  ignoreSessionKeys: string[];
  ignoreSessionKeyPrefixes: string[];
  ignoreAgentIds: string[];
  ignorePatterns: string[];
};

export function shouldIgnoreTurn(
  ctx: { agentId?: string; sessionKey?: string },
  config: IgnoreFilterConfig,
): boolean {
  const sessionKey = ctx?.sessionKey;
  if (!sessionKey) return false;

  // Parse agent session key: "agent:<agentId>:<rest>"
  const agentPrefixMatch = sessionKey.match(/^agent:[^:]+:/);
  const rest = agentPrefixMatch
    ? sessionKey.slice(agentPrefixMatch[0].length)
    : null;

  // 1. ignoreCron — check if rest portion starts with "cron:"
  if (config.ignoreCron && rest?.startsWith("cron:")) {
    return true;
  }

  // 2. Exact session key match
  if (config.ignoreSessionKeys.length > 0) {
    if (config.ignoreSessionKeys.includes(sessionKey)) return true;
  }

  // 3. Prefix match — check against both full key and rest portion
  if (config.ignoreSessionKeyPrefixes.length > 0) {
    if (config.ignoreSessionKeyPrefixes.some(p => sessionKey.startsWith(p))) {
      return true;
    }
    if (rest && config.ignoreSessionKeyPrefixes.some(p => rest.startsWith(p))) {
      return true;
    }
  }

  // 4. Agent ID match — prefer ctx.agentId, fallback to parsing key
  if (config.ignoreAgentIds.length > 0) {
    const agentId = ctx.agentId
      ?? (sessionKey.startsWith("agent:") ? sessionKey.split(":")[1] : undefined);
    if (agentId && config.ignoreAgentIds.includes(agentId)) {
      return true;
    }
  }

  // 5. Substring pattern match — check against both full key and rest portion
  if (config.ignorePatterns.length > 0) {
    if (config.ignorePatterns.some(p => sessionKey.includes(p))) {
      return true;
    }
    if (rest && config.ignorePatterns.some(p => rest.includes(p))) {
      return true;
    }
  }

  return false;
}
