def confidence_tier(edge: float) -> str:
    abs_edge = abs(edge)
    if abs_edge >= 0.08:
        return "A"
    if abs_edge >= 0.05:
        return "B"
    if abs_edge >= 0.025:
        return "C"
    return "D"
