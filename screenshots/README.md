# Screenshots and evidence

Captured on **23 October 2026** from the final local run.

| File | What it shows | How it was produced |
| --- | --- | --- |
| `ai-session.png` | Excerpt of the Claude Code session: the exact assignment prompt and the AI's response summary, including the 32-test breakdown. | Rendering of `ai-session.html`, the transcript excerpt prepared for the submission. |
| `ai-session.html` | Source of the rendered AI-session excerpt. | Written from the session; the exact original prompt is in `../Prompt.md`. |
| `report-overview.png` | Playwright HTML report: **32 passed, 0 failed**, all six suites. | `npx playwright test` → `scripts/capture-screenshots.mjs` opens `playwright-report/index.html`. |
| `report-test-detail.png` | Step-by-step execution of `TC-CHK-01` with timings and the attached order-confirmation screenshot. | Same report, test detail view. |
| `checkout-confirmation.png` | Real application state after a completed purchase: “Thanks for your order! Your invoice number is INV-2026000039.” | Captured by `TC-CHK-01` and attached to the HTML report. |

## Regenerate

```bash
PLAYWRIGHT_CHANNEL=chrome npx playwright test
PLAYWRIGHT_CHANNEL=chrome node scripts/capture-screenshots.mjs
```

The checkout screenshot is regenerated automatically by `TC-CHK-01`, so the invoice number changes on each run.
