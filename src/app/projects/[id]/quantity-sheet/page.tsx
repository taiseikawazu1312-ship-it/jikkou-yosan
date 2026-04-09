'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Table2, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Project, BasicQuantity, BasicQuantitySheet } from '@/lib/types';
import { getProject, getExtractedData, getBasicQuantitySheet, saveBasicQuantitySheet } from '@/lib/storage';
import { createBasicQuantitySheet } from '@/lib/calc-engine';

/* ============================
   カテゴリ定義
   ============================ */
const CATEGORIES = [
  { key: 'floor_area', label: '床面積・建築面積', ids: ['bq-01','bq-02','bq-03','bq-04','bq-05','bq-06','bq-49','bq-55'] },
  { key: 'roof', label: '屋根', ids: ['bq-07','bq-19','bq-20','bq-21','bq-22','bq-78','bq-79','bq-68','bq-48','bq-75','bq-76','bq-88','bq-89','bq-87'] },
  { key: 'eave_gable', label: '軒・ケラバ', ids: ['bq-50','bq-51','bq-52','bq-53','bq-54','bq-09','bq-10','bq-11','bq-85'] },
  { key: 'ext_wall', label: '外壁', ids: ['bq-34','bq-35','bq-36','bq-37','bq-38','bq-39','bq-40','bq-41','bq-42','bq-43','bq-44','bq-33'] },
  { key: 'opening', label: '開口部', ids: ['bq-23','bq-24','bq-25','bq-26'] },
  { key: 'wing_wall', label: '袖壁・バルコニー袖壁', ids: ['bq-69','bq-70','bq-71','bq-72','bq-73','bq-74','bq-12','bq-13','bq-14','bq-15','bq-16'] },
  { key: 'balcony', label: 'バルコニー・出窓', ids: ['bq-18','bq-17','bq-58','bq-59','bq-60','bq-08'] },
  { key: 'foundation', label: '基礎', ids: ['bq-46','bq-47','bq-28','bq-29','bq-30','bq-31','bq-45'] },
  { key: 'interior', label: '内部（壁・床・和室・収納）', ids: ['bq-80','bq-67','bq-84','bq-83','bq-57','bq-81','bq-82','bq-27','bq-86','bq-90','bq-91','bq-92','bq-64','bq-56','bq-65','bq-66','bq-77'] },
  { key: 'other', label: 'その他（小屋裏・妻壁・補正）', ids: ['bq-32','bq-61','bq-62','bq-63'] },
] as const;

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  plan: { label: '平面図', color: 'bg-green-100 text-green-700' },
  elevation: { label: '立面図', color: 'bg-blue-100 text-blue-700' },
  combined: { label: '複合', color: 'bg-orange-100 text-orange-700' },
  roof_plan: { label: '屋根伏図', color: 'bg-purple-100 text-purple-700' },
  foundation: { label: '基礎伏図', color: 'bg-red-100 text-red-700' },
  na: { label: '該当なし', color: 'bg-gray-100 text-gray-500' },
};

/* ============================
   アコーディオンセクション
   ============================ */
