import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const defaultsPath = resolve(process.cwd(), "config/ai-review-defaults.json");
const defaults = JSON.parse(readFileSync(defaultsPath, "utf8"));

const model = defaults.reviewModel;
const budgetUsd = Number(defaults.monthlyBudgetUsd);

const currentSpendUsd = Number.parseFloat(process.env.AI_REVIEW_MONTHLY_SPEND_USD ?? "0");
const estimatedCostUsd = Number.parseFloat(process.env.AI_REVIEW_ESTIMATED_COST_USD ?? "0");

if (!Number.isFinite(currentSpendUsd) || currentSpendUsd < 0) {
  console.error("AI_REVIEW_MONTHLY_SPEND_USD must be a non-negative number.");
  process.exit(1);
}

if (!Number.isFinite(estimatedCostUsd) || estimatedCostUsd < 0) {
  console.error("AI_REVIEW_ESTIMATED_COST_USD must be a non-negative number.");
  process.exit(1);
}

const projectedSpendUsd = Number((currentSpendUsd + estimatedCostUsd).toFixed(4));
const remainingBudgetUsd = Number((budgetUsd - projectedSpendUsd).toFixed(4));

const outputFile = process.env.GITHUB_OUTPUT;
if (outputFile) {
  appendFileSync(outputFile, `review_model=${model}\n`);
  appendFileSync(outputFile, `monthly_budget_usd=${budgetUsd}\n`);
  appendFileSync(outputFile, `projected_spend_usd=${projectedSpendUsd}\n`);
  appendFileSync(outputFile, `remaining_budget_usd=${Math.max(remainingBudgetUsd, 0)}\n`);
}

if (projectedSpendUsd > budgetUsd) {
  console.error(
    `AI review blocked: projected monthly spend $${projectedSpendUsd.toFixed(2)} exceeds budget $${budgetUsd.toFixed(2)}.`,
  );
  process.exit(1);
}

console.log(`AI review model: ${model}`);
console.log(
  `Projected monthly spend: $${projectedSpendUsd.toFixed(2)} / $${budgetUsd.toFixed(2)}.`,
);
