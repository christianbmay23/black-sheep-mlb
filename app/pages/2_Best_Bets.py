import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1] if "pages" not in __file__ else Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import json
from pathlib import Path

import streamlit as st

st.header("Best Bets")
path = Path("data/outputs/latest_predictions.json")
if path.exists():
    preds = json.loads(path.read_text())
    best = sorted(preds, key=lambda p: p["edge"], reverse=True)
    st.dataframe(best)
else:
    st.info("No predictions yet.")
