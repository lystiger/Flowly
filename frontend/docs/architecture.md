src/
├── types/
│   └── sensor.ts               ← All domain types (SensorPacket, IMUFrame, etc.)
├── mocks/
│   └── sensorGenerator.ts      ← Simulates hand open/close wave at ~30Hz
├── contexts/
│   └── WebSocketContext.tsx    ← Mock + real WS pipeline, packet history, rate tracking
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        ← Root layout + page routing
│   │   ├── Sidebar.tsx         ← Collapsible nav, icon-rail on collapse
│   │   └── TopStatusBar.tsx    ← Persistent connection health strip
│   ├── shared/
│   │   ├── StatusBadge.tsx     ← CONNECTED / RECONNECTING / ERROR with semantic color
│   │   └── MetricChip.tsx      ← Compact label + value display
│   ├── sensors/
│   │   ├── FlexSensorPanel.tsx ← Per-finger ADC bars + normalization %
│   │   └── IMUPanel.tsx        ← 9-axis grid (orientation / accel / gyro)
│   └── charts/
│       └── RealtimeCharts.tsx  ← FlexChart + IMUOrientationChart (isAnimationActive=false)
└── pages/
    └── LiveMonitor/
        └── LiveMonitorPage.tsx ← 2-column layout, derived chart data, raw packet view