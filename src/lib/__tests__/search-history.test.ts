import { describe, it, expect, beforeEach } from "vitest";
import {
    getSearchHistory,
    addToSearchHistory,
    clearSearchHistory,
    getSearchSuggestions,
} from "../../lib/search-history";

describe("search-history module", () => {
    beforeEach(() => {
        clearSearchHistory();
    });

    it("should add search to history", () => {
        addToSearchHistory("concrete", "All");
        const history = getSearchHistory();
        expect(history).toHaveLength(1);
        expect(history[0].query).toBe("concrete");
    });

    it("should prevent duplicate searches", () => {
        addToSearchHistory("concrete", "All");
        addToSearchHistory("concrete", "All");
        const history = getSearchHistory();
        expect(history).toHaveLength(1);
    });

    it("should get search suggestions", () => {
        addToSearchHistory("concrete", "All");
        addToSearchHistory("copper", "All");
        addToSearchHistory("steel", "All");

        const suggestions = getSearchSuggestions("c");
        expect(suggestions).toContain("concrete");
        expect(suggestions).toContain("copper");
        expect(suggestions).not.toContain("steel");
    });

    it("should limit history to MAX_HISTORY items", () => {
        for (let i = 0; i < 15; i++) {
            addToSearchHistory(`query-${i}`, "All");
        }
        const history = getSearchHistory();
        expect(history.length).toBeLessThanOrEqual(10);
    });

    it("should clear history", () => {
        addToSearchHistory("test", "All");
        clearSearchHistory();
        expect(getSearchHistory()).toHaveLength(0);
    });
});
