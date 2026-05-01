import { useState, useEffect } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";
import { searchMaterials, formatGwp } from "../../lib/greenchainz-api";
import type { GCMaterial, StructuralSystem, ProjectCarbonEstimate, CarbonBudget } from "../../lib/types";

const BUDGET_STORAGE_KEY = "gc-carbon-budget-v1";

// Typical embodied carbon intensities (kgCO2e/m² GFA, A1-A5 structure + envelope).
// Conventional = industry baseline from EC3 / CLF studies.
// GC Verified = achievable with EPD-verified low-carbon products on GreenChainz catalog.
const SYSTEMS: Record<StructuralSystem, {
  label: string;
  conventional: number;
  gcVerified: number;
  materialQuery: string;
}> = {
  concrete: { label: "Reinforced Concrete", conventional: 310, gcVerified: 195, materialQuery: "Ready-Mix Concrete" },
  steel:    { label: "Structural Steel",    conventional: 280, gcVerified: 175, materialQuery: "Structural Steel"   },
  timber:   { label: "Mass Timber (CLT)",   conventional: 125, gcVerified:  95, materialQuery: "Cross-Laminated Timber" },
  hybrid:   { label: "Concrete-Timber Hybrid", conventional: 210, gcVerified: 145, materialQuery: "Ready-Mix Concrete" },
};

