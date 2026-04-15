# Black Sheep — MLB pregame intel

Research canvas + probability engine for MLB slates: implied vs model win probability, batter HR / 2+ TB fair odds, tier ladder (A+ through D). Sources of record: **MLB Stats API**, **Baseball Savant**, **RotoWire**, **Odds API** (moneylines). No FanGraphs requirement.

## Repository layout

| Path | Purpose |
|------|---------|
| `canvases/mlb-pregame-intel-apr15.canvas.tsx` | **Source of truth** — Cursor canvas (React). Edit here. |
| `canvases/exports/build_ml_exports.py` | Regenerates CSV + standalone HTML from the same logic as the canvas export path. |
| `canvases/exports/*.csv` | Game summaries + batter outlook exports (regenerate after slate updates). |
| `canvases/exports/mlb-pregame-intel-apr15-report.html` | Printable / shareable HTML snapshot. |
| `WORKFLOW.txt` | Short daily checklist (duplicate pointers; this README is canonical). |

## Cursor IDE and the live canvas

Cursor only auto-loads canvases from its managed folder. A **symlink** connects the IDE to this repo (one-time per machine):

`~/.cursor/projects/black-sheep-mlb/canvases/mlb-pregame-intel-apr15.canvas.tsx` → `canvases/mlb-pregame-intel-apr15.canvas.tsx`

Edit the file **inside this repo**; the symlink keeps the side panel in sync. On a new computer: clone the repo, open it in Cursor, then recreate that symlink or copy the `.canvas.tsx` into the `canvases` folder under `~/.cursor/projects/<your-workspace>/canvases/`.

## Daily workflow

1. Open `~/Projects/black-sheep-mlb` in Cursor.
2. Update the slate in `canvases/mlb-pregame-intel-apr15.canvas.tsx` (or add a new dated canvas file later).
3. Regenerate exports:  
   `python3 canvases/exports/build_ml_exports.py`
4. Commit when the slate is stable:  
   `git add -A && git commit -m "Slate update YYYY-MM-DD"`

## Git: do you need to push?

| Goal | What to do |
|------|------------|
| **Work only on this Mac** | **No.** Local `git commit` is enough; history stays on disk. |
| **Backup / second machine / phone view** | **Yes.** Add a **private** remote and push. |
| **Collaborate** | Push + invite collaborators on the host (GitHub, GitLab, etc.). |

Nothing is required beyond commits until you want off-box backup or sync.

### First push to GitHub (example)

```bash
cd ~/Projects/black-sheep-mlb
# Create an empty private repo on GitHub, then:
git remote add origin https://github.com/<you>/black-sheep-mlb.git
git push -u origin main
```

## Current status

- **Branch:** `main`
- **Latest commits:** initial import (canvas, exports, script), workflow/symlink notes.
- **Working tree:** should stay **clean** after each commit; run `git status` before ending a session.

## Optional cleanup

- If regenerated CSV/HTML noise in diffs is annoying, you can gitignore `canvases/exports/*.csv` and `*.html` and only commit the Python script + canvas — trade-off: exports are no longer in the repo snapshot.
