# Black Sheep MLB

Production-grade starter scaffold for an MLB betting intelligence engine.

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python scripts/run_daily_slate.py
streamlit run app/streamlit_app.py
```

## What is included

- Deterministic v1 data collection layer with demo data fallback
- Pydantic schemas for games, props, and predictions
- Feature builders for game context, pitching, bullpen, lineup, and weather/park
- Simple moneyline model and baseline stubs for totals/HR/props
- Confidence grading + risk flagging + natural-language explanation
- End-to-end slate runner and Streamlit dashboard

## Demo pipeline

`python scripts/run_daily_slate.py` loads a demo slate, computes features, predicts moneyline edge, grades confidence, and writes outputs to `data/outputs/latest_predictions.json`.
