import React, { useState, lazy, Suspense, Component, ErrorInfo } from 'react';
import { useApp } from '../App';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LoadingOverlay } from './common/LoadingOverlay';
import { GalleryOverlay } from './common/GalleryOverlay';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '../utils/helpers';
import { usePhonePortrait } from '../hooks/use-shell';
import {
  DashboardSkeleton,
  RekapSkeleton,
  SatlinmasSkeleton,
  InputSkeleton,
  PetaSkeleton,
  AduanSkeleton,
  SurveiSkeleton,
  PengaturanSkeleton,
  CctvSkeleton,
} from './SkeletonPages';

// Error boundary to catch lazy load failures
class PageErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[PageError]:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <XCircle className="h-10 w-10 text-muted opacity-50" />
          <p className="text-sm text-mid">Terjadi penyegaran komponen sistem, silakan coba lagi.</p>
          <button
            className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-blue px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-blueh active:translate-y-0"
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Page components (lazy loaded for code splitting)
const Dashboard      = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const RekapLaporan   = lazy(() => import('../pages/RekapLaporan').then(m => ({ default: m.RekapLaporan })));
const InputLaporan   = lazy(() => import('../pages/InputLaporan').then(m => ({ default: m.InputLaporan })));
const DataSatlinmas  = lazy(() => import('../pages/DataSatlinmas').then(m => ({ default: m.DataSatlinmas })));
const Pengaturan     = lazy(() => import('../pages/Pengaturan').then(m => ({ default: m.Pengaturan })));
const PetaPedestrian = lazy(() => import('../pages/PetaPedestrian').then(m => ({ default: m.PetaPedestrian })));
const CctvPedestrian = lazy(() => import('../pages/CctvPedestrian').then(m => ({ default: m.CctvPedestrian })));
const Aduan          = lazy(() => import('../pages/Aduan').then(m => ({ default: m.Aduan })));
const Survei         = lazy(() => import('../pages/Survei').then(m => ({ default: m.Survei })));
const Sampah         = lazy(() => import('../pages/Sampah').then(m => ({ default: m.Sampah })));

export const AppLayout: React.FC = () => {
  const { activeTab, toasts, removeToast } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem('sb-collapsed') === 'true');
  const isPhonePortrait = usePhonePortrait();

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sb-collapsed', String(next));
      return next;
    });
  };

  const renderActiveTab = () => {
    const wrap = (node: React.ReactNode, fallback: React.ReactNode) => (
      <Suspense fallback={fallback}>{node}</Suspense>
    );
    switch (activeTab) {
      case 'db':
        return wrap(<Dashboard />, <DashboardSkeleton />);
      case 'rk':
      case 'pedestrian':
        return wrap(<RekapLaporan kategori="pedestrian" />, <RekapSkeleton />);
      case 'poskamling':
        return wrap(<RekapLaporan kategori="poskamling" />, <RekapSkeleton />);
      case 'posyandu':
        return wrap(<RekapLaporan kategori="posyandu" />, <RekapSkeleton />);
      case 'kebencanaan':
        return wrap(<RekapLaporan kategori="kebencanaan" />, <RekapSkeleton />);
      case 'yanmas':
        return wrap(<RekapLaporan kategori="yanmas" />, <RekapSkeleton />);
      case 'lainnya':
        return wrap(<RekapLaporan kategori="lainnya" />, <RekapSkeleton />);
      case 'in':
        return wrap(<InputLaporan />, <InputSkeleton />);
      case 'sl':
        return wrap(<DataSatlinmas />, <SatlinmasSkeleton />);
      case 'pt':
        return wrap(<PetaPedestrian />, <PetaSkeleton />);
      case 'cc':
      case 'cctv':
        return wrap(<CctvPedestrian />, <CctvSkeleton />);
      case 'ad':
      case 'aduan':
        return wrap(<Aduan />, <AduanSkeleton />);
      case 'sv':
      case 'survei':
        return wrap(<Survei />, <SurveiSkeleton />);
      case 'sampah':
        return wrap(<Sampah />, <RekapSkeleton />);
      case 'set':
        return wrap(<Pengaturan />, <PengaturanSkeleton />);
      default:
        return wrap(<Dashboard />, <DashboardSkeleton />);
    }
  };

  const renderToastIcon = (type: 'ok' | 'er' | 'inf') => {
    switch (type) {
      case 'ok':
        return <CheckCircle className="inline-block h-4 w-4 align-middle text-green" />;
      case 'er':
        return <XCircle className="inline-block h-4 w-4 align-middle text-red" />;
      case 'inf':
      default:
        return <Info className="inline-block h-4 w-4 align-middle text-blue" />;
    }
  };

  return (
    <div id="app-wrap" className="relative min-h-screen bg-bg font-sans transition-colors duration-300">
      {/* Mobile Sidebar Backdrop */}
      <div
        id="mbb"
        className={cn(
          'fixed inset-0 z-[1100] bg-[rgba(0,0,0,.38)]',
          isMobileSidebarOpen && isPhonePortrait ? 'block' : 'hidden'
        )}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      <div id="app" className="flex min-h-screen overflow-hidden">
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          setIsOpenMobile={setIsMobileSidebarOpen}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
        <div
          className={cn(
            'flex min-h-screen flex-1 flex-col overflow-hidden transition-all duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)]',
            isPhonePortrait
              ? 'ml-0 max-w-[100vw]'
              : collapsed
                ? 'ml-[60px] max-w-[calc(100vw-60px)]'
                : 'ml-[var(--sw)] max-w-[calc(100vw-var(--sw))]'
          )}
        >
          <Topbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

          <div
            className="w-full flex-1 overflow-y-auto overflow-x-hidden p-3 min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto md:p-4"
            id="ct"
          >
            <PageErrorBoundary>
              {renderActiveTab()}
            </PageErrorBoundary>
          </div>
        </div>
      </div>

      {/* Global Overlays & Modals */}
      <LoadingOverlay />
      <GalleryOverlay />

      {/* Toast container */}
      <div id="tco" className="pointer-events-none fixed bottom-6 right-5 z-[99995] flex flex-col items-end max-md:bottom-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto w-[280px] cursor-pointer animate-toast-in rounded-xl border-l-4 bg-card p-3 px-4 text-[.76rem] font-semibold text-text shadow-[0_10px_30px_rgba(0,0,0,.15)] backdrop-blur-[10px] flex items-center gap-2.5',
              t.type === 'ok' && 'border-l-green',
              t.type === 'er' && 'border-l-red',
              t.type === 'inf' && 'border-l-blue'
            )}
            onClick={() => removeToast(t.id)}
          >
            {renderToastIcon(t.type)}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AppLayout;
