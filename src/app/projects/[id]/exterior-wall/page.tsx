'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Ruler, Table2, Building, Layers,
  Calculator, CheckCircle, Pencil, Trash2, Plus, Save,
  Loader2,
} from 'lucide-react';
import { Project, ExteriorWallData } from '@/lib/types';
import { getProject, getExteriorWallData, saveExteriorWallData } from '@/lib/storage';

/* ============================
   型定義
   ============================ */
interface WindowItem {
  id: string;
  room: string;
  type: string;
  widthMm: number;
  heightMm: number;
  areaSqm: number;
}

interface FaceWindows {
  face: string;
  windows: WindowItem[];
  totalArea: number;
}

interface FaceWidth {
  face: string;
  widthMm: number;
}

interface HeightData {
  maxHeight: number;    // 最高高さ−土台
  eaveHeight: number;   // 軒高さ−土台
  flToEave: number;     // 1FL−軒高さ
}

interface FaceResult {
  face: string;
  widthM: number;
  heightM: number;
  grossArea: number;
  windowArea: number;
  netArea: number;
}

/* ============================
   ステップ定義
   ============================ */
const STEPS = [
  { id: 1, label: '①平面図から横幅取得', icon: Ruler },
  { id: 2, label: '②窓情報の取得', icon: Table2 },
  { id: 3, label: '③立面図から寸法取得', icon: Building },
  { id: 4, label: '④立面図セグメンテーション', icon: Layers },
  { id: 5, label: '⑤面積の算出', icon: Calculator },
] as const;

const uid = () => Math.random().toString(36).substring(2, 10);

/* ============================
   デモデータ（喜田産業サンプル）
   ============================ */
const DEMO_WIDTHS: FaceWidth[] = [
  { face: '北', widthMm: 12740 },
  { face: '南', widthMm: 12740 },
  { face: '東', widthMm: 11375 },
  { face: '西', widthMm: 11375 },
];

const DEMO_WINDOWS: FaceWindows[] = [
  {
    face: '北',
    windows: [
      { id: uid(), room: 'トイレ北側', type: '縦スベリ出し窓', widthMm: 260, heightMm: 700, areaSqm: 0.182 },
      { id: uid(), room: '子ども室', type: '引違い窓', widthMm: 1600, heightMm: 900, areaSqm: 1.44 },
    ],
    totalArea: 1.622,
  },
  {
    face: '南',
    windows: [
      { id: uid(), room: '寝室', type: '引違い窓', widthMm: 1600, heightMm: 900, areaSqm: 1.44 },
      { id: uid(), room: 'クローゼット南側', type: '縦スベリ出し窓', widthMm: 260, heightMm: 700, areaSqm: 0.182 },
      { id: uid(), room: 'LDK中央', type: '引違い窓', widthMm: 2560, heightMm: 2000, areaSqm: 5.12 },
      { id: uid(), room: 'LDK東側', type: '引違い窓', widthMm: 2560, heightMm: 2000, areaSqm: 5.12 },
    ],
    totalArea: 11.862,
  },
  {
    face: '東',
    windows: [
      { id: uid(), room: 'タタミコーナー', type: '引違い窓', widthMm: 1600, heightMm: 900, areaSqm: 1.44 },
      { id: uid(), room: 'ポーチ横', type: '縦スベリ出し窓', widthMm: 260, heightMm: 700, areaSqm: 0.182 },
    ],
    totalArea: 1.622,
  },
  {
    face: '西',
    windows: [
      { id: uid(), room: 'ランドリー', type: 'FIX窓', widthMm: 1195, heightMm: 300, areaSqm: 0.3585 },
    ],
    totalArea: 0.3585,
  },
];

const DEMO_HEIGHTS: HeightData = {
  maxHeight: 4200,
  eaveHeight: 2850,
  flToEave: 2810,
};

/* ============================
   メインコンポーネント
   ============================ */
