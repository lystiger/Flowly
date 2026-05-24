import { useState } from 'react';
import { Sidebar, type PageId } from './Sidebar';
import { TopStatusBar } from './TopStatusBar';
import { BottomConsole } from './BottomConsole';
import { LiveMonitorPage } from '../../pages/LiveMonitor/LiveMonitorPage';
import { CalibrationPage } from '../../pages/Calibration/CalibrationPage';
import { FlowHealthPage } from '../../pages/FlowHealth/FlowHealthPage';

function PageNotBuilt({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
      <span className="text-4xl font-mono font-bold mb-2">--</span>
      <span className="text-xs font-mono tracking-widest uppercase">{label} — Coming next</span>
    </div>
  );
}

export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>('live-monitor');

  const renderPage = () => {
    switch (activePage) {
      case 'live-monitor':     return <LiveMonitorPage />;
      case 'calibration':      return <CalibrationPage />;
      case 'flow-health':      return <FlowHealthPage />;
      case 'session-recorder': return <PageNotBuilt label="Session Recorder" />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <TopStatusBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-hidden bg-zinc-900/10">
          <div className="h-full w-full overflow-auto custom-scrollbar">
            {renderPage()}
          </div>
        </main>
      </div>
      <BottomConsole />
    </div>
  );
}
