/**
 * Loading skeleton components for better perceived performance.
 * Displayed while data is being fetched.
 */

export function MaterialCardSkeleton() {
    return (
        <div class="gc-card" style="background: var(--surface-level250, #f5f5f5); animation: pulse 1.5s infinite">
            <div style="height: 12px; background: var(--text-dim); border-radius: 4px; margin-bottom: 8px; width: 70%" />
            <div style="height: 10px; background: var(--text-dim); border-radius: 4px; margin-bottom: 4px; width: 50%; opacity: 0.6" />
            <div style="height: 10px; background: var(--text-dim); border-radius: 4px; width: 60%; opacity: 0.6" />
        </div>
    );
}

export function MaterialSearchSkeleton() {
    return (
        <div class="gc-results">
            {Array.from({ length: 4 }).map((_, i) => (
                <MaterialCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function CarbonSummarySkeleton() {
    return (
        <div class="gc-carbon-summary" style="animation: pulse 1.5s infinite">
            <div style="height: 10px; background: var(--text-dim); border-radius: 4px; margin-bottom: 6px; width: 40%" />
            <div style="height: 24px; background: var(--text-dim); border-radius: 4px; margin-bottom: 12px; width: 60%" />
            <div style="height: 10px; background: var(--text-dim); border-radius: 4px; margin-bottom: 6px; width: 40%" />
            <div style="height: 20px; background: var(--text-dim); border-radius: 4px; width: 50%" />
        </div>
    );
}

export function ProjectScanSkeleton() {
    return (
        <div style="display:flex;flex-direction:column;gap:12px">
            <CarbonSummarySkeleton />
            <div style="height: 32px; background: var(--text-dim); border-radius: 4px; animation: pulse 1.5s infinite; width: 100%" />
        </div>
    );
}
