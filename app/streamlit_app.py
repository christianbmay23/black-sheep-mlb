import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1] if "pages" not in __file__ else Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import streamlit as st

st.set_page_config(page_title="Black Sheep MLB", layout="wide")
st.title("Black Sheep MLB Betting Intelligence")
st.write("Use the sidebar pages for slate hub, best bets, HR board, props, and results.")
