# AI Configuration

## Tools
- **IDE:** VS Code
- **AI assistant:** Claude Code (VS Code extension + CLI)
- **Supporting extensions:** Prettier, ESLint

## Configuration File
The AI settings are stored in [`settings.json`](settings.json) at the project root.
It has two parts: rules for each language and specialized AI workflows.

## Language-Specific Rules

| Language   | Style guide | Key rules                                                         | Tests  |
|------------|-------------|-------------------------------------------------------------------|--------|
| Python     | black       | Type hints required, flake8, 88-char lines, Google docstrings     | pytest |
| JavaScript | airbnb      | Semicolons, single quotes, ESLint + Prettier                      | jest   |
| Markdown   | —           | ATX headings (`#`), 100-char lines                                | —      |

## Specialized AI Workflows

### 1. Code Review
- **Focus areas:** security, performance, readability, error handling
- **Severity threshold:** reports issues rated medium or higher
- **Suggest fixes:** the AI suggests a fix for each finding
- **Usage:** run `/code-review` in Claude Code on the current changes before committing

### 2. Documentation Generator
- **Targets:** `README.md` and function docstrings
- **Trigger:** on each commit
- **Examples:** adds usage examples to generated docs
- Addresses the pain point *"Repetitive documentation updates"* (see [workflow_baseline.md](workflow_baseline.md))

### 3. Test Generator
- **Coverage target:** 80%
- **Edge cases:** included
- Addresses the pain point *"Too much manual test writing"*

## Setup Steps
1. Install VS Code and the Claude Code extension.
2. Sign in to Claude Code from the extension panel.
3. Install the Prettier and ESLint extensions.
4. Put `settings.json` in the project root.
5. Install the Python tools: `pip install black flake8 pytest`.
6. Install the JavaScript tools: `npm install --save-dev eslint prettier jest eslint-config-airbnb-base`.
7. Open the project and use the AI workflows from the Claude Code panel.
