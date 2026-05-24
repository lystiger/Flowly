import { WebSocketProvider } from './contexts/WebSocketContext';
import { CalibrationProvider } from './contexts/CalibrationContext';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <WebSocketProvider>
      <CalibrationProvider>
        <AppShell />
      </CalibrationProvider>
    </WebSocketProvider>
  );
}

export default App;
