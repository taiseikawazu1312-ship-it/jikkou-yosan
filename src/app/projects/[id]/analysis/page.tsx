'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Edit3, ArrowLeft } from 'lucide-react';
import { ExtractedData, RoomArea, Fitting, LightingFixture, Project } from '@/lib/types';
import { getProject, getExtractedData, saveExtractedData, saveProject } from '@/lib/storage';
import { createDefaultExtractedData } from '@/lib/calc-engine';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={step || '0.01'}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {unit && <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [data, setData] = useState<ExtractedData | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push('/');
      return;
    }
    setProject(p);
    let extracted = getExtractedData(projectId);
    if (!extracted) {
      extracted = createDefaultExtractedData(projectId);
    }
    setData(extracted);
  }, [projectId, router]);

  const update = <K extends keyof ExtractedData>(key: K, value: ExtractedData[K]) => {
    if (!data) return;
    setData({ ...data, [key]: value });
    setSaved(false);
  };

  const handleSave = (andNavigate = false) => {
    if (!data) return;
    saveExtractedData(data);
    // statusを'analyzed'に更新（uploaded or draft状態からの進行）
    if (project && !['analyzed', 'calculated', 'approved'].includes(project.status)) {
      const updated = { ...project, status: 'analyzed' as const, updatedAt: new Date().toISOString() };
      saveProject(updated);
      setProject(updated);
    }
    setSaved(true);
    if (andNavigate) {
      setTimeout(() => router.push(`/projects/${projectId}`), 1000);
    } else {
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Room areas helpers
  const addRoom = (floor: 'roomAreas1F' | 'roomAreas2F') => {
    if (!data) return;
    update(floor, [...data[floor], { name: '', area: 0 }]);
  };

  const updateRoom = (floor: 'roomAreas1F' | 'roomAreas2F', index: number, field: keyof RoomArea, value: string | number) => {
    if (!data) return;
    const rooms = [...data[floor]];
    rooms[index] = { ...rooms[index], [field]: value };
    update(floor, rooms);
  };

  const removeRoom = (floor: 'roomAreas1F' | 'roomAreas2F', index: number) => {
    if (!data) return;
    update(floor, data[floor].filter((_, i) => i !== index));
  };

  // Fittings helpers
  const addFitting = (type: 'exteriorFittings' | 'interiorFittings') => {
    if (!data) return;
    update(type, [...data[type], { symbol: '', model: '', width: 0, height: 0, quantity: 1 }]);
  };

  const updateFitting = (type: 'exteriorFittings' | 'interiorFittings', index: number, field: keyof Fitting, value: string | number) => {
    if (!data) return;
    const fittings = [...data[type]];
    fittings[index] = { ...fittings[index], [field]: value };
    update(type, fittings);
  };

  const removeFitting = (type: 'exteriorFittings' | 'interiorFittings', index: number) => {
    if (!data) return;
    update(type, data[type].filter((_, i) => i !== index));
  };

  // Lighting helpers
  const addLighting = () => {
    if (!data) return;
    update('lightingFixtures', [...data.lightingFixtures, { model: '', name: '', quantity: 1 }]);
  };

  const updateLighting = (index: number, field: keyof LightingFixture, value: string | number) => {
    if (!data) return;
    const fixtures = [...data.lightingFixtures];
    fixtures[index] = { ...fixtures[index], [field]: value };
    update('lightingFixtures', fixtures);
  };

  const removeLighting = (index: number) => {
    if (!data) return;
    update('lightingFixtures', data.lightingFixtures.filter((_, i) => i !== index));
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push(`/projects/${projectId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        プロジェクトに戻る
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">解析結果 確認・編集</h1>
            <p className="text-sm text-gray-500">全数量データ（外壁・屋根含む）を確認し、必要に応じて修正してください</p>
          </div>
        </div>
        <button
          onClick={() => handleSave(false)}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? '保存しました' : '一時保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* 基本情報 */}
        <AccordionSection title="基本情報" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="建物名称" value={data.buildingName || ''} onChange={(v) => update('buildingName', v)} />
            <TextField label="構造" value={data.structure || ''} onChange={(v) => update('structure', v)} />
            <NumberField label="バルコニー面積" value={data.balconyArea} onChange={(v) => update('balconyArea', v)} unit="㎡" />
            <NumberField label="ポーチ面積" value={data.porchArea} onChange={(v) => update('porchArea', v)} unit="㎡" />
          </div>
        </AccordionSection>

        {/* 1F室面積 */}
        <AccordionSection title="1F 室面積" defaultOpen>
          <div className="space-y-2">
            {data.roomAreas1F.map((room, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => updateRoom('roomAreas1F', i, 'name', e.target.value)}
                  placeholder="室名"
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={room.area}
                  onChange={(e) => updateRoom('roomAreas1F', i, 'area', parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">㎡</span>
                <button onClick={() => removeRoom('roomAreas1F', i)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addRoom('roomAreas1F')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> 室を追加
            </button>
          </div>
        </AccordionSection>

        {/* 2F室面積 */}
        <AccordionSection title="2F 室面積" defaultOpen>
          <div className="space-y-2">
            {data.roomAreas2F.map((room, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => updateRoom('roomAreas2F', i, 'name', e.target.value)}
                  placeholder="室名"
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  step="0.01"
                  value={room.area}
                  onChange={(e) => updateRoom('roomAreas2F', i, 'area', parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">㎡</span>
                <button onClick={() => removeRoom('roomAreas2F', i)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addRoom('roomAreas2F')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> 室を追加
            </button>
          </div>
        </AccordionSection>

        {/* 平面図データ */}
        <AccordionSection title="平面図データ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NumberField label="三方囲み壁内面積" value={data.threeWallEnclosedArea} onChange={(v) => update('threeWallEnclosedArea', v)} unit="㎡" />
            <NumberField label="袖壁基礎面積" value={data.wingWallArea} onChange={(v) => update('wingWallArea', v)} unit="㎡" />
            <NumberField label="枕棚数" value={data.closetShelfCount} onChange={(v) => update('closetShelfCount', v)} step="1" unit="箇所" />
            <NumberField label="可動棚数" value={data.movableShelfCount} onChange={(v) => update('movableShelfCount', v)} step="1" unit="箇所" />
            <NumberField label="カウンター数" value={data.counterCount} onChange={(v) => update('counterCount', v)} step="1" unit="箇所" />
            <NumberField label="埋込収納数" value={data.builtInStorageCount} onChange={(v) => update('builtInStorageCount', v)} step="1" unit="箇所" />
            <NumberField label="手すり数" value={data.handrailCount} onChange={(v) => update('handrailCount', v)} step="1" unit="箇所" />
          </div>
        </AccordionSection>

        {/* 立面図データ */}
        <AccordionSection title="立面図データ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">屋根形状</label>
              <select
                value={data.roofShape}
                onChange={(e) => update('roofShape', e.target.value as ExtractedData['roofShape'])}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="gable">切妻</option>
                <option value="hip">寄棟</option>
                <option value="other">その他</option>
              </select>
            </div>
            <NumberField label="勾配" value={data.roofSlope} onChange={(v) => update('roofSlope', v)} unit="寸" />
            <NumberField label="軒先出" value={data.eaveOverhang} onChange={(v) => update('eaveOverhang', v)} unit="mm" />
            <NumberField label="ケラバ出" value={data.gabledOverhang} onChange={(v) => update('gabledOverhang', v)} unit="mm" />
            <NumberField label="間口" value={data.buildingWidth} onChange={(v) => update('buildingWidth', v)} unit="mm" />
            <NumberField label="奥行" value={data.buildingDepth} onChange={(v) => update('buildingDepth', v)} unit="mm" />
            <NumberField label="軒樋長さ" value={data.gutterLength} onChange={(v) => update('gutterLength', v)} unit="m" />
            <NumberField label="集水器数" value={data.downspoutCount} onChange={(v) => update('downspoutCount', v)} step="1" unit="個" />
            <NumberField label="バルコニー外周" value={data.balconyPerimeter} onChange={(v) => update('balconyPerimeter', v)} unit="mm" />
            <NumberField label="腰壁外周" value={data.balconyWallPerimeter} onChange={(v) => update('balconyWallPerimeter', v)} unit="mm" />
            <NumberField label="腰壁以外外周" value={data.balconyNonWallPerimeter} onChange={(v) => update('balconyNonWallPerimeter', v)} unit="mm" />
            <NumberField label="掃き出し窓幅合計" value={data.slidingDoorWidth} onChange={(v) => update('slidingDoorWidth', v)} unit="mm" />
          </div>
        </AccordionSection>

        {/* 外壁面積データ（外壁面積算出から自動反映） */}
        <AccordionSection title="外壁面積データ" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NumberField label="外壁外周長" value={data.exteriorWallPerimeter || 0} onChange={(v) => update('exteriorWallPerimeter', v)} unit="m" />
            <NumberField label="外壁面積（グロス）" value={data.exteriorWallArea || 0} onChange={(v) => update('exteriorWallArea', v)} unit="㎡" />
            <NumberField label="外壁実面積（ネット）" value={data.exteriorWallNetArea || 0} onChange={(v) => update('exteriorWallNetArea', v)} unit="㎡" />
            <NumberField label="開口部面積" value={data.openingArea || 0} onChange={(v) => update('openingArea', v)} unit="㎡" />
            <NumberField label="開口部周長" value={data.openingPerimeter || 0} onChange={(v) => update('openingPerimeter', v)} unit="m" />
            <NumberField label="開口部幅合計" value={data.openingWidth || 0} onChange={(v) => update('openingWidth', v)} unit="m" />
            <NumberField label="外壁出隅数" value={data.exteriorWallOutCornerCount || 0} onChange={(v) => update('exteriorWallOutCornerCount', v)} step="1" unit="ヶ所" />
            <NumberField label="外壁出隅長" value={data.exteriorWallOutCornerLength || 0} onChange={(v) => update('exteriorWallOutCornerLength', v)} unit="m" />
            <NumberField label="外壁入隅数" value={data.exteriorWallInCornerCount || 0} onChange={(v) => update('exteriorWallInCornerCount', v)} step="1" unit="ヶ所" />
            <NumberField label="外壁入隅長" value={data.exteriorWallInCornerLength || 0} onChange={(v) => update('exteriorWallInCornerLength', v)} unit="m" />
            <NumberField label="階高(1F)" value={data.floorHeight1F || 0} onChange={(v) => update('floorHeight1F', v)} unit="m" />
            <NumberField label="軒高" value={data.eaveHeight || 0} onChange={(v) => update('eaveHeight', v)} unit="m" />
          </div>
          {(data.exteriorWallNetArea || 0) > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800">
              外壁面積算出済み: ネット {(data.exteriorWallNetArea || 0).toFixed(2)}㎡（グロス {(data.exteriorWallArea || 0).toFixed(2)}㎡ − 開口部 {(data.openingArea || 0).toFixed(2)}㎡）
            </div>
          )}
        </AccordionSection>

        {/* 屋根データ */}
        <AccordionSection title="屋根・軒・ケラバデータ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NumberField label="屋根面積" value={data.roofArea || 0} onChange={(v) => update('roofArea', v)} unit="㎡" />
            <NumberField label="屋根出隅数" value={data.roofOutCornerCount || 0} onChange={(v) => update('roofOutCornerCount', v)} step="1" unit="ヶ所" />
            <NumberField label="屋根入隅数" value={data.roofInCornerCount || 0} onChange={(v) => update('roofInCornerCount', v)} step="1" unit="ヶ所" />
            <NumberField label="棟箇所数" value={data.ridgeCount || 0} onChange={(v) => update('ridgeCount', v)} step="1" unit="ヶ所" />
            <NumberField label="棟長" value={data.ridgeLength || 0} onChange={(v) => update('ridgeLength', v)} unit="m" />
            <NumberField label="軒箇所数" value={data.eaveCount || 0} onChange={(v) => update('eaveCount', v)} step="1" unit="ヶ所" />
            <NumberField label="軒先長" value={data.eaveLength || 0} onChange={(v) => update('eaveLength', v)} unit="m" />
            <NumberField label="軒裏面積" value={data.soffitArea || 0} onChange={(v) => update('soffitArea', v)} unit="㎡" />
            <NumberField label="ケラバ箇所数" value={data.gabledCount || 0} onChange={(v) => update('gabledCount', v)} step="1" unit="ヶ所" />
            <NumberField label="ケラバ長" value={data.gabledLength || 0} onChange={(v) => update('gabledLength', v)} unit="m" />
            <NumberField label="矢切壁面積" value={data.gableWallArea || 0} onChange={(v) => update('gableWallArea', v)} unit="㎡" />
            <NumberField label="総棟長(棟+稜+谷)" value={data.totalRidgeLength || 0} onChange={(v) => update('totalRidgeLength', v)} unit="m" />
          </div>
        </AccordionSection>

        {/* 外部サッシ */}
        <AccordionSection title="外部サッシ">
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-2">記号</div>
              <div className="col-span-3">型番</div>
              <div className="col-span-2">幅(mm)</div>
              <div className="col-span-2">高さ(mm)</div>
              <div className="col-span-2">数量</div>
              <div className="col-span-1"></div>
            </div>
            {data.exteriorFittings.map((f, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={f.symbol}
                  onChange={(e) => updateFitting('exteriorFittings', i, 'symbol', e.target.value)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={f.model}
                  onChange={(e) => updateFitting('exteriorFittings', i, 'model', e.target.value)}
                  className="col-span-3 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={f.width}
                  onChange={(e) => updateFitting('exteriorFittings', i, 'width', parseFloat(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={f.height}
                  onChange={(e) => updateFitting('exteriorFittings', i, 'height', parseFloat(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={f.quantity}
                  onChange={(e) => updateFitting('exteriorFittings', i, 'quantity', parseInt(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <button onClick={() => removeFitting('exteriorFittings', i)} className="col-span-1 p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addFitting('exteriorFittings')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> サッシを追加
            </button>
          </div>
        </AccordionSection>

        {/* 内部建具 */}
        <AccordionSection title="内部建具">
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-2">記号</div>
              <div className="col-span-3">型番</div>
              <div className="col-span-2">幅(mm)</div>
              <div className="col-span-2">高さ(mm)</div>
              <div className="col-span-2">数量</div>
              <div className="col-span-1"></div>
            </div>
            {data.interiorFittings.map((f, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={f.symbol}
                  onChange={(e) => updateFitting('interiorFittings', i, 'symbol', e.target.value)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={f.model}
                  onChange={(e) => updateFitting('interiorFittings', i, 'model', e.target.value)}
                  className="col-span-3 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={f.width}
                  onChange={(e) => updateFitting('interiorFittings', i, 'width', parseFloat(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={f.height}
                  onChange={(e) => updateFitting('interiorFittings', i, 'height', parseFloat(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={f.quantity}
                  onChange={(e) => updateFitting('interiorFittings', i, 'quantity', parseInt(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <button onClick={() => removeFitting('interiorFittings', i)} className="col-span-1 p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addFitting('interiorFittings')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> 建具を追加
            </button>
          </div>
        </AccordionSection>

        {/* 電気設備 */}
        <AccordionSection title="電気設備">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NumberField label="照明器具数" value={data.lightingCount} onChange={(v) => update('lightingCount', v)} step="1" unit="個" />
            <NumberField label="一般コンセント2口" value={data.outlet2Count} onChange={(v) => update('outlet2Count', v)} step="1" unit="個" />
            <NumberField label="アースコンセント" value={data.earthedOutletCount} onChange={(v) => update('earthedOutletCount', v)} step="1" unit="個" />
            <NumberField label="エアコン100V" value={data.aircon100vCount} onChange={(v) => update('aircon100vCount', v)} step="1" unit="台" />
            <NumberField label="エアコン200V" value={data.aircon200vCount} onChange={(v) => update('aircon200vCount', v)} step="1" unit="台" />
            <NumberField label="換気扇" value={data.ventFanCount} onChange={(v) => update('ventFanCount', v)} step="1" unit="台" />
            <NumberField label="24H換気 給気" value={data.airSupply24hCount} onChange={(v) => update('airSupply24hCount', v)} step="1" unit="個" />
            <NumberField label="24H換気 排気" value={data.airExhaust24hCount} onChange={(v) => update('airExhaust24hCount', v)} step="1" unit="個" />
            <NumberField label="電話" value={data.phoneCount} onChange={(v) => update('phoneCount', v)} step="1" unit="個" />
            <NumberField label="TV" value={data.tvCount} onChange={(v) => update('tvCount', v)} step="1" unit="個" />
            <NumberField label="スイッチ" value={data.switchCount} onChange={(v) => update('switchCount', v)} step="1" unit="個" />
            <NumberField label="3路スイッチ" value={data.threeWaySwitchCount} onChange={(v) => update('threeWaySwitchCount', v)} step="1" unit="組" />
            <NumberField label="インターホン" value={data.intercomCount} onChange={(v) => update('intercomCount', v)} step="1" unit="台" />
          </div>
        </AccordionSection>

        {/* 住設機器 */}
        <AccordionSection title="住設機器・仕上材">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="キッチン型番" value={data.kitchenModel || ''} onChange={(v) => update('kitchenModel', v)} />
            <TextField label="バス型番" value={data.bathModel || ''} onChange={(v) => update('bathModel', v)} />
            <TextField label="洗面台型番" value={data.vanityModel || ''} onChange={(v) => update('vanityModel', v)} />
            <TextField label="1Fトイレ型番" value={data.toilet1FModel || ''} onChange={(v) => update('toilet1FModel', v)} />
            <TextField label="2Fトイレ型番" value={data.toilet2FModel || ''} onChange={(v) => update('toilet2FModel', v)} />
            <TextField label="給湯器型番" value={data.waterHeaterModel || ''} onChange={(v) => update('waterHeaterModel', v)} />
            <TextField label="屋根材" value={data.roofMaterial || ''} onChange={(v) => update('roofMaterial', v)} />
            <TextField label="外壁材" value={data.wallMaterial || ''} onChange={(v) => update('wallMaterial', v)} />
            <TextField label="タイル材" value={data.tileMaterial || ''} onChange={(v) => update('tileMaterial', v)} />
            <TextField label="クロス型番" value={data.wallpaperModel || ''} onChange={(v) => update('wallpaperModel', v)} />
          </div>
        </AccordionSection>

        {/* 照明器具リスト */}
        <AccordionSection title="照明器具リスト">
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-4">型番</div>
              <div className="col-span-5">名称</div>
              <div className="col-span-2">数量</div>
              <div className="col-span-1"></div>
            </div>
            {data.lightingFixtures.map((lf, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={lf.model}
                  onChange={(e) => updateLighting(i, 'model', e.target.value)}
                  className="col-span-4 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={lf.name}
                  onChange={(e) => updateLighting(i, 'name', e.target.value)}
                  className="col-span-5 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={lf.quantity}
                  onChange={(e) => updateLighting(i, 'quantity', parseInt(e.target.value) || 0)}
                  className="col-span-2 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                />
                <button onClick={() => removeLighting(i)} className="col-span-1 p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addLighting}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> 照明器具を追加
            </button>
          </div>
        </AccordionSection>

        {/* 断熱計算用 */}
        <AccordionSection title="断熱計算用データ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NumberField label="玄関面積" value={data.entranceArea} onChange={(v) => update('entranceArea', v)} unit="㎡" />
            <NumberField label="土間収納面積" value={data.soilStorageArea} onChange={(v) => update('soilStorageArea', v)} unit="㎡" />
            <NumberField label="浴室面積" value={data.bathArea} onChange={(v) => update('bathArea', v)} unit="㎡" />
            <NumberField label="屋根断熱部分面積" value={data.roofInsulationArea} onChange={(v) => update('roofInsulationArea', v)} unit="㎡" />
            <NumberField label="外気接触2F床面積" value={data.outerAir2FArea} onChange={(v) => update('outerAir2FArea', v)} unit="㎡" />
            <NumberField label="居室数(警報器用)" value={data.bedroomCount} onChange={(v) => update('bedroomCount', v)} step="1" unit="室" />
            <NumberField label="アクセントクロス箇所数" value={data.accentWallCount} onChange={(v) => update('accentWallCount', v)} step="1" unit="箇所" />
          </div>
        </AccordionSection>
      </div>

      {/* 下部保存ボタン */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          戻る
        </button>
        <button
          onClick={() => handleSave(false)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          一時保存
        </button>
        <button
          onClick={() => handleSave(true)}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? '保存しました' : '確定して保存'}
        </button>
      </div>
    </div>
  );
}
