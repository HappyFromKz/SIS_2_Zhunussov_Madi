# AI usage — SIS 2 CI pipeline

## AI tool
| Item | Value |
|------|-------|
| Tool | Claude (claude.ai, web chat, Project "Testing and debugging") |
| Model | Claude Opus 5.5 |
| Mode | One conversation; the assignment guide (PDF) attached; the AI read the public repository |
| Role of the AI | Gap analysis against the assignment, generating config/workflow files, README draft |

## Prompts (summary, in order)
1. "Which parts of this SIS are already done?" + the guide `SIS_2_CI_pipeline_for_Playwright_step-by-step_guide.pdf`
   → the AI cloned the repository and compared it with the 6 requirements: none of the CI parts existed.
2. "Let's do it fast" → the AI generated all files below.

## What the AI generated
| File | Based on | Changes made relative to the guide |
|------|----------|------------------------------------|
| `.github/workflows/playwright.yml` | Step 3 of the guide | Added a `workflow_dispatch` input `shards` (1 or 4), so the "before/after" timing runs do not need temporary commits that edit the matrix |
| `playwright.config.ts` | Step 1 + the existing config | Kept `timeout`, `workers: 2`, `testIdAttribute`, `navigationTimeout` from SIS 2; `BASE_URL \|\| default` instead of `??`, because an unset GitHub variable is an empty string |
| `merge.config.ts` | Step 1 | none |
| `.gitignore` | Prerequisites + step 4 | added `reports/`, `all-blob-reports/`, `.act-artifacts/`, `.secrets` |
| `README.md` CI section | Step 5 template | filled with this project's details; the timing table was filled in by me from real GitHub Actions runs |

## What I checked / did myself
- Ran the suite locally in normal and CI mode; checked `forbidOnly` with a temporary `test.only`.
- Pushed to a feature branch, opened a PR, verified both runs, the npm cache restore in the second run and the artefacts.
- Measured "before" (1 shard) and "after" (4 shards) on GitHub Actions and filled in the table.

## Review of AI output
- The `??` → `||` fix: with `??` an empty `vars.BASE_URL` would produce `baseURL: ''` and every `page.goto('/')` would fail.
- `workers: 2` kept on purpose: the public demo site returns errors under higher load (found in SIS 2).
- The API test for another user's cart is marked `test.fail()` with a reference to BUG-001 rather than deleted.
