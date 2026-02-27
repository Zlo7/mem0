import { buildTrivialPrefixes, isTrivialMessage } from "../src/isTrivialMessage";

// --- buildTrivialPrefixes ---

describe("buildTrivialPrefixes", () => {
  it("returns empty when both disabled", () => {
    expect(
      buildTrivialPrefixes({ ignoreHeartbeat: false, ignoreTrivialMessages: [] }),
    ).toEqual([]);
  });

  it("includes HEARTBEAT_OK when ignoreHeartbeat is true", () => {
    const prefixes = buildTrivialPrefixes({ ignoreHeartbeat: true, ignoreTrivialMessages: [] });
    expect(prefixes).toContain("HEARTBEAT_OK");
  });

  it("includes custom prefixes", () => {
    const prefixes = buildTrivialPrefixes({ ignoreHeartbeat: false, ignoreTrivialMessages: ["PING", "PONG"] });
    expect(prefixes).toEqual(["PING", "PONG"]);
  });

  it("combines heartbeat and custom prefixes", () => {
    const prefixes = buildTrivialPrefixes({ ignoreHeartbeat: true, ignoreTrivialMessages: ["PING"] });
    expect(prefixes).toEqual(["PING", "HEARTBEAT_OK"]);
  });
});

// --- isTrivialMessage ---

describe("isTrivialMessage", () => {
  it("matches HEARTBEAT_OK exactly", () => {
    expect(isTrivialMessage("HEARTBEAT_OK", ["HEARTBEAT_OK"])).toBe(true);
  });

  it("matches HEARTBEAT_OK with trailing content", () => {
    expect(isTrivialMessage("HEARTBEAT_OK some extra data", ["HEARTBEAT_OK"])).toBe(true);
  });

  it("matches after leading whitespace", () => {
    expect(isTrivialMessage("  HEARTBEAT_OK", ["HEARTBEAT_OK"])).toBe(true);
  });

  it("does not match HEARTBEAT_OK in the middle", () => {
    expect(isTrivialMessage("Status: HEARTBEAT_OK", ["HEARTBEAT_OK"])).toBe(false);
  });

  it("does not match partial prefix", () => {
    expect(isTrivialMessage("HEARTBEAT_OKAY", ["HEARTBEAT_OK"])).toBe(true);
  });

  it("matches custom prefix", () => {
    expect(isTrivialMessage("PING server", ["PING", "PONG"])).toBe(true);
  });

  it("does not match unrelated content", () => {
    expect(isTrivialMessage("Hello, how are you?", ["HEARTBEAT_OK", "PING"])).toBe(false);
  });

  it("returns false with empty prefix list", () => {
    expect(isTrivialMessage("HEARTBEAT_OK", [])).toBe(false);
  });

  it("does not match short real messages", () => {
    expect(isTrivialMessage("Option A", ["HEARTBEAT_OK", "PING"])).toBe(false);
  });

  it("does not match real preferences", () => {
    expect(isTrivialMessage("I prefer dark mode", ["HEARTBEAT_OK"])).toBe(false);
  });

  it("repeated HEARTBEAT_OK messages", () => {
    expect(
      isTrivialMessage("HEARTBEAT_OK HEARTBEAT_OK HEARTBEAT_OK", ["HEARTBEAT_OK"]),
    ).toBe(true);
  });
});
