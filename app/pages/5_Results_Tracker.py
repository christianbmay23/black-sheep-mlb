import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1] if "pages" not in __file__ else Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import json
from pathlib import Path

import streamlit as st

st.header("Results Tracker")
article = Path("data/outputs/latest_article.md")
if article.exists():
    st.markdown(article.read_text())
else:
    st.info("No graded results yet.")
