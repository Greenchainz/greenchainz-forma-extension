/**
 * Retry logic with exponential backoff for API resilience
 */

export interface RetryOptions {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    isRetryable?: (error: Error) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    isRetryable: (error: Error) => {
        // Only retry on network errors, not on client errors like 400/401
        return (
            error instanceof TypeError ||
            error.message.includes("Network") ||
            error.message.includes("fetch")
        );
    },
};

/**
 * Retry a promise-returning function with exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error | null = null;
    let delay = opts.initialDelayMs;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Don't retry if not retryable
            if (!opts.isRetryable(lastError)) {
                throw lastError;
            }

            // Don't retry if last attempt
            if (attempt === opts.maxAttempts) {
                throw lastError;
            }

            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
        }
    }

    throw lastError || new Error("Retry failed");
}

/**
 * Create a retryable fetch wrapper
 */
export async function fetchWithRetry(
    url: string,
    init?: RequestInit,
    options?: RetryOptions
): Promise<Response> {
    return withRetry(() => fetch(url, init), options);
}
