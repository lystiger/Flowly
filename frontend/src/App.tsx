import { WebSocketProvider } from './contexts/WebSocketContext';
import { CalibrationProvider } from './contexts/CalibrationContext';
import { SessionRecorderProvider } from './contexts/SessionRecorderContext';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <WebSocketProvider>
      <CalibrationProvider>
        <SessionRecorderProvider>
          <AppShell />
        </SessionRecorderProvider>
      </CalibrationProvider>
    </WebSocketProvider>
  );
}

export default App;
