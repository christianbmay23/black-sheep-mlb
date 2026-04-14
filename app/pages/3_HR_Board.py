import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1] if "pages" not in __file__ else Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import streamlit as st

st.header("HR Board")
st.write("HR model scaffold is active; detailed board output comes in the next iteration.")
