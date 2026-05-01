/**
 * Local search history persistence
 * Stores recent material searches for quick access
 */

const SEARCH_HISTORY_KEY = "gc-search-history-v1";
const MAX_HISTORY = 10;

export interface SearchHistoryItem {
    query: string;
    category: string;
    timestamp: number;
}

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
    try {
        const data = localStorage.getItem(SEARCH_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Add item to search history
 */
export function addToSearchHistory(query: string, category: string): void {
    try {
        const history = getSearchHistory();
        const newItem: SearchHistoryItem = {
            query: query.trim(),
            category,
            timestamp: Date.now(),
        };

        // Remove duplicate of same query+category
        const filtered = history.filter((h) => !(h.query === query && h.category === category));

        // Keep newest at top, limit to MAX_HISTORY
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);

        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
        console.warn("Could not save search history:", err);
    }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
    try {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
        // silent
    }
}

/**
 * Get unique search queries (for autocomplete suggestions)
 */
export function getSearchSuggestions(prefix: string, category?: string): string[] {
    const history = getSearchHistory();
    const lower = prefix.toLowerCase();

    return (
        history
            .filter(
                (h) =>
                    h.query.toLowerCase().startsWith(lower) &&
                    (!category || h.category === category || h.category === "All")
            )
            .map((h) => h.query)
            .filter((val, idx, arr) => arr.indexOf(val) === idx) // unique
            .slice(0, 5)
    );
}
