import { useState } from 'react';
import { Sidebar, type PageId } from './Sidebar';
import { TopStatusBar } from './TopStatusBar';
import { LiveMonitorPage } from '../../pages/LiveMonitor/LiveMonitorPage';

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
      case 'calibration':      return <PageNotBuilt label="Calibration" />;
      case 'flow-health':      return <PageNotBuilt label="Flow Health" />;
      case 'session-recorder': return <PageNotBuilt label="Session Recorder" />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopStatusBar />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
