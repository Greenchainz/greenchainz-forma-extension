/**
 * Accessibility utilities for ARIA labels, keyboard navigation, and screen reader support.
 */

export const a11y = {
    /**
     * Generate an aria-label for a material card
     */
    materialCardLabel: (name: string, gwp?: number, unit?: string) => {
        const gwpText = gwp ? `, ${gwp} kg CO2e per ${unit || "unit"}` : "";
        return `Material: ${name}${gwpText}`;
    },

    /**
     * Generate aria-label for MCS badge
     */
    mcsBadgeLabel: (score?: number) => {
        if (!score) return "Unscored material";
        if (score >= 75) return `High score, ${score} out of 100`;
        if (score >= 50) return `Medium score, ${score} out of 100`;
        return `Low score, ${score} out of 100`;
    },

    /**
     * Generate aria-label for carbon value
     */
    carbonValueLabel: (gwp?: number, unit?: string) => {
        if (!gwp) return "Unknown embodied carbon";
        return `${gwp} kg CO2 equivalent per ${unit || "unit"}`;
    },

    /**
     * Generate aria-label for carbon saving percentage
     */
    carbonSavingLabel: (percent?: number) => {
        if (!percent) return "Unknown savings";
        return `${percent} percent less embodied carbon`;
    },
};

/**
 * Handle keyboard navigation for lists/grids
 * Supports arrow keys to navigate, Enter to select
 */
export function useKeyboardNavigation(items: string[], onSelect: (id: string) => void) {
    return (e: KeyboardEvent, currentId: string | null) => {
        const currentIndex = currentId ? items.indexOf(currentId) : -1;

        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            const nextIndex = Math.min(currentIndex + 1, items.length - 1);
            onSelect(items[nextIndex]);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            const prevIndex = Math.max(currentIndex - 1, 0);
            onSelect(items[prevIndex]);
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (currentId) onSelect(currentId);
        }
    };
}

/**
 * Announce text to screen readers without visual display
 * Useful for status updates, errors, etc.
 */
export function announceToScreenReader(message: string, assertive = false) {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", assertive ? "assertive" : "polite");
    announcement.style.cssText = "position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;";
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement is read (usually 1-2s)
    setTimeout(() => {
        announcement.remove();
    }, 3000);
}

/**
 * Make an element focusable and handle Enter/Space key
 */
export function makeClickable(el: HTMLElement, onClick: () => void) {
    if (!el.hasAttribute("role")) {
        el.setAttribute("role", "button");
    }
    if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "0");
    }

    el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
        }
    });

    el.addEventListener("click", onClick);
}
