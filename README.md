# Toolshop — Playwright test automation (SIS 2)

[![Playwright Tests](https://github.com/HappyFromKz/SIS_2_Zhunussov_Madi/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/HappyFromKz/SIS_2_Zhunussov_Madi/actions/workflows/playwright.yml)

E2E and API tests for https://practicesoftwaretesting.com/ written with Playwright + TypeScript.

- `Description.md` — goal and list of test cases
- `Prompt.md` — prompt used for the AI tool (test generation)
- `Review.md` — review of AI output
- `AI-usage-CI.md` — AI usage for the CI pipeline part
- `BUG-001.md` — defect found by the API tests
- `screenshots/` — AI response and run results

```bash
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report
```

## CI

**CI system:** GitHub Actions. It is built into GitHub, where the repository already lives, needs no server of its own, is free for public repositories and supports matrices for sharding.

**Pipeline** (`.github/workflows/playwright.yml`):
- runs on every push and pull request (no branch filter), plus manual runs (`workflow_dispatch`);
- `npm ci` with the npm cache (`actions/setup-node`, `cache: npm`), Chromium installed with system dependencies;
- the full Playwright suite (no `--grep` / `--project` filters) split into 4 shards (`--shard=i/4`) running in parallel;
- the `merge-reports` job merges the shards' blob reports into one HTML report and JUnit;
- artefacts: `playwright-report` (HTML), `test-results-N` (traces, screenshots, videos, JUnit), `junit-report`; kept for 14 days.
- a manual run with input `shards = 1` runs the same suite as one job — used for the "before" timing.

**CI settings** (`playwright.config.ts`, when `CI=true`): `forbidOnly: true`, `retries: 2`, reporters `list`, `blob`, `junit`, `trace: 'on-first-retry'`. `baseURL` is read from the `BASE_URL` variable (default: the public Toolshop).

**Known defect:** the test *"a user cannot read another user's cart"* is marked with `test.fail()` — it documents BUG-001 and keeps the pipeline green. If the defect is fixed, the test will report it.

**Known CI issue — Cloudflare bot protection.** On GitHub-hosted runners the UI tests fail: practicesoftwaretesting.com answers runner IPs (data-centre addresses) with a Cloudflare "Performing security verification" challenge instead of the page, so locators time out — see [screenshots/ci-cloudflare.png](screenshots/ci-cloudflare.png), taken from the `test-results-4` artefact. The same tests pass locally in CI mode (`CI=true npx playwright test`, home IP), and the API tests pass in CI because the API host does not show the challenge. This is an environment restriction of a public demo site, not a test defect; bypassing the protection would be inappropriate. Options for a real project: a test environment without bot protection, an allowlist for CI IPs, or a self-hosted runner.

### Runtime

| Configuration | Total run time | Run tests step (slowest shard) | Run |
| --- | --- | --- | --- |
| 1 job, no sharding | X min Y s | X min Y s | [run](LINK) |
| 4 shards + merge | X min Y s | X min Y s | [run](LINK) |

Median of 3 runs via `workflow_dispatch`. Conclusion: CONCLUSION

### Running locally

```bash
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test
```
PowerShell: `$env:CI = "true"; npx playwright test; Remove-Item Env:CI`
