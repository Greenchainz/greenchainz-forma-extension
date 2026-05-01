import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getAuthToken, setAuthToken, clearAuthToken } from "../../lib/auth";

// Simple localStorage mock
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

Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
    writable: true,
});

describe("auth module", () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it("should store and retrieve auth token", () => {
        setAuthToken("test-token-123");
        expect(getAuthToken()).toBe("test-token-123");
    });

    it("should clear auth token", () => {
        setAuthToken("test-token");
        clearAuthToken();
        expect(getAuthToken()).toBeNull();
    });

    it("should return null if no token stored", () => {
        clearAuthToken();
        expect(getAuthToken()).toBeNull();
    });
});