function Section({
  title,
  children,
  defaultOpen = false,
  itemCount,
  filledCount,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  itemCount: number;
  filledCount: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const allFilled = filledCount === itemCount;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${allFilled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {filledCount}/{itemCount}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

/* ============================
   メインコンポーネント
   ============================ */
export default function QuantitySheetPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sheet, setSheet] = useState<BasicQuantitySheet | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) { router.push('/'); return; }
    setProject(p);

    // 既存データがあれば読み込み、なければExtractedDataから自動生成
    let existing = getBasicQuantitySheet(projectId);
    if (!existing) {
      const extracted = getExtractedData(projectId);
      if (extracted) {
        existing = createBasicQuantitySheet(p, extracted);
      }
    }
    if (existing) setSheet(existing);
  }, [projectId, router]);

  // 項目値を更新
  const updateItem = (id: string, field: 'value1F' | 'value2F' | 'value3F' | 'total' | 'memo', value: number | string | undefined) => {
    if (!sheet) return;
    const newItems = sheet.items.map(item => {
      if (item.id !== id) return item;
      return { ...item, [field]: value };
    });
    setSheet({ ...sheet, items: newItems });
    setSaved(false);
  };

  const handleSave = (andNavigate = false) => {
    if (!sheet) return;
    const updated = { ...sheet, calculatedAt: new Date().toISOString() };
    saveBasicQuantitySheet(updated);
    setSheet(updated);
    setSaved(true);
    if (andNavigate) {
      setTimeout(() => router.push(`/projects/${projectId}`), 1000);
    } else {
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // 再生成（ExtractedDataから再計算）
  const handleRegenerate = () => {
    if (!project) return;
    const extracted = getExtractedData(projectId);
    if (!extracted) { alert('解析データがありません'); return; }
    const newSheet = createBasicQuantitySheet(project, extracted);
    setSheet(newSheet);
    setSaved(false);
  };

  // 統計
  const stats = useMemo(() => {
    if (!sheet) return { total: 0, filled: 0, auto: 0, manual: 0 };
    const filled = sheet.items.filter(i => (i.total ?? 0) > 0 || (i.value1F ?? 0) > 0 || (i.value2F ?? 0) > 0).length;
    const auto = sheet.items.filter(i => ['plan', 'elevation', 'combined'].includes(i.source) && ((i.total ?? 0) > 0)).length;
    return { total: sheet.items.length, filled, auto, manual: filled - auto };
  }, [sheet]);

  if (!project || !sheet) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => router.push(`/projects/${projectId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        プロジェクトに戻る
      </button>

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Table2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数量積算表</h1>
            <p className="text-sm text-gray-500">{project.code} — {project.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            解析データから再生成
          </button>
          <button
            onClick={() => handleSave(false)}
            className={`flex items-center gap-2 px-5 py-2 text-sm rounded-lg transition-colors ${
              saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? '保存しました' : '一時保存'}
          </button>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">全項目数</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">入力済み</p>
          <p className="text-2xl font-bold text-green-600">{stats.filled}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">自動算出</p>
          <p className="text-2xl font-bold text-blue-600">{stats.auto}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">未入力</p>
          <p className="text-2xl font-bold text-orange-500">{stats.total - stats.filled}</p>
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(SOURCE_LABELS).map(([key, { label, color }]) => (
          <span key={key} className={`text-xs px-2 py-1 rounded-full ${color}`}>{label}</span>
        ))}
      </div>

      {/* カテゴリ別セクション */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const catItems = cat.ids.map(id => sheet.items.find(i => i.id === id)).filter(Boolean) as BasicQuantity[];
          const filledCount = catItems.filter(i => (i.total ?? 0) > 0 || (i.value1F ?? 0) > 0 || (i.value2F ?? 0) > 0).length;

          return (
            <Section
              key={cat.key}
              title={cat.label}
              defaultOpen={cat.key === 'floor_area' || cat.key === 'ext_wall'}
              itemCount={catItems.length}
              filledCount={filledCount}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 font-medium text-gray-600 whitespace-nowrap w-8">No.</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600 whitespace-nowrap">項目名</th>
                      <th className="text-center px-4 py-2 font-medium text-gray-600 whitespace-nowrap w-16">単位</th>
                      <th className="text-center px-4 py-2 font-medium text-gray-600 whitespace-nowrap w-16">取得元</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600 whitespace-nowrap w-24">1階数量</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600 whitespace-nowrap w-24">2階数量</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600 whitespace-nowrap w-28">合計数量</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600 whitespace-nowrap w-36">メモ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item, idx) => {
                      const srcInfo = SOURCE_LABELS[item.source] || SOURCE_LABELS.na;
                      const hasValue = (item.total ?? 0) > 0 || (item.value1F ?? 0) > 0 || (item.value2F ?? 0) > 0;
                      const isNa = item.source === 'na';

                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 transition-colors ${
                            isNa ? 'bg-gray-50/50 opacity-60' : hasValue ? 'hover:bg-blue-50/30' : 'hover:bg-orange-50/30'
                          }`}
                        >
                          <td className="px-4 py-2 text-xs text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-2 text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {hasValue ? (
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              ) : isNa ? (
                                <span className="w-3.5 h-3.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                              )}
                              {item.name}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center text-gray-500 text-xs">{item.unit}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${srcInfo.color}`}>{srcInfo.label}</span>
                          </td>
                          <td className="px-4 py-2">
                            {!isNa && (
                              <input
                                type="number"
                                step="0.01"
                                value={item.value1F ?? ''}
                                onChange={(e) => updateItem(item.id, 'value1F', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="w-full px-2 py-1 text-sm text-right border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="-"
                              />
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {!isNa && (
                              <input
                                type="number"
                                step="0.01"
                                value={item.value2F ?? ''}
                                onChange={(e) => updateItem(item.id, 'value2F', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="w-full px-2 py-1 text-sm text-right border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="-"
                              />
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {!isNa ? (
                              <input
                                type="number"
                                step="0.01"
                                value={item.total ?? ''}
                                onChange={(e) => updateItem(item.id, 'total', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className={`w-full px-2 py-1 text-sm text-right border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                                  hasValue ? 'border-green-300 bg-green-50/50' : 'border-gray-200'
                                }`}
                                placeholder="-"
                              />
                            ) : (
                              <span className="text-xs text-gray-400 px-2">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.memo ?? ''}
                              onChange={(e) => updateItem(item.id, 'memo', e.target.value || undefined)}
                              className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="メモ"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          );
        })}
      </div>

      {/* 下部ボタン */}
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
            saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? '保存しました' : '確定して保存'}
        </button>
      </div>
    </div>
  );
}
