# Prompt Documentation

## 1. AI Tool
| Item | Value |
|------|-------|
| Tool | Claude (claude.ai, web chat) |
| Model | Claude Opus 5.5 |
| Mode | Single conversation, file attachments + code execution sandbox |
| Role of the AI | Code generation, failure analysis, documentation drafting |

## 2. Prompt
Attachment: `SIS_2_.pdf` (assignment specification)

```
Role: Senior QA Automation Engineer.

Task: Using the attached assignment as the specification, create a complete end-to-end
test automation project for https://practicesoftwaretesting.com/

Stack: Playwright Test + TypeScript, Chromium, Page Object Model.

Requirements:
- At least 5 test suites: authentication, product search/sort/filter,
  product details & cart, contact form, customer registration.
- Cover both positive and negative scenarios.
- Use data-test attributes (getByTestId) and web-first assertions; no fixed waits.
- Tests must be independent and repeatable (unique test data for each run).
- Configure an HTML report and screenshot/video/trace on failure.

Deliverables:
- Full project code, ready to run.
- Description.md with the goal and the list of test cases.
- Prompt.md and a Review.md draft.
- README with run instructions.

Do not omit any part of the deliverable.
```

## 3. Prompting Strategy
1. **Specification as context:** the official assignment PDF was attached, so the model worked
   from the exact requirements.
2. **Structured prompt:** role, task, stack, requirements and deliverables are stated explicitly.
3. **Feedback loop with real evidence:** after generation, every follow-up message contained real
   execution data (console output, failure screenshots, targeted re-runs) so the model analysed
   actual failures instead of guessing.

## 4. Iteration Prompts
| # | Input provided to the AI | Objective | Outcome |
|---|--------------------------|-----------|---------|
| 1 | Console output of run 1 (16 passed / 4 failed) | Root-cause analysis | Shared demo account lockout identified; login suite redesigned |
| 2 | Failure screenshot of TC-20 (blank page) | Diagnose registration failure | Test enhanced with response/validation diagnostics |
| 3 | Targeted re-run of TC-20 (`-g "TC-20" --retries=0`) | Confirm root cause | New required field *House number* added to Page Object |
| 4 | Console output of run 2 (14 passed / 3 flaky / 3 failed) | Stabilise suite | Navigation timeouts, assertion text, `count()` race fixed |
| 5 | Console output of run 3 (18 passed / 2 failed) | Remove external data dependency | Login suite registers its own user in `beforeAll` |
| 6 | Console output of run 4 (20 passed) | Final verification | Review.md finalised |

## 5. Lessons Learned
Two requirements were missing from the prompt and caused most of the fixes described in Review.md:
- **"Do not use shared demo accounts"**: the generated login tests used the public demo account,
  which got locked (fixes #1, #2, #8).
- **"Avoid exact-text assertions where messages may vary"**: caused the TC-02 failure (fix #5).

I would add both lines to the prompt in future projects.
