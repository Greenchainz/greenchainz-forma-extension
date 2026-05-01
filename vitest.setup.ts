import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/preact";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Forma SDK
global.Forma = {
  selection: {
    subscribe: vi.fn(() => () => {}),
    getSelection: vi.fn(async () => []),
    setSelection: vi.fn(async () => {}),
    clearSelection: vi.fn(async () => {}),
  },
  proposal: {
    getPropertiesAt: vi.fn(async () => ({})),
  },
  areaMetrics: {
    calculate: vi.fn(async () => ({
      builtInMetrics: {
        grossFloorArea: {
          functionBreakdown: [],
        },
      },
    })),
  },
  openFloatingPanel: vi.fn(async () => {}),
  extensions: {
    storage: {
      getTextObject: vi.fn(async () => null),
      setObject: vi.fn(async () => {}),
    },
  },
} as any;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
