import { Component, ReactNode } from "preact";

interface Props {
    children: ReactNode;
    fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
    error: Error | null;
}

/**
 * Simple error boundary for catching and displaying errors gracefully.
 * Falls back to a generic error UI if no fallback is provided.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null };
    }

    componentDidCatch(error: Error) {
        this.setState({ error });
        console.error("Caught error in boundary:", error);
    }

    handleRetry = () => {
        this.setState({ error: null });
    };

    render() {
        const { error } = this.state;
        const { children, fallback } = this.props;

        if (error) {
            return fallback?.(error, this.handleRetry) ?? <DefaultErrorFallback error={error} onRetry={this.handleRetry} />;
        }

        return children;
    }
}

interface ErrorFallbackProps {
    error: Error;
    onRetry: () => void;
}

function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
    return (
        <div class="gc-empty" style="color:#991b1b;padding:24px">
            <div style="font-weight:600;margin-bottom:8px">Oops, something went wrong</div>
            <div style="font-size:12px;color:rgba(60,60,60,0.7);margin-bottom:12px">
                {error.message || "An unexpected error occurred. Try refreshing."}
            </div>
            <weave-button variant="outlined" onClick={onRetry}>
                Try Again
            </weave-button>
        </div>
    );
}
