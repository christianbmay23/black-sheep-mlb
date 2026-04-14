# Black Sheep MLB

Black Sheep is an MLB betting intelligence engine that combines baseball data, market odds, predictive modeling, and analyst-style reasoning.

## Core Goal

Generate daily MLB predictions with:

- moneyline probabilities
- totals projections
- player prop predictions
- home run probabilities
- fair odds
- edge detection
- confidence grades
- analyst-style explanations

## First Run

Install dependencies:

```bash
pip install -r requirements.txt
```

Run demo slate:

```bash
python scripts/run_daily_slate.py
```

Run dashboard:

```bash
streamlit run app/streamlit_app.py
```

## Build Philosophy

Every prediction should follow this chain:

verified inputs -> normalized data -> engineered features -> model output -> confidence/risk grading -> written explanation -> display
