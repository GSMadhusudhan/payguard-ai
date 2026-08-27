def calculate_z_score(
    current_value: float,
    historical_mean: float | None,
    historical_standard_deviation: float | None,
) -> float | None:
    if historical_mean is None:
        return None

    if historical_standard_deviation is None:
        return None

    if historical_standard_deviation <= 0:
        return None

    return (
        current_value - historical_mean
    ) / historical_standard_deviation


def ratio_to_baseline(
    current_value: float | None,
    baseline_value: float | None,
) -> float | None:
    if current_value is None or baseline_value is None:
        return None

    if baseline_value <= 0:
        return None

    return current_value / baseline_value
