from app.services.signal_filter import SignalFilterService


def test_moving_average_and_ema_return_filtered_value():
    service = SignalFilterService(moving_average_window=3, ema_alpha=1.0, deadzone=0)

    service.process("thumb", 100)
    service.process("thumb", 200)
    result = service.process("thumb", 300)

    assert result["filtered"] == 200


def test_spike_rejection_uses_previous_raw():
    service = SignalFilterService(spike_threshold=50, deadzone=0)

    service.process("index", 100)
    result = service.process("index", 1000)

    assert result["filtered"] == 100


def test_stability_score_stays_between_zero_and_one():
    service = SignalFilterService(spike_threshold=250)

    service.process("middle", 100)
    result = service.process("middle", 200)

    assert 0 <= result["stability_score"] <= 1
    assert 0 <= result["stability"] <= 1


def test_process_flex_returns_all_fingers():
    service = SignalFilterService()

    result = service.process_flex([100, 200, 300, 400, 500])

    assert set(result) == {"thumb", "index", "middle", "ring", "pinky"}
