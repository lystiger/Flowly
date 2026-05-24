import asyncio
import json
import random
import time
from typing import Callable, Awaitable

class MockReader:
    def __init__(self, hz: int = 50):
        self.hz = hz
        self.running = False
        self.seq = 0
        self.callbacks = []

    def on_packet(self, callback: Callable[[str], Awaitable[None]]):
        self.callbacks.append(callback)

    async def start(self):
        self.running = True
        while self.running:
            packet = self._generate_packet()
            packet_str = json.dumps(packet)
            for cb in self.callbacks:
                try:
                    await cb(packet_str)
                except Exception as e:
                    print(f"Callback error: {e}")
            await asyncio.sleep(1.0 / self.hz)

    def stop(self):
        self.running = False

    def _generate_packet(self) -> dict:
        self.seq += 1
        return {
            "device_id": "glove_right_01",
            "seq": self.seq,
            "timestamp_ms": int(time.time() * 1000),
            "flex": [
                random.randint(400, 600),
                random.randint(500, 700),
                random.randint(500, 700),
                random.randint(300, 500),
                random.randint(300, 500)
            ],
            "imu": {
                "accel": {"x": random.uniform(-1, 1), "y": random.uniform(-1, 1), "z": random.uniform(-1, 1)},
                "gyro": {"x": random.uniform(-2, 2), "y": random.uniform(-2, 2), "z": random.uniform(-2, 2)},
                "mag": {"x": random.uniform(10, 30), "y": random.uniform(-10, 10), "z": random.uniform(10, 30)},
                "temp": random.uniform(25.0, 35.0)
            },
            "battery": random.randint(80, 100),
            "rssi": random.randint(-60, -40),
            "source": "mock"
        }
