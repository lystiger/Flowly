import asyncio
from collections.abc import Awaitable, Callable

import serial


class SerialReader:
    def __init__(self, port: str, baudrate: int, reconnect_delay: float = 2.0) -> None:
        self.port = port
        self.baudrate = baudrate
        self.reconnect_delay = reconnect_delay
        self.running = False
        self.callbacks: list[Callable[[str], Awaitable[None]]] = []
        self._serial: serial.Serial | None = None

    def on_packet(self, callback: Callable[[str], Awaitable[None]]) -> None:
        self.callbacks.append(callback)

    async def start(self) -> None:
        self.running = True
        while self.running:
            try:
                await self._read_loop()
            except Exception as exc:
                print(f"Serial reader error: {exc}")
                await asyncio.sleep(self.reconnect_delay)

    async def _read_loop(self) -> None:
        self._serial = serial.Serial(self.port, self.baudrate, timeout=1)
        try:
            while self.running:
                raw_line = await asyncio.to_thread(self._serial.readline)
                if not raw_line:
                    continue
                line = raw_line.decode("utf-8", errors="replace").strip()
                for callback in self.callbacks:
                    await callback(line)
        finally:
            if self._serial and self._serial.is_open:
                self._serial.close()

    def stop(self) -> None:
        self.running = False
        if self._serial and self._serial.is_open:
            self._serial.close()
