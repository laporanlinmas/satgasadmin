import { 
  BarChart3, 
  Inbox, 
  Calendar, 
  MessageSquare, 
  Star, 
  AlertTriangle, 
  Smile, 
  Award, 
  ThumbsUp, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle,
  ThumbsDown
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { esc } from '../utils/helpers';
import { SurveiSkeleton } from '../components/SkeletonPages';

// Firebase imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { Chart } from 'chart.js/auto';

interface SurveyResponse {
  id: string;
  nama: string;
  pekerjaan: string;
  kemudahan: number;
  kegunaan: number;
  kecepatan: number;
  keakuratan: number;
  rekomendasi: number;
  saran: string;
  timestamp?: any;
  createdAt: string;
}

// Inisialisasi Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const isFirebaseConfigured = !!process.env.FIREBASE_PROJECT_ID;
const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;
const db = app ? getFirestore(app) : null;

export const Survei: React.FC = () => {
  const { triggerToast } = useApp();
  const [surveyList, setSurveyList] = useState<SurveyResponse[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  // Charts references
  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const radarChartInstance = useRef<any>(null);
  const barChartInstance = useRef<any>(null);

  // Pagination for feedback/saran
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Listen to Firestore real-time updates for survey
  useEffect(() => {
    if (!db) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    const colRef = collection(db, 'survey_kepuasan');
    
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: SurveyResponse[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            nama: data.nama || '',
            pekerjaan: data.pekerjaan || '',
            kemudahan: Number(data.kemudahan || 0),
            kegunaan: Number(data.kegunaan || 0),
            kecepatan: Number(data.kecepatan || 0),
            keakuratan: Number(data.keakuratan || 0),
            rekomendasi: Number(data.rekomendasi || 0),
            saran: data.saran || '',
            createdAt: data.createdAt || '',
          });
        });

        // Sort by date/createdAt desc
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setSurveyList(list);
        setIsFetching(false);
      },
      (error) => {
        console.error('Error onSnapshot survey:', error);
        triggerToast('Gagal memuat data survei.', 'er');
        setIsFetching(false);
      }
    );

    return () => unsubscribe();
  }, [triggerToast]);

  // Calculate Metrics
  const totalResponses = surveyList.length;
  
  const getAverage = (key: keyof Omit<SurveyResponse, 'id' | 'saran' | 'createdAt' | 'timestamp'>) => {
    if (totalResponses === 0) return 0;
    const sum = surveyList.reduce((acc, curr) => acc + (curr[key] as number), 0);
    return Number((sum / totalResponses).toFixed(2));
  };

  const avgKemudahan = getAverage('kemudahan');
  const avgKegunaan = getAverage('kegunaan');
  const avgKecepatan = getAverage('kecepatan');
  const avgKeakuratan = getAverage('keakuratan');
  const avgRekomendasi = getAverage('rekomendasi');

  const overallAverage = Number(
    ((avgKemudahan + avgKegunaan + avgKecepatan + avgKeakuratan + avgRekomendasi) / 5).toFixed(2)
  );

  // Identify highest and lowest
  const metrics = [
    { label: 'Kemudahan Sistem', val: avgKemudahan, icon: <Smile className="w-4 h-4 text-blue-500" /> },
    { label: 'Kemanfaatan Fitur', val: avgKegunaan, icon: <Award className="w-4 h-4 text-emerald-500" /> },
    { label: 'Kecepatan Respon', val: avgKecepatan, icon: <ThumbsUp className="w-4 h-4 text-purple-500" /> },
    { label: 'Keakuratan Data', val: avgKeakuratan, icon: <ShieldCheck className="w-4 h-4 text-amber-500" /> },
    { label: 'Rekomendasi Layanan', val: avgRekomendasi, icon: <ThumbsUp className="w-4 h-4 text-indigo-500" /> },
  ];

  const sortedMetrics = [...metrics].sort((a, b) => b.val - a.val);
  const highestMetric = totalResponses > 0 ? sortedMetrics[0] : null;
  const lowestMetric = totalResponses > 0 ? sortedMetrics[sortedMetrics.length - 1] : null;

  // Render Charts — must be before any early return (Rules of Hooks)
  useEffect(() => {
    if (isFetching || totalResponses === 0) return;

    // Destroy existing charts
    if (radarChartInstance.current) radarChartInstance.current.destroy();
    if (barChartInstance.current) barChartInstance.current.destroy();

    const isDark = document.body.classList.contains('dark-mode');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#e2e8f0' : '#0f172a';

    // 1. Radar Chart Setup
    if (radarChartRef.current) {
      const ctx = radarChartRef.current.getContext('2d');
      if (ctx) {
        radarChartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['Kemudahan', 'Kemanfaatan', 'Kecepatan', 'Keakuratan', 'Rekomendasi'],
            datasets: [{
              label: 'Skor Kepuasan Rata-rata',
              data: [avgKemudahan, avgKegunaan, avgKecepatan, avgKeakuratan, avgRekomendasi],
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.12)',
              borderColor: '#6366f1',
              borderWidth: 2,
              pointBackgroundColor: '#6366f1',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#6366f1',
              pointRadius: 4,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              r: {
                angleLines: { color: gridColor },
                grid: { color: gridColor },
                pointLabels: { color: textColor, font: { family: 'DM Sans', weight: 'bold', size: 10 } },
                suggestedMin: 0,
                suggestedMax: 5,
                ticks: { stepSize: 1, color: isDark ? '#64748b' : '#94a3b8', backdropColor: 'transparent' }
              }
            }
          }
        });
      }
    }

    // 2. Bar Chart Setup
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        barChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Kemudahan', 'Kemanfaatan', 'Kecepatan', 'Keakuratan', 'Rekomendasi'],
            datasets: [{
              label: 'Skor Rata-rata',
              data: [avgKemudahan, avgKegunaan, avgKecepatan, avgKeakuratan, avgRekomendasi],
              backgroundColor: [
                'rgba(59, 130, 246, 0.75)',
                'rgba(16, 185, 129, 0.75)',
                'rgba(139, 92, 246, 0.75)',
                'rgba(245, 158, 11, 0.75)',
                'rgba(99, 102, 241, 0.75)'
              ],
              borderRadius: 6,
              borderWidth: 0,
              barThickness: 24,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: textColor, font: { family: 'DM Sans', size: 9, weight: 600 } }
              },
              y: {
                grid: { color: gridColor },
                suggestedMin: 0,
                suggestedMax: 5,
                ticks: { stepSize: 1, color: isDark ? '#64748b' : '#94a3b8' }
              }
            }
          }
        });
      }
    }

    return () => {
      if (radarChartInstance.current) radarChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [isFetching, totalResponses, avgKemudahan, avgKegunaan, avgKecepatan, avgKeakuratan, avgRekomendasi]);

  if (isFetching && totalResponses === 0) {
    return <SurveiSkeleton />;
  }

  const feedbackList = surveyList.filter(s => s.saran.trim() !== '');
  const totalFeedback = feedbackList.length;
  const totalPages = Math.max(1, Math.ceil(totalFeedback / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalFeedback);
  const currentFeedback = feedbackList.slice(startIndex, endIndex);

  // Helper to format ISO date to readable local date
  const formatTanggal = (isoStr: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      const pad = (n: number) => String(n).padStart(2, '0');
      const dd = pad(d.getDate());
      const mm = pad(d.getMonth() + 1);
      const yyyy = d.getFullYear();
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${dd}-${mm}-${yyyy} ${hh}:${min} WIB`;
    } catch {
      return isoStr;
    }
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const btns = [];
    const prevDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= totalPages;

    btns.push(
      <button
        key="prev"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-card text-[.66rem] font-bold text-muted transition-all duration-[130ms] [transition-timing-function:ease] hover:border-blue hover:bg-bluelo hover:text-blue disabled:pointer-events-none disabled:opacity-[.22]"
        disabled={prevDisabled}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4 inline-block align-middle" />
      </button>
    );

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let p = start; p <= end; p++) {
      btns.push(
        <button
          key={p}
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-card text-[.66rem] font-bold text-muted transition-all duration-[130ms] [transition-timing-function:ease] hover:border-blue hover:bg-bluelo hover:text-blue disabled:pointer-events-none disabled:opacity-[.22] ${p === currentPage ? 'border-blue bg-blue! text-white!' : ''}`}
          onClick={() => setCurrentPage(p)}
        >
          {p}
        </button>
      );
    }

    btns.push(
      <button
        key="next"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-card text-[.66rem] font-bold text-muted transition-all duration-[130ms] [transition-timing-function:ease] hover:border-blue hover:bg-bluelo hover:text-blue disabled:pointer-events-none disabled:opacity-[.22]"
        disabled={nextDisabled}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4 inline-block align-middle" />
      </button>
    );

    return btns;
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex flex-col gap-0">
        <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:ease] hover:shadow-[var(--shl)] min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-[var(--amber)] mb-4" />
          <h2>Firebase Belum Dikonfigurasi</h2>
          <p className="max-w-[480px] mx-auto mt-2 text-muted">
            Silakan lengkapi konfigurasi Firebase pada file <code>.env</code> Anda untuk melihat dashboard evaluasi kepuasan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Summary Metrics Cards */}
      <div className="mb-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Responden */}
        <div className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card p-3.5 px-4 shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-1 hover:shadow-[var(--shl)] portrait:max-md:flex-row portrait:max-md:items-center portrait:max-md:gap-0 portrait:max-md:rounded-[10px] portrait:max-md:py-[7px] portrait:max-md:px-2.5 portrait:max-md:hover:translate-y-0 portrait:max-md:hover:shadow-[var(--sh)]">
          <span className="absolute inset-y-0 left-0 w-1 rounded-l-2xl opacity-90 transition-[width] duration-200 [transition-timing-function:ease] group-hover:w-[5px] group-hover:opacity-100 bg-[linear-gradient(180deg,var(--blue),var(--blue2))]" />
          <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl text-[.95rem] shadow-[var(--sh-inner)] transition-all duration-[280ms] [transition-timing-function:ease] group-hover:scale-110 group-hover:-rotate-4 bg-bluelo text-blue portrait:max-md:mb-0 portrait:max-md:mr-2 portrait:max-md:h-8 portrait:max-md:w-8 portrait:max-md:rounded-lg portrait:max-md:shrink-0 portrait:max-md:text-[.78rem]"><Inbox className="w-5 h-5" /></div>
          <div className="flex flex-col gap-0.5 portrait:max-md:min-w-0 portrait:max-md:flex-1 portrait:max-md:gap-px portrait:max-md:overflow-hidden"><div className="mb-[3px] font-mono text-[1.85rem] font-black leading-[.85] tracking-[-.03em] portrait:max-md:text-[1.1rem] portrait:max-md:leading-[1.1] portrait:max-md:truncate">{totalResponses}</div><div className="mb-0.5 text-[.63rem] font-bold uppercase tracking-[.1em] text-muted portrait:max-md:text-[.54rem] portrait:max-md:truncate">Total Responden</div></div>
        </div>

        {/* Skor Rata-rata */}
        <div className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card p-3.5 px-4 shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-1 hover:shadow-[var(--shl)] portrait:max-md:flex-row portrait:max-md:items-center portrait:max-md:gap-0 portrait:max-md:rounded-[10px] portrait:max-md:py-[7px] portrait:max-md:px-2.5 portrait:max-md:hover:translate-y-0 portrait:max-md:hover:shadow-[var(--sh)]">
          <span className="absolute inset-y-0 left-0 w-1 rounded-l-2xl opacity-90 transition-[width] duration-200 [transition-timing-function:ease] group-hover:w-[5px] group-hover:opacity-100 bg-[linear-gradient(180deg,#5DADE2,#85c1e9)]" />
          <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl text-[.95rem] shadow-[var(--sh-inner)] transition-all duration-[280ms] [transition-timing-function:ease] group-hover:scale-110 group-hover:-rotate-4 bg-[rgba(93,173,226,.12)] text-[#5DADE2] portrait:max-md:mb-0 portrait:max-md:mr-2 portrait:max-md:h-8 portrait:max-md:w-8 portrait:max-md:rounded-lg portrait:max-md:shrink-0 portrait:max-md:text-[.78rem]"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /></div>
          <div className="flex flex-col gap-0.5 portrait:max-md:min-w-0 portrait:max-md:flex-1 portrait:max-md:gap-px portrait:max-md:overflow-hidden"><div className="mb-[3px] font-mono text-[1.85rem] font-black leading-[.85] tracking-[-.03em] portrait:max-md:text-[1.1rem] portrait:max-md:leading-[1.1] portrait:max-md:truncate">{totalResponses > 0 ? overallAverage : '0'}</div><div className="mb-0.5 text-[.63rem] font-bold uppercase tracking-[.1em] text-muted portrait:max-md:text-[.54rem] portrait:max-md:truncate">Indeks Kepuasan Rata-rata</div></div>
        </div>

        {/* Tertinggi */}
        <div className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card p-3.5 px-4 shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-1 hover:shadow-[var(--shl)] portrait:max-md:flex-row portrait:max-md:items-center portrait:max-md:gap-0 portrait:max-md:rounded-[10px] portrait:max-md:py-[7px] portrait:max-md:px-2.5 portrait:max-md:hover:translate-y-0 portrait:max-md:hover:shadow-[var(--sh)]">
          <span className="absolute inset-y-0 left-0 w-1 rounded-l-2xl opacity-90 transition-[width] duration-200 [transition-timing-function:ease] group-hover:w-[5px] group-hover:opacity-100 bg-[linear-gradient(180deg,#27AE60,#2ecc71)]" />
          <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl text-[.95rem] shadow-[var(--sh-inner)] transition-all duration-[280ms] [transition-timing-function:ease] group-hover:scale-110 group-hover:-rotate-4 bg-[rgba(39,174,96,.12)] text-[#27AE60] portrait:max-md:mb-0 portrait:max-md:mr-2 portrait:max-md:h-8 portrait:max-md:w-8 portrait:max-md:rounded-lg portrait:max-md:shrink-0 portrait:max-md:text-[.78rem]">
            <ThumbsUp className="w-4 h-4 inline-block align-middle" />
          </div>
          <div className="flex flex-col gap-0.5 portrait:max-md:min-w-0 portrait:max-md:flex-1 portrait:max-md:gap-px portrait:max-md:overflow-hidden">
            <div className="mb-[3px] font-mono text-[1rem]! font-black leading-[.85] tracking-[-.03em] portrait:max-md:text-[1.1rem] portrait:max-md:leading-[1.1] portrait:max-md:truncate">
              {highestMetric ? highestMetric.val : '—'}
            </div>
            <div className="mb-0.5 text-[.63rem] font-bold uppercase tracking-[.1em] text-muted portrait:max-md:text-[.54rem] portrait:max-md:truncate">Kinerja Tertinggi{highestMetric ? ` (${highestMetric.label.split(' ')[0]})` : ''}</div>
          </div>
        </div>

        {/* Terendah */}
        <div className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card p-3.5 px-4 shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-1 hover:shadow-[var(--shl)] portrait:max-md:flex-row portrait:max-md:items-center portrait:max-md:gap-0 portrait:max-md:rounded-[10px] portrait:max-md:py-[7px] portrait:max-md:px-2.5 portrait:max-md:hover:translate-y-0 portrait:max-md:hover:shadow-[var(--sh)]">
          <span className="absolute inset-y-0 left-0 w-1 rounded-l-2xl opacity-90 transition-[width] duration-200 [transition-timing-function:ease] group-hover:w-[5px] group-hover:opacity-100 bg-[linear-gradient(180deg,#EF6C4A,#FF8A6A)]" />
          <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl text-[.95rem] shadow-[var(--sh-inner)] transition-all duration-[280ms] [transition-timing-function:ease] group-hover:scale-110 group-hover:-rotate-4 bg-[rgba(239,108,74,.12)] text-[#EF6C4A] portrait:max-md:mb-0 portrait:max-md:mr-2 portrait:max-md:h-8 portrait:max-md:w-8 portrait:max-md:rounded-lg portrait:max-md:shrink-0 portrait:max-md:text-[.78rem]">
            <ThumbsDown className="w-4 h-4 inline-block align-middle" />
          </div>
          <div className="flex flex-col gap-0.5 portrait:max-md:min-w-0 portrait:max-md:flex-1 portrait:max-md:gap-px portrait:max-md:overflow-hidden">
            <div className="mb-[3px] font-mono text-[1rem]! font-black leading-[.85] tracking-[-.03em] portrait:max-md:text-[1.1rem] portrait:max-md:leading-[1.1] portrait:max-md:truncate">
              {lowestMetric ? lowestMetric.val : '—'}
            </div>
            <div className="mb-0.5 text-[.63rem] font-bold uppercase tracking-[.1em] text-muted portrait:max-md:text-[.54rem] portrait:max-md:truncate">Kinerja Terendah{lowestMetric ? ` (${lowestMetric.label.split(' ')[0]})` : ''}</div>
          </div>
        </div>
      </div>

      {totalResponses === 0 ? (
        <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:ease] hover:shadow-[var(--shl)] min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto p-10 text-center">
          <Inbox className="w-12 h-12 mx-auto text-slate-400 opacity-30 mb-4" />
          <h3 className="text-lg font-bold text-slate-200">Belum Ada Data Survei</h3>
          <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto">
            Hasil evaluasi dan survei kepuasan pelanggan Sapa Pedestrian akan muncul di sini setelah warga melakukan pengisian survei.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mb-3 lg:mb-6">
            
            {/* Radar Chart Panel */}
            <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:ease] hover:shadow-[var(--shl)] min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-[var(--border)] bg-gradient-to-br from-[rgba(27,59,111,.06)] to-transparent px-4 py-3">
                <span className="flex items-center gap-2 text-[.82rem] font-display font-extrabold tracking-[-.01em] text-text">
                  <BarChart3 className="w-4 h-4 inline-block align-middle" /> Analisis Spektrum Kepuasan
                </span>
                <span className="text-[.64rem] text-muted">
                  Perbandingan performa 7 aspek kuisioner (Skala 1-5)
                </span>
              </div>
              <div className="p-4 flex-1 min-h-[320px] relative flex items-center justify-center">
                <canvas ref={radarChartRef} className="w-full h-full" />
              </div>
            </div>

            {/* Bar Chart Panel */}
            <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:ease] hover:shadow-[var(--shl)] min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-[var(--border)] bg-gradient-to-br from-[rgba(27,59,111,.06)] to-transparent px-4 py-3">
                <span className="flex items-center gap-2 text-[.82rem] font-display font-extrabold tracking-[-.01em] text-text">
                  <BarChart3 className="w-4 h-4 inline-block align-middle" /> Distribusi Skor Kategori
                </span>
                <span className="text-[.64rem] text-muted">
                  Pencapaian skor rata-rata masing-masing indikator
                </span>
              </div>
              <div className="p-4 flex-1 min-h-[320px] relative flex items-center justify-center">
                <canvas ref={barChartRef} className="w-full h-full" />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
            {/* Detail Ratings Table */}
            <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:ease] hover:shadow-[var(--shl)] min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto lg:col-span-1 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-[var(--border)] bg-gradient-to-br from-[rgba(27,59,111,.06)] to-transparent px-4 py-3">
                <span className="flex items-center gap-2 text-[.82rem] font-display font-extrabold tracking-[-.01em] text-text">
                  <Award className="w-4 h-4 inline-block align-middle" /> Rincian Skor
                </span>
              </div>
              <div className="flex-1 px-4 py-[14px]">
                <div className="space-y-4">
                  {metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-800/40 last:border-none last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          {m.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">{m.label}</p>
                          <span className="text-[.62rem] text-muted">Skala 1-5</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-100">{m.val}</div>
                        <div className="mt-0.5 flex justify-end gap-[2px]">
                          {[1, 2, 3, 4, 5].map(starVal => (
                            <Star 
                              key={starVal} 
                              className={`w-2 h-2 ${
                                starVal <= Math.round(m.val) 
                                  ? 'text-amber-500 fill-amber-500' 
                                  : 'text-slate-700'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Citizens Feedback panel */}
            <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:ease] hover:shadow-[var(--shl)] min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto lg:col-span-2 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-[var(--border)] bg-gradient-to-br from-[rgba(27,59,111,.06)] to-transparent px-4 py-3">
                <span className="flex items-center gap-2 text-[.82rem] font-display font-extrabold tracking-[-.01em] text-text">
                  <MessageSquare className="w-4 h-4 inline-block align-middle" /> Saran &amp; Masukan Warga
                </span>
                <span className="text-[.64rem] text-muted">
                  Total masukan: {totalFeedback}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="divide-y divide-slate-800/50">
                  {feedbackList.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">

                      <MessageCircle className="w-6 h-6 mx-auto opacity-20 mb-2" />
                      Tidak ada saran teks yang tertulis.
                    </div>
                  ) : (
                    currentFeedback.map((fb, idx) => (
                      <div key={fb.id} className="flex flex-col gap-3 transition-colors border-b border-[var(--border)] px-[18px] py-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              {fb.nama || `Responden #${totalResponses - (startIndex + idx)}`}
                            </span>
                            {fb.pekerjaan && (
                              <span className="text-[10px] text-slate-400 font-medium bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                                {fb.pekerjaan}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {formatTanggal(fb.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(sv => {
                              const overallRowAvg = (fb.kemudahan + fb.kegunaan + fb.kecepatan + fb.keakuratan + fb.rekomendasi) / 5;
                              return (
                                <Star 
                                  key={sv} 
                                  className={`w-2.5 h-2.5 ${
                                    sv <= Math.round(overallRowAvg) 
                                      ? 'text-amber-500 fill-amber-500' 
                                      : 'text-slate-700'
                                  }`} 
                                />
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-[12px] text-slate-300 italic leading-relaxed pl-2 border-l-2 border-slate-700/60 mt-0.5">
                          "{esc(fb.saran)}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-[7px] border-t border-[var(--border)] px-3.5 py-3 text-[.67rem] text-muted">
                  <span>
                    {totalFeedback === 0
                      ? 'Tidak ada masukan tertulis'
                      : `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalFeedback} masukan`}
                  </span>
                  <div className="flex gap-[3px]">{renderPaginationButtons()}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Respondents Table */}
          <div className="mb-3 max-w-full overflow-hidden rounded-2xl border-[1.5px] border-[var(--border)] bg-card shadow-[var(--sh)] transition-all duration-[220ms] [transition-timing-function:ease] hover:shadow-[var(--shl)] min-[769px]:overflow-x-auto max-md:landscape:overflow-x-auto mt-3 lg:mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-[var(--border)] bg-gradient-to-br from-[rgba(27,59,111,.06)] to-transparent px-4 py-3">
              <span className="flex items-center gap-2 text-[.82rem] font-display font-extrabold tracking-[-.01em] text-text">
                <Inbox className="w-4 h-4 inline-block align-middle" /> Data Responden
              </span>
              <span className="text-[.64rem] text-muted">
                {totalResponses} responden
              </span>
            </div>
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] portrait:max-md:hidden">
              <table className="w-full border-separate border-spacing-0 text-[.73rem] min-w-[780px]">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-center text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid w-9">#</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-left text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid min-w-[130px]">Nama</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-left text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid min-w-[120px]">Pekerjaan</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-center text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid w-[52px]">Mud.</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-center text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid w-[52px]">Guna</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-center text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid w-[52px]">Cepat</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-center text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid w-[60px]">Akurat</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-center text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid w-[52px]">Rekm.</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-left text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid min-w-[150px]">Tanggal</th>
                    <th className="sticky top-0 z-[1] whitespace-nowrap border-b-2 border-[var(--border)] bg-bg px-3 py-2.5 text-left text-[.62rem] font-extrabold uppercase tracking-[.1em] text-mid min-w-[180px]">Saran</th>
                  </tr>
                </thead>
                <tbody>
                  {surveyList.map((s, i) => (
                    <tr key={s.id} className="hover:[&>td]:bg-[rgba(30,111,217,.035)]">
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 text-center text-muted">{totalResponses - i}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 font-semibold whitespace-nowrap">{s.nama || '—'}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 text-mid whitespace-nowrap">{s.pekerjaan || '—'}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 text-center font-bold text-[#f59e0b]">{s.kemudahan}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 text-center font-bold text-[#f59e0b]">{s.kegunaan}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 text-center font-bold text-[#f59e0b]">{s.kecepatan}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 text-center font-bold text-[#f59e0b]">{s.keakuratan}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 text-center font-bold text-[#f59e0b]">{s.rekomendasi}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 whitespace-nowrap text-[.7rem] text-muted">{formatTanggal(s.createdAt)}</td>
                      <td className="border-b border-[var(--border)] px-3 py-[11px] align-middle transition-colors duration-100 max-w-[220px] truncate text-mid">{s.saran || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="hidden w-full min-w-0 overflow-x-hidden px-3 portrait:max-md:block">
              {surveyList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <Inbox className="w-8 h-8 opacity-[0.14] mx-auto mb-2 block" />
                  <p>Tidak ada data responden.</p>
                </div>
              ) : (
                surveyList.map((s, i) => {
                  const isExpanded = !!expandedCards[s.id];
                  return (
                    <div
                      key={s.id}
                      className="relative mb-3 w-full cursor-pointer rounded-[var(--r)] border border-[var(--border)] bg-card p-[14px] shadow-[var(--sh)] transition-all duration-200 [transition-timing-function:ease] hover:-translate-y-0.5 hover:shadow-[var(--shl)]"
                      onClick={() => toggleCard(s.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-[750] text-[.8rem] text-text">
                          {s.nama || '—'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[.68rem] text-muted">
                            #{totalResponses - i}
                          </span>
                          <ChevronRight
                            className="w-4 h-4 shrink-0 text-[var(--muted)] [transition:transform_0.2s_ease]"
                            style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'none',
                            }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2.5 flex flex-col gap-2 border-t border-[var(--border)] pt-2.5">
                          {s.pekerjaan && (
                            <div className="text-[.72rem] text-mid">
                              <strong>Pekerjaan:</strong> {s.pekerjaan}
                            </div>
                          )}

                          {/* Ratings grid */}
                          <div className="grid grid-cols-5 gap-1 rounded-md bg-bg px-2 py-1.5 text-center">
                            <div>
                              <div className="text-[.58rem] font-bold text-muted">MUD</div>
                              <div className="mt-0.5 text-[.76rem] font-[850] text-[#f59e0b]">{s.kemudahan}</div>
                            </div>
                            <div>
                              <div className="text-[.58rem] font-bold text-muted">GUNA</div>
                              <div className="mt-0.5 text-[.76rem] font-[850] text-[#f59e0b]">{s.kegunaan}</div>
                            </div>
                            <div>
                              <div className="text-[.58rem] font-bold text-muted">CPT</div>
                              <div className="mt-0.5 text-[.76rem] font-[850] text-[#f59e0b]">{s.kecepatan}</div>
                            </div>
                            <div>
                              <div className="text-[.58rem] font-bold text-muted">AKR</div>
                              <div className="mt-0.5 text-[.76rem] font-[850] text-[#f59e0b]">{s.keakuratan}</div>
                            </div>
                            <div>
                              <div className="text-[.58rem] font-bold text-muted">RKM</div>
                              <div className="mt-0.5 text-[.76rem] font-[850] text-[#f59e0b]">{s.rekomendasi}</div>
                            </div>
                          </div>

                          {s.saran && (
                            <p className="m-0 rounded-md border-l-2 border-[var(--blue)] bg-[rgba(30,111,217,0.05)] px-2.5 py-2 text-[.72rem] italic text-text">
                              "{s.saran}"
                            </p>
                          )}

                          <div className="text-right text-[.64rem] text-muted">
                            {formatTanggal(s.createdAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Survei;
