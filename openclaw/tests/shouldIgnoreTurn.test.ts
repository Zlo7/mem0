import { shouldIgnoreTurn } from "../src/shouldIgnoreTurn";

const defaults = {
  ignoreCron: false,
  ignoreSessionKeys: [] as string[],
  ignoreSessionKeyPrefixes: [] as string[],
  ignoreAgentIds: [] as string[],
  ignorePatterns: [] as string[],
};

// --- ignoreCron ---

describe("ignoreCron", () => {
  it("ignores cron job session", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:cron:daily" },
        { ...defaults, ignoreCron: true },
      ),
    ).toBe(true);
  });

  it("ignores cron run session", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:cron:daily:run:abc123" },
        { ...defaults, ignoreCron: true },
      ),
    ).toBe(true);
  });

  it("does not ignore non-cron session", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:main" },
        { ...defaults, ignoreCron: true },
      ),
    ).toBe(false);
  });

  it("disabled by default", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:cron:daily" },
        { ...defaults },
      ),
    ).toBe(false);
  });
});

// --- ignoreSessionKeyPrefixes ---

describe("ignoreSessionKeyPrefixes", () => {
  it("matches rest portion", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:cron:daily" },
        { ...defaults, ignoreSessionKeyPrefixes: ["cron:"] },
      ),
    ).toBe(true);
  });

  it("matches full key", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:scheduler:main" },
        { ...defaults, ignoreSessionKeyPrefixes: ["agent:scheduler:"] },
      ),
    ).toBe(true);
  });

  it("no match", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:main" },
        { ...defaults, ignoreSessionKeyPrefixes: ["cron:"] },
      ),
    ).toBe(false);
  });
});

// --- ignoreSessionKeys ---

describe("ignoreSessionKeys", () => {
  it("exact match", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:cron:daily" },
        { ...defaults, ignoreSessionKeys: ["agent:main:cron:daily"] },
      ),
    ).toBe(true);
  });

  it("no match", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:cron:daily" },
        { ...defaults, ignoreSessionKeys: ["agent:main:cron:nightly"] },
      ),
    ).toBe(false);
  });
});

// --- ignoreAgentIds ---

describe("ignoreAgentIds", () => {
  it("matches via ctx.agentId", () => {
    expect(
      shouldIgnoreTurn(
        { agentId: "scheduler", sessionKey: "agent:scheduler:main" },
        { ...defaults, ignoreAgentIds: ["scheduler"] },
      ),
    ).toBe(true);
  });

  it("matches via key parsing fallback", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:scheduler:main" },
        { ...defaults, ignoreAgentIds: ["scheduler"] },
      ),
    ).toBe(true);
  });

  it("no match", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:main" },
        { ...defaults, ignoreAgentIds: ["scheduler"] },
      ),
    ).toBe(false);
  });
});

// --- ignorePatterns ---

describe("ignorePatterns", () => {
  it("substring match in full key", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:cron:health-check:run:abc" },
        { ...defaults, ignorePatterns: ["health-check"] },
      ),
    ).toBe(true);
  });

  it("no match", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:main" },
        { ...defaults, ignorePatterns: ["health-check"] },
      ),
    ).toBe(false);
  });
});

// --- Edge cases ---

describe("edge cases", () => {
  it("empty config does not ignore", () => {
    expect(
      shouldIgnoreTurn(
        { sessionKey: "agent:main:main" },
        { ...defaults },
      ),
    ).toBe(false);
  });

  it("no sessionKey returns false", () => {
    expect(
      shouldIgnoreTurn(
        {},
        { ...defaults, ignoreCron: true },
      ),
    ).toBe(false);
  });
});
