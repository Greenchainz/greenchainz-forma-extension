import { render } from "preact";
import { ErrorBoundary } from "../../lib/error-boundary";
import { CarbonAnalysis } from "./CarbonAnalysis";

const app = document.getElementById("app");
if (!app) {
    console.error("Root element #app not found");
    document.body.innerHTML = "<p>Fatal error: Unable to initialize extension</p>";
} else {
    try {
        render(
            <ErrorBoundary>
                <CarbonAnalysis />
            </ErrorBoundary>,
            app
        );
    } catch (error) {
        console.error("Failed to render CarbonAnalysis:", error);
        app.innerHTML = `<div style="padding:24px;color:#991b1b">
      <strong>Failed to load GreenChainz Carbon Analysis</strong>
      <p style="margin-top:8px;font-size:12px">Please refresh the page or contact support.</p>
    </div>`;
    }
}
