import { WebSocketProvider } from './contexts/WebSocketContext';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <WebSocketProvider>
      <AppShell />
    </WebSocketProvider>
  );
}

export default App;
