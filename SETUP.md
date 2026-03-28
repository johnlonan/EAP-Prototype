# Setup Guide for Designers

## Step 1 — Clone the repo

```bash
git clone <repo-url>
cd horizon-2.0-alpha
```

## Step 2 — Open in VS Code

```bash
code .
```

## Step 3 — Install Claude Code

1. Open the Extensions panel in VS Code (`Cmd+Shift+X`)
2. Search for **Claude Code** and install it
3. Sign in with your Anthropic account

## Step 4 — Connect Figma

When you first share a Figma URL in the chat, Claude will prompt you to authorize your Figma account. Follow the on-screen instructions.

## Step 5 — Start prototyping

Open the Claude chat panel and try:

> "Here's a Figma link: [paste your URL] — please generate an HTML component from this design"

Claude will create the component in the `components/` folder. Open it in your browser to preview.

---

## Tips

- You can ask Claude to adjust the design, add interactions, or wire multiple components into a full page
- Keep mock data in `data/*.json` — Claude can generate realistic data files for you too
- Preview any HTML file directly in the browser — no server needed
- If you want the prototype to use real-looking data, ask: "Add 10 sample incidents to the data file"
