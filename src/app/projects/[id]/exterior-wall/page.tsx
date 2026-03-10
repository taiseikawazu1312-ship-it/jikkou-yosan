'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Upload, Ruler, Square, DoorOpen,
  Calculator, CheckCircle, Circle, ZoomIn, ZoomOut, Maximize,
  Trash2, MousePointer, PlusSquare, RotateCcw, Eye,
} from 'lucide-react';
import { Project, ElevationFace, WallRect, ExteriorWallData } from '@/lib/types';
import { getProject, getExteriorWallData, saveExteriorWallData } from '@/lib/storage';

// ステップ定義
const STEPS = [
  { id: 'upload', label: '立面図アップロード', icon: Upload },
  { id: 'scale', label: 'スケール設定', icon: Ruler },
  { id: 'wall', label: '壁面領域設定', icon: Square },
  { id: 'opening', label: '開口部設定', icon: DoorOpen },
  { id: 'calc', label: '面積算出', icon: Calculator },
  { id: 'confirm', label: '確定', icon: CheckCircle },
] as const;

type StepId = typeof STEPS[number]['id'];

// デモ用の立面図描画
function drawDemoElevation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  faceName: string,
) {
  ctx.clearRect(0, 0, w, h);
  // 背景
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h);

  // 地面
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, h - 60, w, 60);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h - 60);
  ctx.lineTo(w, h - 60);
  ctx.stroke();

  const bx = 100, by = 80;
  const bw = w - 200, bh = h - 180;

  // 基礎
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(bx - 10, by + bh, bw + 20, 40);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx - 10, by + bh, bw + 20, 40);

  // 壁面
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(bx, by + 60, bw, bh - 60);
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by + 60, bw, bh - 60);

  // 屋根
  ctx.fillStyle = '#dc2626';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(bx - 30, by + 60);
  ctx.lineTo(bx + bw / 2, by);
  ctx.lineTo(bx + bw + 30, by + 60);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx - 30, by + 60);
  ctx.lineTo(bx + bw / 2, by);
  ctx.lineTo(bx + bw + 30, by + 60);
  ctx.closePath();
  ctx.stroke();

  // 窓（面による配置変更）
  const isFront = faceName === '正面' || faceName === '背面';
  if (isFront) {
    // 大窓 x2
    drawWindow(ctx, bx + 60, by + 100, 120, 100);
    drawWindow(ctx, bx + bw - 180, by + 100, 120, 100);
    // 小窓 x2 (2F)
    drawWindow(ctx, bx + 60, by + 240, 80, 70);
    drawWindow(ctx, bx + bw - 140, by + 240, 80, 70);
    // ドア
    if (faceName === '正面') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bx + bw / 2 - 35, by + bh - 130, 70, 130);
      ctx.strokeStyle = '#451a03';
      ctx.strokeRect(bx + bw / 2 - 35, by + bh - 130, 70, 130);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bx + bw / 2 + 20, by + bh - 65, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // 側面
    drawWindow(ctx, bx + bw / 2 - 50, by + 110, 100, 90);
    drawWindow(ctx, bx + bw / 2 - 40, by + 250, 60, 50);
  }

  // 寸法線
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  // 横幅
  ctx.beginPath();
  ctx.moveTo(bx, h - 35);
  ctx.lineTo(bx + bw, h - 35);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1e40af';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${isFront ? '9,100' : '6,370'} mm`, bx + bw / 2, h - 20);
  // 高さ
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(w - 50, by + 60);
  ctx.lineTo(w - 50, by + bh);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.save();
  ctx.translate(w - 30, by + 60 + (bh - 60) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('5,600 mm', 0, 0);
  ctx.restore();

  // 面名ラベル
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`立面図 - ${faceName}`, 20, 30);
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#bfdbfe';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ID生成
const uid = () => Math.random().toString(36).substring(2, 10);

// デフォルト面データ
function createDefaultFaces(): ElevationFace[] {
  return ['正面', '背面', '左側面', '右側面'].map(name => ({
    id: uid(),
    name,
    scale: 0.1, // 0.1 px/mm = 10mm per pixel
    wallRects: [],
    openingRects: [],
    wallAreaM2: 0,
    openingAreaM2: 0,
    netAreaM2: 0,
    confirmed: false,
  }));
}

