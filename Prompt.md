# AI tool and prompt

## Tool identification

| Item | Value |
| --- | --- |
| Tool | **Claude Code** (Anthropic) — agentic CLI for software engineering |
| Model reported by the session runtime | `deepseek-flash[1m]` |
| Interface | Claude Code in the terminal (JetBrains/WebStorm project) |
| Capabilities used | Shell, file read/write, Playwright browser automation, live web/API inspection |
| Reasoning mode | Agent default (no separate reasoning-effort override was set) |
| Date of session | 23 October 2026 |
| Task | SIS 2 — Test Automation with Playwright |

> The model line above is what the Claude Code session reported at runtime. If the grading environment shows a different model name in the UI, that UI value is authoritative; the agent product used was Claude Code.

## Exact prompt

The block below reproduces the message sent to the tool **verbatim** (only the Markdown code fence was added). No additional instruction or follow-up prompt was sent; the agent worked autonomously until the deliverables were complete.

```text
hey do me this work

SIS 2 
Test Automation with Playwright 
DEADLINE - Oct 23
LINK to Site to be tested 
https://practicesoftwaretesting.com/

At least 5 AT suits mentioned in the Pres - use any language you want with the Playwright framework. 
 Description.md - file: explain what you want to do 
List of TCs to be automated 
Prompt.md file save exactly the prompt you used for the AI tool; mark exactly which tool you gonna use, like Claude Opus 5 Max efforts, etc 
Review.md: explain what the AI results were about, how you reviewed and modified them, and justify your decisions 
Screenshots - AI response, Run results or whatever you think matters 
Link to public GitHub repository. 
Google Forms link:

https://docs.google.com/forms/d/e/1FAIpQLSeG3uxaPlfoz9ECk9a46oP2qo4d-mm9g5LjeTKrUIpSRMDnxw/viewform?usp=publish-editor
```

## What the tool was asked to produce

1. A Playwright project against the specified site.
2. At least five automated test suites.
3. `Description.md` describing the intended work.
4. A list of test cases to automate.
5. `Prompt.md` (this file) with the exact prompt and tool identification.
6. `Review.md` covering the AI output, the review process and justified changes.
7. Screenshots of the AI response and the test run.
8. Preparation of a public GitHub repository.

All items were produced. The concrete implementation decisions, corrections to the AI's first assumptions, and the verification evidence are documented in [Review.md](./Review.md).
