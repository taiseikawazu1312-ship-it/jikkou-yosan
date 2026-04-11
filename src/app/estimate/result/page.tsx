'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Zap, TrendingUp, Building2, FileText,
  ChevronDown, ChevronUp, Info, Clock, Users,
  Download, Printer, Pencil, Check, X, Sparkles,
} from 'lucide-react';
import { QuickEstimateInput, QuickEstimateResult, QuickEstimateItem } from '@/lib/types';
import { generateQuickEstimateFromInput } from '@/lib/calc-engine';

function fmt(n: number): string { return n.toLocaleString('ja-JP'); }
function fmtMan(n: number): string { return Math.round(n / 10000).toLocaleString('ja-JP'); }

export default function EstimateResultPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState<QuickEstimateInput | null>(null);
  const [result, setResult] = useState<QuickEstimateResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(true);
  const [basisOpen, setBasisOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [activeGrade, setActiveGrade] = useState<'standard' | 'high' | 'premium'>('standard');
  const [similarOpen, setSimilarOpen] = useState(false);
  const [similarData, setSimilarData] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('quick_estimate_input');
    if (!raw) { router.push('/estimate/new'); return; }
    const parsed: QuickEstimateInput = JSON.parse(raw);
    setInput(parsed);
    setActiveGrade(parsed.grade);
    setResult(generateQuickEstimateFromInput(parsed));

    // 類似案件を検索
    fetch('/api/v1/similar-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalFloorAreaTsubo: parsed.totalFloorAreaTsubo,
        buildingType: parsed.buildingType,
        structure: parsed.structure,
        region: parsed.region,
      }),
    })
      .then(res => res.json())
      .then(data => { if (data.success) setSimilarData(data); })
      .catch(() => {});
  }, [router]);

  // グレード切替
  const handleGradeChange = (grade: 'standard' | 'high' | 'premium') => {
    if (!input) return;
    const updated = { ...input, grade };
    setInput(updated);
    setActiveGrade(grade);
    setResult(generateQuickEstimateFromInput(updated));
    localStorage.setItem('quick_estimate_input', JSON.stringify(updated));
  };

  // 単価編集
  const startEdit = (idx: number, currentMid: number) => {
    setEditingIdx(idx);
    setEditValue(currentMid);
  };

  const saveEdit = () => {
    if (!result || editingIdx === null) return;
    const newItems = result.items.map((item, i) => {
      if (i !== editingIdx) return item;
      const newMid = editValue;
      const newLow = Math.round(newMid * 0.82);
      const newHigh = Math.round(newMid * 1.22);
      return {
        ...item,
        unitPriceMid: newMid, unitPriceLow: newLow, unitPriceHigh: newHigh,
        amountMid: Math.round(item.quantity * newMid),
        amountLow: Math.round(item.quantity * newLow),
        amountHigh: Math.round(item.quantity * newHigh),
        source: '手動調整',
      };
    });
    const totalLow = newItems.reduce((s, i) => s + i.amountLow, 0);
    const totalMid = newItems.reduce((s, i) => s + i.amountMid, 0);
    const totalHigh = newItems.reduce((s, i) => s + i.amountHigh, 0);
    const tsubo = input?.totalFloorAreaTsubo || 35;
    setResult({
      ...result, items: newItems,
      totalLow, totalMid, totalHigh,
      tsuboUnitPriceLow: Math.round(totalLow / tsubo),
      tsuboUnitPriceMid: Math.round(totalMid / tsubo),
      tsuboUnitPriceHigh: Math.round(totalHigh / tsubo),
    });
    setEditingIdx(null);
  };

  const handlePrint = () => { window.print(); };

  if (!input || !result) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // グループ化
  const cats = ['本体工事', '付帯工事', '諸費用'];
  const grouped = cats.map(cat => ({
    category: cat,
    items: result.items.filter(i => i.category === cat),
    subtotalLow: result.items.filter(i => i.category === cat).reduce((s, i) => s + i.amountLow, 0),
    subtotalMid: result.items.filter(i => i.category === cat).reduce((s, i) => s + i.amountMid, 0),
    subtotalHigh: result.items.filter(i => i.category === cat).reduce((s, i) => s + i.amountHigh, 0),
  }));
  const bodyGroup = grouped[0];

  const gradeLabels = { standard: 'スタンダード', high: 'ハイグレード', premium: 'プレミアム' };

  return (
    <div className="max-w-5xl mx-auto">
      {/* ナビ（印刷時非表示） */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.push('/estimate/new')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> 入力画面に戻る
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" /> 印刷 / PDF
          </button>
        </div>
      </div>

      <div ref={printRef}>
        {/* タイトルカード */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-xl print:shadow-none print:rounded-none print:p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium text-blue-200">概算見積書</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">
                {input.customerName ? `${input.customerName} 様` : '概算見積書'}
              </h1>
              <p className="text-blue-200 text-sm">
                {input.structure} {input.buildingType} | 延床 {input.totalFloorAreaTsubo}坪（{(input.totalFloorAreaTsubo * 3.3124).toFixed(1)}㎡）| {gradeLabels[activeGrade]}仕様
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-2 backdrop-blur-sm print:bg-blue-900/30">
              <Users className="w-4 h-4 text-blue-200" />
              <span className="text-sm">過去<strong className="text-yellow-300 mx-0.5">{result.similarProjectCount}</strong>件の実績に基づく概算</span>
            </div>
          </div>

          {/* メインサマリー */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
              <p className="text-xs text-blue-200 mb-1">概算総額（推奨）</p>
              <p className="text-4xl font-black tracking-tight">{fmtMan(result.totalMid)}<span className="text-lg font-normal ml-1">万円</span></p>
              <p className="text-xs text-blue-300 mt-2">{fmtMan(result.totalLow)}万円 〜 {fmtMan(result.totalHigh)}万円</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
              <p className="text-xs text-blue-200 mb-1">坪単価（推奨）</p>
              <p className="text-4xl font-black tracking-tight">{fmtMan(result.tsuboUnitPriceMid)}<span className="text-lg font-normal ml-1">万円/坪</span></p>
              <p className="text-xs text-blue-300 mt-2">{fmtMan(result.tsuboUnitPriceLow)}万円 〜 {fmtMan(result.tsuboUnitPriceHigh)}万円</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
              <p className="text-xs text-blue-200 mb-1">本体工事費（推奨）</p>
              <p className="text-4xl font-black tracking-tight">{fmtMan(bodyGroup.subtotalMid)}<span className="text-lg font-normal ml-1">万円</span></p>
              <p className="text-xs text-blue-300 mt-2">総額の約{Math.round(bodyGroup.subtotalMid / result.totalMid * 100)}%</p>
            </div>
          </div>
        </div>

        {/* グレード切替（印刷時非表示） */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 print:hidden">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-900">仕様グレードを切り替えて比較</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'standard' as const, label: 'スタンダード', color: 'blue' },
              { key: 'high' as const, label: 'ハイグレード', color: 'indigo' },
              { key: 'premium' as const, label: 'プレミアム', color: 'purple' },
            ]).map(g => (
              <button
                key={g.key}
                onClick={() => handleGradeChange(g.key)}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-center text-sm font-medium ${
                  activeGrade === g.key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 費用構成バー */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">費用構成</h2>
          <div className="flex rounded-full overflow-hidden h-8 mb-3">
            {grouped.map((g, i) => {
              const pct = Math.round(g.subtotalMid / result.totalMid * 100);
              const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
              return (
                <div key={g.category} className={`${colors[i]} flex items-center justify-center text-white text-xs font-medium`} style={{ width: `${pct}%` }}>
                  {pct}%
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 text-sm">
            {grouped.map((g, i) => {
              const dots = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
              return (
                <div key={g.category} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dots[i]}`} />
                  <span className="text-gray-600">{g.category}</span>
                  <span className="font-semibold text-gray-900">{fmtMan(g.subtotalMid)}万円</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 工種別内訳テーブル */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <button onClick={() => setDetailOpen(!detailOpen)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors print:pointer-events-none">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">工種別内訳</h2>
              <span className="text-xs text-gray-400 print:hidden">（単価クリックで編集可能）</span>
            </div>
            <span className="print:hidden">{detailOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}</span>
          </button>

          {detailOpen && (
            <div className="overflow-x-auto border-t border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">工事種別</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">数量</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">単位</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">単価（推奨）</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 bg-blue-50/50">金額（推奨）</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">金額レンジ</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">根拠</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let globalIdx = 0;
                    return grouped.map((g) => (
                      <>
                        <tr key={`h-${g.category}`} className="bg-gray-100/50">
                          <td colSpan={7} className="px-5 py-2 font-semibold text-gray-800 text-xs tracking-wider uppercase">{g.category}</td>
                        </tr>
                        {g.items.map((item) => {
                          const idx = globalIdx++;
                          const isEditing = editingIdx === idx;
                          return (
                            <tr key={`${g.category}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3 text-gray-900 font-medium">{item.workType}</td>
                              <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                                {item.quantity === 1 && item.unit === '式' ? '—' : item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 1)}
                              </td>
                              <td className="px-3 py-3 text-center text-gray-500 text-xs">{item.unit}</td>
                              <td className="px-4 py-3 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <input
                                      type="number"
                                      value={editValue}
                                      onChange={e => setEditValue(parseInt(e.target.value) || 0)}
                                      className="w-24 px-2 py-1 text-sm text-right border border-blue-400 rounded focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                    />
                                    <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingIdx(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEdit(idx, item.unitPriceMid)}
                                    className="text-gray-700 tabular-nums hover:text-blue-600 hover:underline cursor-pointer print:pointer-events-none group"
                                    title="クリックして単価を編集"
                                  >
                                    {fmt(item.unitPriceMid)}
                                    <Pencil className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 text-blue-400 print:hidden" />
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-blue-900 tabular-nums bg-blue-50/30">{fmt(item.amountMid)}</td>
                              <td className="px-4 py-3 text-right text-xs text-gray-400 tabular-nums whitespace-nowrap">{fmt(item.amountLow)} 〜 {fmt(item.amountHigh)}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{item.source}</td>
                            </tr>
                          );
                        })}
                        <tr key={`s-${g.category}`} className="bg-gray-50 border-b border-gray-200">
                          <td className="px-5 py-2 text-right font-medium text-gray-600 text-xs" colSpan={4}>{g.category} 小計</td>
                          <td className="px-4 py-2 text-right font-bold text-blue-900 tabular-nums bg-blue-50/30">{fmt(g.subtotalMid)}</td>
                          <td className="px-4 py-2 text-right text-xs text-gray-500 tabular-nums">{fmt(g.subtotalLow)} 〜 {fmt(g.subtotalHigh)}</td>
                          <td></td>
                        </tr>
                      </>
                    ));
                  })()}
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td className="px-5 py-4 text-right font-bold text-blue-900" colSpan={4}>合計</td>
                    <td className="px-4 py-4 text-right text-xl font-black text-blue-900 tabular-nums">{fmt(result.totalMid)}</td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-600 tabular-nums">{fmt(result.totalLow)} 〜 {fmt(result.totalHigh)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 数量根拠 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <button onClick={() => setBasisOpen(!basisOpen)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors print:pointer-events-none">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="text-base font-semibold text-gray-900">数量根拠</h2>
            </div>
            <span className="print:hidden">{basisOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}</span>
          </button>
          {basisOpen && (
            <div className="border-t border-gray-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.items.filter(i => i.category === '本体工事').map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.workType}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.quantityBasis}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 建物概要 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">建物概要</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '延床面積', value: `${input.totalFloorAreaTsubo}坪`, sub: `${(input.totalFloorAreaTsubo * 3.3124).toFixed(1)}㎡` },
              { label: '建物タイプ', value: input.buildingType, sub: '' },
              { label: '構造', value: input.structure, sub: '' },
              { label: '仕様グレード', value: gradeLabels[activeGrade], sub: '' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* 類似案件 */}
        {similarData && similarData.similarEstimates?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <button onClick={() => setSimilarOpen(!similarOpen)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors print:pointer-events-none">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-semibold text-gray-900">類似案件（過去実績）</h2>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{similarData.similarEstimates.length}件</span>
                {similarData.recommended && (
                  <span className="text-xs text-gray-400 ml-2">推奨坪単価: {fmtMan(similarData.recommended.tsuboUnitPriceMid)}万円</span>
                )}
              </div>
              <span className="print:hidden">{similarOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}</span>
            </button>
            {similarOpen && (
              <div className="border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 font-medium text-gray-600">案件名</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">タイプ</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">延床(坪)</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">坪単価</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">総額</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">類似度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {similarData.similarEstimates.slice(0, 8).map((e: any) => (
                      <tr key={e.id} className="border-b border-gray-100">
                        <td className="px-4 py-2 text-gray-900">{e.projectName}</td>
                        <td className="px-3 py-2 text-center text-xs text-gray-500">{e.buildingType}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{e.totalFloorAreaTsubo}</td>
                        <td className="px-4 py-2 text-right tabular-nums font-medium text-blue-700">{fmtMan(e.tsuboUnitPrice)}万</td>
                        <td className="px-4 py-2 text-right tabular-nums">{fmtMan(e.totalAmount)}万</td>
                        <td className="px-3 py-2 text-center">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.round(e.similarityScore * 100)}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{Math.round(e.similarityScore * 100)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 注意事項 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-2">概算見積りに関する注意事項</p>
              <ul className="space-y-1 text-xs text-amber-700">
                <li>- 本見積りは過去{result.similarProjectCount}件の類似案件の実績に基づく概算であり、最終金額を保証するものではありません</li>
                <li>- 地盤改良費は地盤調査の結果により大きく変動する可能性があります</li>
                <li>- 外構工事費は設計内容により変動します</li>
                <li>- 仕様の選定（キッチン・バス・外壁材等）により本体工事費は変動します</li>
                <li>- 詳細な金額は、プラン確定後の詳細見積りにてご提示いたします</li>
              </ul>
            </div>
          </div>
        </div>

        {/* フッター（印刷用） */}
        <div className="hidden print:block text-center text-xs text-gray-400 mt-8 border-t border-gray-200 pt-4">
          <p>本概算見積書は {new Date().toLocaleDateString('ja-JP')} に算出されました</p>
          <p>有効期限: 算出日から30日間</p>
        </div>
      </div>

      {/* アクション（印刷時非表示） */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => router.push('/estimate/new')} className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          条件を変更する
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50">
            <Printer className="w-4 h-4" /> 印刷 / PDF保存
          </button>
          <button onClick={() => router.push('/')} className="flex items-center gap-2 px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ダッシュボードへ
          </button>
        </div>
      </div>
    </div>
  );
}