export default function ExteriorWallPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [currentStep, setCurrentStep] = useState<StepId>('upload');
  const [activeFaceIdx, setActiveFaceIdx] = useState(0);
  const [faces, setFaces] = useState<ElevationFace[]>(createDefaultFaces);
  const [zoom, setZoom] = useState(1);
  const [drawMode, setDrawMode] = useState<'select' | 'wall' | 'opening'>('select');
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [selectedRect, setSelectedRect] = useState<string | null>(null);
  const [scaleInput, setScaleInput] = useState('9100');
  const [scalePixels, setScalePixels] = useState('');
  const [demoLoaded, setDemoLoaded] = useState<boolean[]>([false, false, false, false]);
  const [stepConfirmed, setStepConfirmed] = useState<Record<StepId, boolean>>({
    upload: false, scale: false, wall: false, opening: false, calc: false, confirm: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const CANVAS_W = 800;
  const CANVAS_H = 500;

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) { router.push('/'); return; }
    setProject(p);
    const saved = getExteriorWallData(projectId);
    if (saved) {
      setFaces(saved.faces);
      if (saved.confirmedAt) {
        setStepConfirmed(prev => ({ ...prev, upload: true, scale: true, wall: true, opening: true, calc: true, confirm: true }));
      }
    }
  }, [projectId, router]);

  const activeFace = faces[activeFaceIdx];

  // Canvas描画
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(zoom, zoom);

    // デモ立面図描画
    drawDemoElevation(ctx, CANVAS_W, CANVAS_H, activeFace.name);

    // 壁面矩形(緑)
    activeFace.wallRects.forEach(r => {
      ctx.fillStyle = selectedRect === r.id ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.2)';
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.strokeStyle = selectedRect === r.id ? '#15803d' : '#22c55e';
      ctx.lineWidth = selectedRect === r.id ? 3 : 2;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.fillStyle = '#15803d';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, r.x + 4, r.y + 14);
    });

    // 開口部矩形(赤)
    activeFace.openingRects.forEach(r => {
      ctx.fillStyle = selectedRect === r.id ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)';
      ctx.fillRect(r.x, r.y, r.width, r.height);
      ctx.strokeStyle = selectedRect === r.id ? '#b91c1c' : '#ef4444';
      ctx.lineWidth = selectedRect === r.id ? 3 : 2;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.fillStyle = '#b91c1c';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, r.x + 4, r.y + 14);
    });

    // 描画中の矩形
    if (drawing && drawStart && drawCurrent) {
      const rx = Math.min(drawStart.x, drawCurrent.x);
      const ry = Math.min(drawStart.y, drawCurrent.y);
      const rw = Math.abs(drawCurrent.x - drawStart.x);
      const rh = Math.abs(drawCurrent.y - drawStart.y);
      ctx.fillStyle = drawMode === 'wall' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = drawMode === 'wall' ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [zoom, activeFace, selectedRect, drawing, drawStart, drawCurrent, drawMode]);

  useEffect(() => { redraw(); }, [redraw]);

  // マウスイベント
  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (drawMode === 'select') {
      const pos = getCanvasPos(e);
      const allRects = [...activeFace.wallRects, ...activeFace.openingRects];
      const hit = allRects.find(r =>
        pos.x >= r.x && pos.x <= r.x + r.width &&
        pos.y >= r.y && pos.y <= r.y + r.height
      );
      setSelectedRect(hit?.id ?? null);
      return;
    }
    if (drawMode === 'wall' || drawMode === 'opening') {
      const pos = getCanvasPos(e);
      setDrawing(true);
      setDrawStart(pos);
      setDrawCurrent(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    setDrawCurrent(getCanvasPos(e));
  };

  const handleMouseUp = () => {
    if (!drawing || !drawStart || !drawCurrent) { setDrawing(false); return; }
    const rx = Math.min(drawStart.x, drawCurrent.x);
    const ry = Math.min(drawStart.y, drawCurrent.y);
    const rw = Math.abs(drawCurrent.x - drawStart.x);
    const rh = Math.abs(drawCurrent.y - drawStart.y);
    if (rw < 10 || rh < 10) { setDrawing(false); return; }

    const newRect: WallRect = {
      id: uid(),
      x: rx, y: ry, width: rw, height: rh,
      label: drawMode === 'wall'
        ? `壁面${activeFace.wallRects.length + 1}`
        : `開口部${activeFace.openingRects.length + 1}`,
      type: drawMode as 'wall' | 'opening',
    };

    setFaces(prev => prev.map((f, i) => {
      if (i !== activeFaceIdx) return f;
      return drawMode === 'wall'
        ? { ...f, wallRects: [...f.wallRects, newRect] }
        : { ...f, openingRects: [...f.openingRects, newRect] };
    }));
    setDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  const deleteSelectedRect = () => {
    if (!selectedRect) return;
    setFaces(prev => prev.map((f, i) => {
      if (i !== activeFaceIdx) return f;
      return {
        ...f,
        wallRects: f.wallRects.filter(r => r.id !== selectedRect),
        openingRects: f.openingRects.filter(r => r.id !== selectedRect),
      };
    }));
    setSelectedRect(null);
  };

  // デモデータ自動追加
  const loadDemoWalls = () => {
    const isFront = activeFace.name === '正面' || activeFace.name === '背面';
    const bx = 100, by = 140, bw = CANVAS_W - 200, bh = CANVAS_H - 240;
    const wallRect: WallRect = {
      id: uid(), x: bx, y: by, width: bw, height: bh,
      label: '壁面全体', type: 'wall',
    };
    const openings: WallRect[] = isFront ? [
      { id: uid(), x: bx + 60, y: by + 0, width: 120, height: 100, label: '窓1(1F左)', type: 'opening' },
      { id: uid(), x: bx + bw - 180, y: by + 0, width: 120, height: 100, label: '窓2(1F右)', type: 'opening' },
      { id: uid(), x: bx + 60, y: by + 140, width: 80, height: 70, label: '窓3(2F左)', type: 'opening' },
      { id: uid(), x: bx + bw - 140, y: by + 140, width: 80, height: 70, label: '窓4(2F右)', type: 'opening' },
      ...(activeFace.name === '正面' ? [{
        id: uid(), x: bx + bw / 2 - 35, y: by + bh - 130, width: 70, height: 130,
        label: '玄関ドア', type: 'opening' as const,
      }] : []),
    ] : [
      { id: uid(), x: bx + bw / 2 - 50, y: by + 10, width: 100, height: 90, label: '窓1', type: 'opening' },
      { id: uid(), x: bx + bw / 2 - 40, y: by + 150, width: 60, height: 50, label: '窓2', type: 'opening' },
    ];
    setFaces(prev => prev.map((f, i) => {
      if (i !== activeFaceIdx) return f;
      return { ...f, wallRects: [wallRect], openingRects: openings };
    }));
  };

  // 面積計算
  const calcFaceArea = (face: ElevationFace): { wallArea: number; openingArea: number; netArea: number } => {
    const scale = face.scale; // px/mm
    const pxToM2 = (r: WallRect) => (r.width / scale) * (r.height / scale) / 1_000_000;
    const wallArea = face.wallRects.reduce((s, r) => s + pxToM2(r), 0);
    const openingArea = face.openingRects.reduce((s, r) => s + pxToM2(r), 0);
    return { wallArea, openingArea, netArea: Math.max(0, wallArea - openingArea) };
  };

  const runCalculation = () => {
    setFaces(prev => prev.map(f => {
      const { wallArea, openingArea, netArea } = calcFaceArea(f);
      return { ...f, wallAreaM2: Math.round(wallArea * 100) / 100, openingAreaM2: Math.round(openingArea * 100) / 100, netAreaM2: Math.round(netArea * 100) / 100 };
    }));
    setStepConfirmed(prev => ({ ...prev, calc: true }));
  };

  const totalWallArea = faces.reduce((s, f) => s + f.wallAreaM2, 0);
  const totalOpeningArea = faces.reduce((s, f) => s + f.openingAreaM2, 0);
  const totalNetArea = faces.reduce((s, f) => s + f.netAreaM2, 0);

  const handleConfirm = () => {
    const data: ExteriorWallData = {
      projectId,
      faces,
      totalWallArea,
      totalOpeningArea,
      totalNetArea,
      confirmedAt: new Date().toISOString(),
    };
    saveExteriorWallData(data);
    setStepConfirmed(prev => ({ ...prev, confirm: true }));
  };

  const handleSetScale = () => {
    const mmVal = parseFloat(scaleInput);
    const pxVal = parseFloat(scalePixels);
    if (mmVal > 0 && pxVal > 0) {
      const newScale = pxVal / mmVal;
      setFaces(prev => prev.map((f, i) => i === activeFaceIdx ? { ...f, scale: newScale } : f));
      setStepConfirmed(prev => ({ ...prev, scale: true }));
    }
  };

  const stepIdx = STEPS.findIndex(s => s.id === currentStep);

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
        <h1 className="text-lg font-bold text-gray-900">外壁面積算出</h1>
        <div className="text-sm text-gray-500">{project.name}</div>
      </div>

      {/* ステップバー */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isDone = stepConfirmed[step.id];
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-full ${
                    isActive ? 'bg-blue-50 text-blue-700 font-semibold' :
                    isDone ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-blue-600 text-white' :
                    isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="hidden lg:inline">{step.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-4 mx-1 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左パネル: 面選択 & コントロール */}
        <div className="col-span-3 space-y-4">
          {/* 面タブ */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">立面</h3>
            <div className="space-y-1">
              {faces.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => { setActiveFaceIdx(i); setSelectedRect(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    i === activeFaceIdx ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{f.name}</span>
                    {f.wallRects.length > 0 && <span className="text-xs text-green-600">{f.netAreaM2 > 0 ? `${f.netAreaM2}㎡` : '設定済'}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ステップ別コントロール */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {currentStep === 'upload' && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Step 1: 立面図アップロード</h3>
                <p className="text-xs text-gray-500 mb-3">立面図PDFまたは画像をアップロードしてください。デモモードではサンプル図面が表示されます。</p>
                <button
                  onClick={() => {
                    setDemoLoaded(prev => prev.map((_, i) => true));
                    setStepConfirmed(prev => ({ ...prev, upload: true }));
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  デモ図面を読み込む
                </button>
                <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">またはファイルをドロップ</p>
                  <p className="text-xs text-gray-300 mt-1">PDF / PNG / JPG</p>
                </div>
              </div>
            )}

            {currentStep === 'scale' && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Step 2: スケール設定</h3>
                <p className="text-xs text-gray-500 mb-3">図面上の既知寸法を指定して、ピクセルと実寸の対応を設定します。</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">実寸値 (mm)</label>
                    <input type="number" value={scaleInput} onChange={e => setScaleInput(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">対応ピクセル数 (px)</label>
                    <input type="number" value={scalePixels} onChange={e => setScalePixels(e.target.value)}
                      placeholder="図面上で計測"
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <button onClick={handleSetScale}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    スケール確定
                  </button>
                  <button onClick={() => {
                    setFaces(prev => prev.map((f, i) => i === activeFaceIdx ? { ...f, scale: 0.1 } : f));
                    setStepConfirmed(prev => ({ ...prev, scale: true }));
                  }}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    デモ値を使用 (1px = 10mm)
                  </button>
                  <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
                    現在: 1px = {(1 / activeFace.scale).toFixed(1)}mm
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'wall' && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Step 3: 壁面領域設定</h3>
                <p className="text-xs text-gray-500 mb-3">壁面の外形を矩形で指定してください。キャンバス上でドラッグして描画します。</p>
                <div className="space-y-2 mb-3">
                  <button onClick={() => setDrawMode('wall')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${drawMode === 'wall' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-50 text-gray-600'}`}>
                    <PlusSquare className="w-4 h-4" /> 壁面矩形を描画
                  </button>
                  <button onClick={() => setDrawMode('select')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${drawMode === 'select' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-50 text-gray-600'}`}>
                    <MousePointer className="w-4 h-4" /> 選択モード
                  </button>
                </div>
                <button onClick={loadDemoWalls}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> AI自動検出 (デモ)
                </button>
                {selectedRect && (
                  <button onClick={deleteSelectedRect}
                    className="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> 選択した矩形を削除
                  </button>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  壁面矩形: {activeFace.wallRects.length}個
                </div>
                {activeFace.wallRects.length > 0 && (
                  <button onClick={() => setStepConfirmed(prev => ({ ...prev, wall: true }))}
                    className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    壁面領域を確定
                  </button>
                )}
              </div>
            )}

            {currentStep === 'opening' && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Step 4: 開口部設定</h3>
                <p className="text-xs text-gray-500 mb-3">窓・ドアなどの開口部を矩形で指定してください。</p>
                <div className="space-y-2 mb-3">
                  <button onClick={() => setDrawMode('opening')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${drawMode === 'opening' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-50 text-gray-600'}`}>
                    <PlusSquare className="w-4 h-4" /> 開口部矩形を描画
                  </button>
                  <button onClick={() => setDrawMode('select')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${drawMode === 'select' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-50 text-gray-600'}`}>
                    <MousePointer className="w-4 h-4" /> 選択モード
                  </button>
                </div>
                {selectedRect && (
                  <button onClick={deleteSelectedRect}
                    className="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> 選択した矩形を削除
                  </button>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  開口部矩形: {activeFace.openingRects.length}個
                </div>
                {activeFace.openingRects.length > 0 && (
                  <button onClick={() => setStepConfirmed(prev => ({ ...prev, opening: true }))}
                    className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    開口部を確定
                  </button>
                )}
              </div>
            )}

            {currentStep === 'calc' && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Step 5: 面積算出</h3>
                <p className="text-xs text-gray-500 mb-3">設定した壁面と開口部から外壁面積を算出します。</p>
                <button onClick={runCalculation}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4" /> 面積を算出
                </button>
              </div>
            )}

            {currentStep === 'confirm' && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Step 6: 確定</h3>
                <p className="text-xs text-gray-500 mb-3">計算結果を確認し、確定してください。</p>
                <button onClick={handleConfirm}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> 外壁面積を確定・保存
                </button>
                {stepConfirmed.confirm && (
                  <p className="mt-3 text-sm text-green-600 font-semibold text-center">確定済み</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 中央: Canvas */}
        <div className="col-span-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* ツールバー */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{activeFace.name}</span>
                {drawMode !== 'select' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${drawMode === 'wall' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {drawMode === 'wall' ? '壁面描画中' : '開口部描画中'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1 rounded hover:bg-gray-200">
                  <ZoomOut className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 rounded hover:bg-gray-200">
                  <ZoomIn className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => setZoom(1)} className="p-1 rounded hover:bg-gray-200">
                  <Maximize className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            {/* Canvas */}
            <div ref={containerRef} className="overflow-auto bg-slate-100" style={{ maxHeight: '500px' }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_W * zoom}
                height={CANVAS_H * zoom}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { if (drawing) handleMouseUp(); }}
                className="cursor-crosshair"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* 右パネル: データ表示 */}
        <div className="col-span-3 space-y-4">
          {/* 現在の面の矩形リスト */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">矩形リスト</h3>
            {activeFace.wallRects.length === 0 && activeFace.openingRects.length === 0 ? (
              <p className="text-xs text-gray-400">矩形がありません</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {activeFace.wallRects.map(r => (
                  <div key={r.id}
                    onClick={() => setSelectedRect(r.id)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer ${selectedRect === r.id ? 'bg-green-100' : 'hover:bg-gray-50'}`}>
                    <span className="text-green-700">{r.label}</span>
                    <span className="text-gray-400">{Math.round(r.width)}x{Math.round(r.height)}px</span>
                  </div>
                ))}
                {activeFace.openingRects.map(r => (
                  <div key={r.id}
                    onClick={() => setSelectedRect(r.id)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer ${selectedRect === r.id ? 'bg-red-100' : 'hover:bg-gray-50'}`}>
                    <span className="text-red-700">{r.label}</span>
                    <span className="text-gray-400">{Math.round(r.width)}x{Math.round(r.height)}px</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 面積結果 */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">面積結果</h3>
            <div className="space-y-2">
              {faces.map((f, i) => (
                <div key={f.id} className={`p-2 rounded-lg text-xs ${i === activeFaceIdx ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                  <div className="font-semibold text-gray-700">{f.name}</div>
                  {f.wallAreaM2 > 0 ? (
                    <div className="mt-1 grid grid-cols-3 gap-1 text-center">
                      <div><span className="text-gray-400 block">壁面</span><span className="text-green-700 font-mono">{f.wallAreaM2}</span></div>
                      <div><span className="text-gray-400 block">開口</span><span className="text-red-600 font-mono">{f.openingAreaM2}</span></div>
                      <div><span className="text-gray-400 block">純面積</span><span className="text-blue-700 font-bold font-mono">{f.netAreaM2}</span></div>
                    </div>
                  ) : (
                    <span className="text-gray-400">未計算</span>
                  )}
                </div>
              ))}
            </div>
            {/* 合計 */}
            {totalNetArea > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                  <div><span className="text-gray-500 block">壁面合計</span><span className="text-green-700 font-bold font-mono text-sm">{totalWallArea.toFixed(2)}</span><span className="text-gray-400"> ㎡</span></div>
                  <div><span className="text-gray-500 block">開口合計</span><span className="text-red-600 font-bold font-mono text-sm">{totalOpeningArea.toFixed(2)}</span><span className="text-gray-400"> ㎡</span></div>
                  <div><span className="text-gray-500 block">純面積</span><span className="text-blue-700 font-bold font-mono text-sm">{totalNetArea.toFixed(2)}</span><span className="text-gray-400"> ㎡</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => stepIdx > 0 && setCurrentStep(STEPS[stepIdx - 1].id)}
          disabled={stepIdx === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> 前のステップ
        </button>
        <button
          onClick={() => stepIdx < STEPS.length - 1 && setCurrentStep(STEPS[stepIdx + 1].id)}
          disabled={stepIdx === STEPS.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          次のステップ <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
