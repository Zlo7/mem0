export type TrivialMessageConfig = {
  ignoreHeartbeat: boolean;
  ignoreTrivialMessages: string[];
};

/**
 * Build the effective list of trivial-message prefixes from config.
 * When ignoreHeartbeat is true, "HEARTBEAT_OK" is appended.
 */
export function buildTrivialPrefixes(config: TrivialMessageConfig): string[] {
  const prefixes = [...config.ignoreTrivialMessages];
  if (config.ignoreHeartbeat) prefixes.push("HEARTBEAT_OK");
  return prefixes;
}

/**
 * Returns true if the given user message content is trivial
 * (starts with any of the configured prefixes after trimming leading whitespace).
 */
export function isTrivialMessage(
  content: string,
  trivialPrefixes: string[],
): boolean {
  if (trivialPrefixes.length === 0) return false;
  const trimmed = content.trimStart();
  return trivialPrefixes.some((p) => trimmed.startsWith(p));
}