export default function ExteriorWallPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step1: 横幅
  const [widths, setWidths] = useState<FaceWidth[]>([]);
  const [widthsLoading, setWidthsLoading] = useState(false);
  const [widthsDetected, setWidthsDetected] = useState(false);
  const [widthsConfirmed, setWidthsConfirmed] = useState(false);

  // Step2: 窓情報
  const [faceWindows, setFaceWindows] = useState<FaceWindows[]>([]);
  const [windowsLoading, setWindowsLoading] = useState(false);
  const [windowsDetected, setWindowsDetected] = useState(false);
  const [windowsConfirmed, setWindowsConfirmed] = useState(false);

  // Step3: 立面図寸法
  const [heights, setHeights] = useState<HeightData>({ maxHeight: 0, eaveHeight: 0, flToEave: 0 });
  const [heightsLoading, setHeightsLoading] = useState(false);
  const [heightsDetected, setHeightsDetected] = useState(false);
  const [heightsConfirmed, setHeightsConfirmed] = useState(false);

  // Step4: セグメンテーション
  const [segLoading, setSegLoading] = useState(false);
  const [segDone, setSegDone] = useState(false);
  const [segConfirmed, setSegConfirmed] = useState(false);

  // Step5: 面積
  const [results, setResults] = useState<FaceResult[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) { router.push('/'); return; }
    setProject(p);
  }, [projectId, router]);

  // AI解析シミュレーション
  const simulateAI = (setLoading: (v: boolean) => void, onDone: () => void, ms = 1500) => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onDone(); }, ms);
  };

  // Step1: AI横幅取得
  const runWidthDetection = () => {
    simulateAI(setWidthsLoading, () => {
      setWidths(DEMO_WIDTHS.map(w => ({ ...w })));
      setWidthsDetected(true);
    });
  };

  // Step2: AI窓情報取得
  const runWindowDetection = () => {
    simulateAI(setWindowsLoading, () => {
      setFaceWindows(DEMO_WINDOWS.map(fw => ({
        ...fw,
        windows: fw.windows.map(w => ({ ...w, id: uid() })),
      })));
      setWindowsDetected(true);
    });
  };

  // Step3: AI立面図寸法取得
  const runHeightDetection = () => {
    simulateAI(setHeightsLoading, () => {
      setHeights({ ...DEMO_HEIGHTS });
      setHeightsDetected(true);
    });
  };

  // Step4: セグメンテーション
  const runSegmentation = () => {
    simulateAI(setSegLoading, () => {
      setSegDone(true);
    }, 2000);
  };

  // 窓の面積を再計算
  const recalcWindowArea = (w: WindowItem): number => {
    return Math.round((w.widthMm * w.heightMm) / 1_000_000 * 10000) / 10000;
  };

  // 窓を更新
  const updateWindow = (faceIdx: number, windowId: string, field: keyof WindowItem, value: string | number) => {
    setFaceWindows(prev => prev.map((fw, fi) => {
      if (fi !== faceIdx) return fw;
      const newWindows = fw.windows.map(w => {
        if (w.id !== windowId) return w;
        const updated = { ...w, [field]: value };
        if (field === 'widthMm' || field === 'heightMm') {
          updated.areaSqm = recalcWindowArea(updated);
        }
        return updated;
      });
      return { ...fw, windows: newWindows, totalArea: Math.round(newWindows.reduce((s, w) => s + w.areaSqm, 0) * 10000) / 10000 };
    }));
  };

  // 窓を追加
  const addWindow = (faceIdx: number) => {
    setFaceWindows(prev => prev.map((fw, fi) => {
      if (fi !== faceIdx) return fw;
      const newW: WindowItem = { id: uid(), room: '', type: '引違い窓', widthMm: 0, heightMm: 0, areaSqm: 0 };
      return { ...fw, windows: [...fw.windows, newW] };
    }));
  };

  // 窓を削除
  const deleteWindow = (faceIdx: number, windowId: string) => {
    setFaceWindows(prev => prev.map((fw, fi) => {
      if (fi !== faceIdx) return fw;
      const newWindows = fw.windows.filter(w => w.id !== windowId);
      return { ...fw, windows: newWindows, totalArea: Math.round(newWindows.reduce((s, w) => s + w.areaSqm, 0) * 10000) / 10000 };
    }));
  };

  // Step5: 面積算出
  const runCalculation = () => {
    const eaveM = heights.eaveHeight / 1000;
    const newResults = widths.map(w => {
      const wM = w.widthMm / 1000;
      const gross = Math.round(wM * eaveM * 1000) / 1000;
      const fw = faceWindows.find(f => f.face === w.face);
      const winA = fw ? fw.totalArea : 0;
      const net = Math.round((gross - winA) * 1000) / 1000;
      return {
        face: w.face,
        widthM: wM,
        heightM: eaveM,
        grossArea: gross,
        windowArea: winA,
        netArea: net,
      };
    });
    setResults(newResults);
  };

  // 保存
  const handleSave = () => {
    const faces = results.map(r => ({
      id: uid(),
      name: `${r.face}側`,
      scale: 0.1,
      wallRects: [],
      openingRects: [],
      wallAreaM2: r.grossArea,
      openingAreaM2: r.windowArea,
      netAreaM2: r.netArea,
      confirmed: true,
    }));
    const data: ExteriorWallData = {
      projectId,
      faces,
      totalWallArea: results.reduce((s, r) => s + r.grossArea, 0),
      totalOpeningArea: results.reduce((s, r) => s + r.windowArea, 0),
      totalNetArea: results.reduce((s, r) => s + r.netArea, 0),
      confirmedAt: new Date().toISOString(),
    };
    saveExteriorWallData(data);
    setSaved(true);
  };

  const totalNet = useMemo(() => results.reduce((s, r) => s + r.netArea, 0), [results]);

  if (!project) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.push(`/projects/${projectId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> プロジェクトに戻る
        </button>
        <h1 className="text-lg font-bold text-gray-900">外壁面積算出（立面図）</h1>
        <div className="text-sm text-gray-500">{project.name}</div>
      </div>

      {/* ステップバー */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-5">
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isDone = (step.id === 1 && widthsConfirmed) ||
                           (step.id === 2 && windowsConfirmed) ||
                           (step.id === 3 && heightsConfirmed) ||
                           (step.id === 4 && segConfirmed) ||
                           (step.id === 5 && saved);
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all w-full ${
                    isActive ? 'bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-200' :
                    isDone ? 'text-green-700 bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' :
                    isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden xl:inline truncate">{step.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`h-0.5 w-3 mx-0.5 flex-shrink-0 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ======== Step 1: 平面図から横幅取得 ======== */}
      {currentStep === 1 && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {widthsDetected ? '出力画像：寸法検出結果' : '入力画像：平面図'}
                </span>
                <span className="text-xs text-gray-400">平面図＿20251120.pdf</span>
              </div>
              <div className="p-2 bg-slate-50 overflow-auto" style={{ maxHeight: 520 }}>
                <img
                  src={widthsDetected ? '/demo/floor-plan.png' : '/demo/floor-plan-plain.png'}
                  alt="平面図"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm mb-3">① 平面図から各方角の横幅を取る</h3>
              <p className="text-xs text-gray-500 mb-4">平面図をAI解析し、建物の各方角の横幅（mm）を抽出します。</p>
              <button
                onClick={runWidthDetection}
                disabled={widthsLoading || widthsDetected}
                className="w-full px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
              >
                {widthsLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI解析中...</> :
                 widthsDetected ? <><CheckCircle className="w-4 h-4" /> 解析完了</> :
                 'AI解析を実行'}
              </button>
            </div>

            {widthsDetected && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">出力結果</h3>
              <div className="space-y-2">
                {widths.map((w, i) => (
                  <div key={w.face} className="flex items-center gap-2">
                    <span className="w-8 text-sm font-bold text-gray-700">{w.face}</span>
                    <input
                      type="number"
                      value={w.widthMm}
                      onChange={e => setWidths(prev => prev.map((pw, pi) => pi === i ? { ...pw, widthMm: Number(e.target.value) } : pw))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right font-mono focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    />
                    <span className="text-xs text-gray-400 w-8">mm</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                北：{widths[0].widthMm}　東：{widths[2].widthMm}　西：{widths[3].widthMm}　南：{widths[1].widthMm}
              </div>
              <button
                onClick={() => { setWidthsConfirmed(true); setCurrentStep(2); }}
                className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> 確定して次へ
              </button>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ======== Step 2: 窓情報取得 ======== */}
      {currentStep === 2 && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-5">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <span className="text-sm font-semibold text-gray-700">
                  {windowsDetected ? '出力画像：窓検出結果' : '入力画像：平面図'}
                </span>
              </div>
              <div className="p-2 bg-slate-50 overflow-auto" style={{ maxHeight: 600 }}>
                <img
                  src={windowsDetected ? '/demo/floor-plan.png' : '/demo/floor-plan-plain.png'}
                  alt="平面図"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <button
              onClick={runWindowDetection}
              disabled={windowsLoading || windowsDetected}
              className="w-full mt-3 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
            >
              {windowsLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI解析中...</> :
               windowsDetected ? <><CheckCircle className="w-4 h-4" /> 解析完了</> :
               'AI解析を実行'}
            </button>
          </div>
          <div className="col-span-7 space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm mb-1">② 平面図から窓情報の取得</h3>
              <p className="text-xs text-gray-500 mb-3">{windowsDetected ? '以下の内容を表で出力し、手動で編集可能' : 'AI解析を実行してください'}</p>
            </div>

            {windowsDetected && faceWindows.map((fw, fIdx) => (
              <div key={fw.face} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{fw.face}面の窓</span>
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">合計: {fw.totalArea} ㎡</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="px-3 py-2 text-left font-medium">部屋名</th>
                        <th className="px-3 py-2 text-left font-medium">窓種別</th>
                        <th className="px-3 py-2 text-right font-medium">幅(mm)</th>
                        <th className="px-3 py-2 text-right font-medium">高さ(mm)</th>
                        <th className="px-3 py-2 text-right font-medium">面積(㎡)</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fw.windows.map(w => (
                        <tr key={w.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-2 py-1.5">
                            <input value={w.room} onChange={e => updateWindow(fIdx, w.id, 'room', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
                          </td>
                          <td className="px-2 py-1.5">
                            <select value={w.type} onChange={e => updateWindow(fIdx, w.id, 'type', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white">
                              <option>引違い窓</option>
                              <option>縦スベリ出し窓</option>
                              <option>FIX窓</option>
                              <option>上げ下げ窓</option>
                              <option>ルーバー窓</option>
                            </select>
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" value={w.widthMm} onChange={e => updateWindow(fIdx, w.id, 'widthMm', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-right font-mono" />
                          </td>
                          <td className="px-2 py-1.5">
                            <input type="number" value={w.heightMm} onChange={e => updateWindow(fIdx, w.id, 'heightMm', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-right font-mono" />
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-gray-700">{w.areaSqm}</td>
                          <td className="px-2 py-1.5">
                            <button onClick={() => deleteWindow(fIdx, w.id)} className="p-1 text-red-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button onClick={() => addWindow(fIdx)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                    <Plus className="w-3.5 h-3.5" /> 窓を追加
                  </button>
                </div>
              </div>
            ))}

            {windowsDetected && (
            <button
              onClick={() => { setWindowsConfirmed(true); setCurrentStep(3); }}
              className="w-full px-3 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> 確定して次へ
            </button>
            )}
          </div>
        </div>
      )}

      {/* ======== Step 3: 立面図から寸法取得 ======== */}
      {currentStep === 3 && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">入力画像：立面図</span>
                <span className="text-xs text-gray-400">立面図＿20251120.pdf</span>
              </div>
              <div className="p-2 bg-slate-50 overflow-auto" style={{ maxHeight: 520 }}>
                <img src="/demo/elevation.png" alt="立面図" className="w-full h-auto" />
              </div>
            </div>
          </div>
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm mb-3">③ 立面図からの寸法取得</h3>
              <p className="text-xs text-gray-500 mb-4">立面図をAI解析し、高さ方向の寸法を抽出します。</p>
              <button
                onClick={runHeightDetection}
                disabled={heightsLoading || heightsDetected}
                className="w-full px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
              >
                {heightsLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI解析中...</> :
                 heightsDetected ? <><CheckCircle className="w-4 h-4" /> 解析完了</> :
                 'AI解析を実行'}
              </button>
            </div>

            {heightsDetected && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">出力結果</h3>
              <div className="p-3 bg-slate-50 rounded-lg mb-3">
                <img src="/demo/elevation.png" alt="立面図寸法" className="w-full h-auto opacity-80" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">最高高さ − 土台 (mm)</label>
                  <input type="number" value={heights.maxHeight}
                    onChange={e => setHeights(prev => ({ ...prev, maxHeight: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono text-right focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">軒高さ − 土台 (mm)</label>
                  <input type="number" value={heights.eaveHeight}
                    onChange={e => setHeights(prev => ({ ...prev, eaveHeight: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono text-right focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">1FL − 軒高さ (mm)</label>
                  <input type="number" value={heights.flToEave}
                    onChange={e => setHeights(prev => ({ ...prev, flToEave: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono text-right focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-1">
                <div>最高高さ−土台：<span className="font-bold">{heights.maxHeight}</span></div>
                <div>軒高さ−土台：<span className="font-bold">{heights.eaveHeight}</span></div>
                <div>1FL−軒高さ：<span className="font-bold">{heights.flToEave}</span></div>
              </div>
              <button
                onClick={() => { setHeightsConfirmed(true); setCurrentStep(4); }}
                className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> 確定して次へ
              </button>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ======== Step 4: 立面図セグメンテーション ======== */}
      {currentStep === 4 && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {segDone ? '出力画像：セグメンテーション結果' : '入力画像：立面図'}
                </span>
              </div>
              <div className="p-2 bg-slate-50 overflow-auto" style={{ maxHeight: 520 }}>
                <img
                  src={segDone ? '/demo/elevation-segmented.png' : '/demo/elevation.png'}
                  alt="立面図"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm mb-3">④ 立面図セグメンテーション</h3>
              <p className="text-xs text-gray-500 mb-4">
                立面図の壁面・屋根・基礎・開口部をAIで自動認識し、色分け表示します。
              </p>
              <button
                onClick={runSegmentation}
                disabled={segLoading || segDone}
                className="w-full px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
              >
                {segLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI解析中...</> :
                 segDone ? <><CheckCircle className="w-4 h-4" /> 解析完了</> :
                 'AI解析を実行'}
              </button>
            </div>

            {segDone && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">検出結果</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef3c7' }}></div>
                    <span className="text-xs text-gray-700">外壁面（4面）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626', opacity: 0.5 }}></div>
                    <span className="text-xs text-gray-700">屋根部分</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7c3aed', opacity: 0.5 }}></div>
                    <span className="text-xs text-gray-700">基礎部分</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#bfdbfe' }}></div>
                    <span className="text-xs text-gray-700">開口部（窓・ドア）</span>
                  </div>
                </div>
                <button
                  onClick={() => { setSegConfirmed(true); setCurrentStep(5); }}
                  className="w-full mt-4 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> 確認して次へ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======== Step 5: 面積の算出 ======== */}
      {currentStep === 5 && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">⑤ 面積の算出</h3>
              <p className="text-xs text-gray-500">以下の内容を表で出力し、手動で編集可能</p>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">各ステップのデータを使って外壁面積を算出します。</p>
                <button
                  onClick={runCalculation}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> 面積を算出する
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-gray-600">
                        <th className="px-4 py-3 text-left font-semibold">方角</th>
                        <th className="px-4 py-3 text-left font-semibold">計算式</th>
                        <th className="px-4 py-3 text-right font-semibold">外壁面積 (㎡)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.face} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-800">{r.face}側</td>
                          <td className="px-4 py-3 font-mono text-gray-600 text-xs">
                            {r.widthM.toFixed(3)} × {r.heightM.toFixed(3)} − {r.windowArea}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              step="0.001"
                              value={r.netArea}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setResults(prev => prev.map(pr => pr.face === r.face ? { ...pr, netArea: val } : pr));
                              }}
                              className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono text-right font-bold focus:ring-2 focus:ring-blue-300"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 bg-amber-50">
                        <td className="px-4 py-3 font-bold text-gray-900" colSpan={2}>合計外壁面積</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-lg text-blue-800">
                          {results.reduce((s, r) => s + r.netArea, 0).toFixed(3)} ㎡
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* 詳細表示 */}
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {results.map(r => (
                    <div key={r.face} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{r.face}側</div>
                      <div className="text-xs space-y-0.5">
                        <div className="flex justify-between"><span className="text-gray-500">横幅</span><span className="font-mono">{r.widthM.toFixed(3)} m</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">軒高さ</span><span className="font-mono">{r.heightM.toFixed(3)} m</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">壁全体</span><span className="font-mono">{r.grossArea.toFixed(3)} ㎡</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">窓面積</span><span className="font-mono text-red-600">−{r.windowArea} ㎡</span></div>
                        <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                          <span className="text-gray-700 font-semibold">面積</span>
                          <span className="font-mono font-bold text-blue-700">{r.netArea.toFixed(3)} ㎡</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 保存ボタン */}
                <div className="mt-5 flex items-center justify-end gap-3">
                  <button onClick={runCalculation}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2">
                    <Pencil className="w-4 h-4" /> 再計算
                  </button>
                  <button onClick={handleSave}
                    disabled={saved}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:bg-green-300 flex items-center gap-2">
                    {saved ? <><CheckCircle className="w-4 h-4" /> 保存済み</> : <><Save className="w-4 h-4" /> 確定して保存</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1 as 1|2|3|4|5)}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> 前のステップ
        </button>
        <span className="text-xs text-gray-400">Step {currentStep} / 5</span>
        <button
          onClick={() => currentStep < 5 && setCurrentStep(currentStep + 1 as 1|2|3|4|5)}
          disabled={currentStep === 5}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          次のステップ <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
