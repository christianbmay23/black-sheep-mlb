# EchoIQ Verification Taxonomy v1.0

## Levels

| Tag | Definition | Act on it? |
|-----|-----------|------------|
| `VERIFIED` | Data retrieved from live source this session (MLB.com, Savant pull, Outlier screen, BPP screen, weather API) | Yes — unreservedly |
| `HIGH_CONF_INFERENCE` | From established player/park profile; broadly stable; likely accurate within 1 season | Yes — with stated caveat |
| `LOW_CONF_INFERENCE` | Inferred from outcomes (ERA, win-loss) rather than process metrics; may be directionally correct | Hedge language required; do NOT present as fact |
| `UNSUPPORTED` | No source; generated from archetype or analogy only | Do NOT present as data; label as assumption |

---

## Inline Tag Format

Use bracket tags inside any analytical claim:

```
[VERIFIED] Vientos BPP rating 112, Unlucky -36 (BPP session pull, 2026-05-16)
[HIGH_CONF_INFERENCE] Rodón arsenal: 4S/slider/change — established 2024 profile; 2026 mix unconfirmed
[LOW_CONF_INFERENCE] Bassitt sinker velo declining — inferred from 5.21 ERA; no 2026 Statcast pull
[UNSUPPORTED] Zone heat map — archetype inference only; no Savant zone data retrieved
```

---

## Claim Schema (reusable template for any analytical assertion)

```json
{
  "claim": "string — the assertion being made",
  "verification_tag": "VERIFIED | HIGH_CONF_INFERENCE | LOW_CONF_INFERENCE | UNSUPPORTED",
  "source": "string — actual source, or 'analyst inference' if none",
  "source_date": "YYYY-MM-DD or 'career profile'",
  "upgrade_action": "string — what data pull would upgrade this to VERIFIED",
  "confidence_impact": "HIGH | MEDIUM | LOW — how much does uncertainty here affect the play?"
}
```

### Example

```json
{
  "claim": "Chandler sweeper finishes 18-22 inches horizontal",
  "verification_tag": "LOW_CONF_INFERENCE",
  "source": "analyst inference from 2024 pitch archetype",
  "source_date": "career profile",
  "upgrade_action": "Pull Chandler 2026 Savant pitch arsenal page — movement column",
  "confidence_impact": "MEDIUM"
}
```

---

## Rule

**Any claim tagged LOW_CONF_INFERENCE or UNSUPPORTED must use hedged language:**
- "historically," "typically," "based on prior profile," "unverified for 2026"

**Never state LOW_CONF or UNSUPPORTED claims as present-tense facts.**
