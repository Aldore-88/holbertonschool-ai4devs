# Setup Notes: Claude Code in VS Code

## Versions

| Tool | Version |
|---|---|
| VS Code | 1.140.0 |
| Claude Code extension (`anthropic.claude-code`) | 2.1.318 |
| Node.js | 22.22.1 |
| Git | 2.53.0 |
| Python | 3.14.4 |

## Installation

1. Install **VS Code** from <https://code.visualstudio.com/>.
2. Open VS Code and go to the **Extensions** view (`Ctrl+Shift+X`).
3. Search for **Claude Code** (publisher: Anthropic) and click **Install**.
4. Click the **Claude** icon in the sidebar to open the Claude Code panel.
5. **Sign in** with your Claude account when prompted.

## Configuration

Settings are stored in `~/.claude/settings.json`:

```json
{
  "modelSettings": {
    "claude-opus-5-5": {
      "effortLevel": "xhigh"
    }
  }
}
```

- **Model:** Claude Opus 5.5
- **Effort level:** `xhigh`

## Verify

Open a project folder, then ask Claude Code in the panel something like *"summarize this file"*. If it answers, the setup works.
