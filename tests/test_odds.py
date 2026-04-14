from black_sheep.utils.odds import american_to_implied_prob, implied_prob_to_american


def test_american_to_implied_prob_positive() -> None:
    assert round(american_to_implied_prob(150), 4) == 0.4


def test_american_to_implied_prob_negative() -> None:
    assert round(american_to_implied_prob(-150), 4) == 0.6


def test_roundtrip_conversion() -> None:
    start_prob = 0.55
    odds = implied_prob_to_american(start_prob)
    roundtrip = american_to_implied_prob(odds)
    assert abs(roundtrip - start_prob) < 0.01
