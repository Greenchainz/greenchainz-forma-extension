/**
 * Dev-only stub for forma-embedded-view-sdk/auto.
 * Aliased by Vite in `serve` (development) mode so panels render outside Autodesk Forma.
 * Production builds use the real SDK — this file is never bundled for production.
 */

export const Forma = {
  selection: {
    subscribe: (_cb: (data: { paths: string[] }) => void): (() => void) => {
      return () => {};
    },
    getSelection: async (): Promise<string[]> => [],
    clearSelection: async (): Promise<void> => {},
    setSelection: async (_: { paths: string[] }): Promise<void> => {},
  },

  openFloatingPanel: async (_: {
    embeddedViewId: string;
    url: string;
    title: string;
    preferredSize?: { width: number; height: number };
    placement?: { type: string };
  }): Promise<void> => {
    console.info("[Forma dev stub] openFloatingPanel called — ignored outside Forma");
  },

  proposal: {
    getPropertiesAt: async (_: { path: string }): Promise<{ name: string }> => ({
      name: "Concrete Core Wall",
    }),
  },

  areaMetrics: {
    calculate: async (_: unknown): Promise<{
      builtInMetrics: {
        grossFloorArea: {
          functionBreakdown: Array<{ functionName: string; value: number }>;
        };
      };
    }> => ({
      builtInMetrics: {
        grossFloorArea: {
          functionBreakdown: [
            { functionName: "Residential", value: 4200 },
            { functionName: "Commercial", value: 1800 },
            { functionName: "Parking", value: 950 },
          ],
        },
      },
    }),
  },

  extensions: {
    storage: {
      getTextObject: async (_: { key: string }): Promise<{ data: string } | null> => null,
      setObject: async (_: { key: string; data: string }): Promise<void> => {},
    },
  },
};
