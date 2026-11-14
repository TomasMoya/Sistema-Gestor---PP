export type BudgetTone = "success" | "warning" | "danger";

/** < 80 % success · 80–100 % warning · > 100 % danger (§ SummaryCard / ProgressBar del handoff). */
export function budgetTone(ratio: number): BudgetTone {
  if (ratio > 1) return "danger";
  if (ratio >= 0.8) return "warning";
  return "success";
}
