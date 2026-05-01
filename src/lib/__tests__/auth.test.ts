import { describe, it, expect } from "vitest";
import { getAuthToken, setAuthToken, clearAuthToken } from "../../lib/auth";

describe("auth module", () => {
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
