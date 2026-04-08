import { vi } from "vitest";

// relay-test-utils calls jest.fn() internally — alias it to vi
(globalThis as any).jest = {
  fn: vi.fn,
  spyOn: vi.spyOn,
  mock: vi.mock,
};