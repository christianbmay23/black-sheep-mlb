import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1] if "pages" not in __file__ else Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import json
from pathlib import Path

import streamlit as st

st.header("Slate Hub")
path = Path("data/outputs/latest_predictions.json")
if path.exists():
    st.json(json.loads(path.read_text()))
else:
    st.info("Run `python scripts/run_daily_slate.py` to generate predictions.")
