# ESP32 Sensor Calibration & Data Flow Dashboard UI Design Spec

## Project Summary

Build a modern engineering dashboard for an ESP32-based sensor glove system.

The dashboard is used to:

- Calibrate flex sensors
- Visualize real-time sensor data
- Monitor GY87 IMU data
- Inspect ESP-NOW communication
- Debug I/O data flow
- Track signal stability, latency, packet loss, and noise
- Prepare the system for future AI gesture inference

This is not a normal admin dashboard.  
Design it like an embedded systems observability tool.

Inspired by:

- Grafana
- ThingsBoard
- Node-RED
- Robotics telemetry dashboards
- Industrial SCADA panels
- Oscilloscope / lab instrumentation UI

---

# Design Direction

## Style

Use a dark, technical, engineering-focused interface.

Preferred visual feeling:

- Modern embedded lab
- Industrial telemetry
- Mission control
- Clean but powerful
- Dense information, but not messy

Avoid:

- Generic SaaS admin dashboard
- Too many colorful cards
- Marketing-style UI
- Toy-like visuals

---

# Tech Stack Assumption

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts or ECharts
- React Flow
- Zustand
- WebSocket / Socket.IO

Backend later:

- FastAPI
- Serial / ESP-NOW bridge
- Real-time data streaming

For now, use mock data.

---

# Main Dashboard Layout

## Global Layout

Use a 3-section layout:

```txt
┌──────────────────────────────────────────────┐
│ Top Status Bar                               │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ Main Content                  │
│ Navigation   │ Dashboard Panels              │
└──────────────┴───────────────────────────────┘