export function ProjectScan() {
  const [gfa, setGfa]                   = useState<number | null>(null);
  const [gfaRows, setGfaRows]           = useState<{ name: string; area: number }[]>([]);
  const [system, setSystem]             = useState<StructuralSystem>("concrete");
  const [estimate, setEstimate]         = useState<ProjectCarbonEstimate | null>(null);
  const [budget, setBudget]             = useState<CarbonBudget | null>(null);
  const [budgetInput, setBudgetInput]   = useState("");
  const [budgetPerM2, setBudgetPerM2]   = useState(false);
  const [suggestions, setSuggestions]   = useState<GCMaterial[]>([]);
  const [loadingGfa, setLoadingGfa]     = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => { void loadGfa(); void loadBudget(); }, []);
  useEffect(() => { if (gfa !== null) computeEstimate(gfa, system); }, [gfa, system]);
  useEffect(() => { void loadSuggestions(system); }, [system]);

  async function loadGfa() {
    setLoadingGfa(true);
    setError(null);
    try {
      const metrics = await Forma.areaMetrics.calculate({});
      const gfaMetric = metrics.builtInMetrics.grossFloorArea;
      const rows = gfaMetric.functionBreakdown
        .filter((f) => typeof f.value === "number" && (f.value as number) > 0)
        .map((f) => ({ name: f.functionName, area: f.value as number }))
        .sort((a, b) => b.area - a.area);
      const total = rows.reduce((s, r) => s + r.area, 0);
      setGfa(total);
      setGfaRows(rows);
    } catch {
      setError("Could not load project area metrics. Add building elements to the proposal first.");
    } finally {
      setLoadingGfa(false);
    }
  }

  async function loadBudget() {
    try {
      const res = await Forma.extensions.storage.getTextObject({ key: BUDGET_STORAGE_KEY });
      if (res?.data) {
        const saved = JSON.parse(res.data) as CarbonBudget;
        setBudget(saved);
        setBudgetInput(String(saved.targetKgCo2e));
        setBudgetPerM2(saved.perM2);
      }
    } catch { /* no saved budget */ }
  }

  async function saveBudget(target: number, perM2: boolean) {
    const next: CarbonBudget = { targetKgCo2e: target, perM2 };
    setBudget(next);
    try {
      await Forma.extensions.storage.setObject({ key: BUDGET_STORAGE_KEY, data: JSON.stringify(next) });
    } catch { /* non-fatal */ }
  }

  function computeEstimate(totalGfa: number, sys: StructuralSystem) {
    const { conventional, gcVerified } = SYSTEMS[sys];
    const conventionalGwp = Math.round(totalGfa * conventional);
    const gcVerifiedGwp   = Math.round(totalGfa * gcVerified);
    const savingPercent   = Math.round(((conventionalGwp - gcVerifiedGwp) / conventionalGwp) * 100);
    setEstimate({ gfaM2: totalGfa, system: sys, conventionalGwp, gcVerifiedGwp, savingPercent });
  }

  async function loadSuggestions(sys: StructuralSystem) {
    try {
      const results = await searchMaterials({ query: SYSTEMS[sys].materialQuery, limit: 3, minMcs: 60 });
      setSuggestions(results);
    } catch { setSuggestions([]); }
  }

  function handleBudgetSubmit(e: Event) {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) saveBudget(val, budgetPerM2);
  }

  const budgetTarget = budget && gfa
    ? (budget.perM2 ? budget.targetKgCo2e * gfa : budget.targetKgCo2e)
    : null;

  if (loadingGfa) return <div class="gc-loading">Loading project metrics…</div>;
  if (error)      return <div class="gc-empty" style="color:#991b1b">{error}</div>;
  if (gfa === null || gfa === 0) {
    return (
      <div class="gc-empty">
        <p>No building elements found in this proposal.</p>
        <p style="margin-top:4px">Add buildings to the Forma canvas to see carbon estimates.</p>
      </div>
    );
  }

  return (
    <div style="display:flex;flex-direction:column;gap:12px">
      {/* GFA summary */}
      <div class="gc-carbon-summary">
        <div class="gc-carbon-label">Gross Floor Area</div>
        <div class="gc-carbon-value" style="font-size:20px">{gfa.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²</div>
        {gfaRows.length > 0 && (
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:3px">
            {gfaRows.slice(0, 4).map((r) => (
              <div key={r.name} style="display:flex;justify-content:space-between;font-size:11px">
                <span style="color:var(--text-dim)">{r.name}</span>
                <span>{r.area.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Structural system picker */}
      <div>
        <div class="gc-carbon-label" style="margin-bottom:6px">Structural System</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          {(Object.keys(SYSTEMS) as StructuralSystem[]).map((sys) => (
            <button
              key={sys}
              class={`gc-chip${system === sys ? " active" : ""}`}
              onClick={() => setSystem(sys)}
            >
              {SYSTEMS[sys].label}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-side carbon estimate */}
      {estimate && (
        <div>
          <div class="gc-carbon-label" style="margin-bottom:6px">Embodied Carbon Estimate (A1–A5)</div>
          <div style="display:flex;gap:6px">
            <div class="gc-ec-card conventional">
              <div class="gc-ec-card-label">Conventional</div>
              <div class="gc-ec-card-value conventional">{(estimate.conventionalGwp / 1000).toFixed(1)} tCO₂e</div>
              <div class="gc-ec-card-sub">{SYSTEMS[system].conventional} kgCO₂e/m²</div>
            </div>
            <div class="gc-ec-card gc-verified">
              <div class="gc-ec-card-label">GC Verified</div>
              <div class="gc-ec-card-value gc-verified">{(estimate.gcVerifiedGwp / 1000).toFixed(1)} tCO₂e</div>
              <div class="gc-ec-card-sub">Save {estimate.savingPercent}% · {SYSTEMS[system].gcVerified} kgCO₂e/m²</div>
            </div>
          </div>
        </div>
      )}

      {/* Carbon budget */}
      <div>
        <div class="gc-carbon-label" style="margin-bottom:6px">Carbon Budget Target</div>
        <form onSubmit={handleBudgetSubmit} style="display:flex;gap:4px;align-items:center">
          <input
            type="number"
            min="1"
            class="gc-budget-input"
            placeholder={budgetPerM2 ? "kgCO₂e/m²" : "kgCO₂e total"}
            value={budgetInput}
            onInput={(e) => setBudgetInput((e.target as HTMLInputElement).value)}
          />
          <button
            type="button"
            class={`gc-chip${budgetPerM2 ? " active" : ""}`}
            style="flex-shrink:0;font-size:10px;white-space:nowrap"
            onClick={() => setBudgetPerM2(!budgetPerM2)}
          >
            {budgetPerM2 ? "/m²" : "total"}
          </button>
          <weave-button type="submit" variant="solid" style="flex-shrink:0;font-size:11px">
            Set
          </weave-button>
        </form>

        {budget && estimate && budgetTarget !== null && (
          <BudgetBar
            conventionalGwp={estimate.conventionalGwp}
            gcVerifiedGwp={estimate.gcVerifiedGwp}
            budgetTarget={budgetTarget}
          />
        )}
      </div>

      {/* GreenChainz verified material suggestions */}
      {suggestions.length > 0 && (
        <div class="gc-swap-section">
          <h3>Verified {SYSTEMS[system].label} on GreenChainz</h3>
          {suggestions.map((m) => (
            <div key={m.id} class="gc-swap-card">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="flex:1;margin-right:6px">
                  <div style="font-size:12px;font-weight:600">{m.name}</div>
                  {m.manufacturer && (
                    <div style="font-size:11px;color:var(--text-dim)">{m.manufacturer}</div>
                  )}
                </div>
                {m.materialCreditScore !== undefined && (
                  <span
                    class={`gc-mcs-badge ${m.materialCreditScore >= 75 ? "high" : m.materialCreditScore >= 50 ? "medium" : "low"}`}
                  >
                    MCS {m.materialCreditScore}
                  </span>
                )}
              </div>
              <div style="font-size:11px;margin-top:3px;color:var(--text-dim)">
                {formatGwp(m.gwpPerUnit, m.gwpUnit)}
              </div>
            </div>
          ))}
          <weave-button
            variant="outlined"
            style="width:100%;margin-top:4px;font-size:11px"
            onClick={() =>
              Forma.openFloatingPanel({
                embeddedViewId: "greenchainz-project-materials",
                url: `https://greenchainz.com/materials?q=${encodeURIComponent(SYSTEMS[system].materialQuery)}&mcs=60&source=forma-project`,
                title: `GreenChainz — ${SYSTEMS[system].label}`,
                preferredSize: { width: 560, height: 700 },
              })
            }
          >
            Browse All Verified {SYSTEMS[system].label} →
          </weave-button>
        </div>
      )}

      {/* Generate report */}
      <weave-button
        variant="outlined"
        style="width:100%"
        onClick={() => {
          if (!estimate) return;
          const params = new URLSearchParams({
            gfa: String(Math.round(estimate.gfaM2)),
            system,
            conventional: String(estimate.conventionalGwp),
            gcVerified: String(estimate.gcVerifiedGwp),
            source: "forma",
          });
          Forma.openFloatingPanel({
            embeddedViewId: "greenchainz-carbon-report",
            url: `https://greenchainz.com/reports/new?${params.toString()}`,
            title: "GreenChainz — Carbon Report",
            preferredSize: { width: 700, height: 800 },
            placement: { type: "center" },
          });
        }}
      >
        Generate Carbon Report
      </weave-button>
    </div>
  );
}

interface BudgetBarProps {
  conventionalGwp: number;
  gcVerifiedGwp: number;
  budgetTarget: number;
}

function BudgetBar({ conventionalGwp, gcVerifiedGwp, budgetTarget }: BudgetBarProps) {
  const convPct   = Math.min((conventionalGwp / budgetTarget) * 100, 100);
  const gcPct     = Math.min((gcVerifiedGwp   / budgetTarget) * 100, 100);
  const overConv  = conventionalGwp > budgetTarget;
  const overGc    = gcVerifiedGwp   > budgetTarget;
  const targetLabel = budgetTarget >= 1_000_000
    ? `${(budgetTarget / 1000).toFixed(0)} tCO₂e`
    : `${budgetTarget.toLocaleString()} kgCO₂e`;

  return (
    <div style="margin-top:8px">
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px">
        <span style={`font-weight:600;color:${overConv ? "#991b1b" : "#166534"}`}>
          Conventional {overConv ? `+${Math.round((conventionalGwp / budgetTarget - 1) * 100)}% over` : `${Math.round(convPct)}%`}
        </span>
        <span style={`font-weight:600;color:${overGc ? "#854d0e" : "#166534"}`}>
          GC Verified {overGc ? `+${Math.round((gcVerifiedGwp / budgetTarget - 1) * 100)}% over` : `${Math.round(gcPct)}%`}
        </span>
      </div>
      <div class="gc-budget-track">
        <div class="gc-budget-fill conventional" style={`width:${convPct}%`} />
      </div>
      <div class="gc-budget-track" style="margin-top:3px">
        <div class="gc-budget-fill gc-verified" style={`width:${gcPct}%`} />
      </div>
      <div style="font-size:10px;color:var(--text-dim);margin-top:4px;text-align:right">
        Budget: {targetLabel}
      </div>
      {!overConv && !overGc && (
        <div class="gc-budget-status ok">Both options within budget ✓</div>
      )}
      {overConv && !overGc && (
        <div class="gc-budget-status ok">GreenChainz materials bring you within budget ✓</div>
      )}
      {overConv && overGc && (
        <div class="gc-budget-status warn">Both exceed budget — consider Mass Timber or contact GreenChainz</div>
      )}
    </div>
  );
}
