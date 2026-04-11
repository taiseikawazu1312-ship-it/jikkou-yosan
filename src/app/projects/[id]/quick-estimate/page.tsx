'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Zap, TrendingUp, Building2, FileText,
  ChevronDown, ChevronUp, Info, Clock, Users,
} from 'lucide-react';
import { Project, QuickEstimateResult } from '@/lib/types';
import { getProject, getExtractedData } from '@/lib/storage';
import { createSampleExtractedData, createSampleProject, generateQuickEstimate } from '@/lib/calc-engine';

function fmt(n: number): string {
  return n.toLocaleString('ja-JP');
}
function fmtMan(n: number): string {
  return Math.round(n / 10000).toLocaleString('ja-JP');
}

export default function QuickEstimatePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [result, setResult] = useState<QuickEstimateResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(true);
  const [basisOpen, setBasisOpen] = useState(false);

  useEffect(() => {
    let p = getProject(projectId);
    let extracted = getExtractedData(projectId);

    // デモモード: サンプルデータを使用
    if (!p) p = createSampleProject();
    if (!extracted) extracted = createSampleExtractedData();

    setProject(p);
    setResult(generateQuickEstimate(p, extracted));
  }, [projectId, router]);

  // 工事カテゴリ別グループ
  const grouped = useMemo(() => {
    if (!result) return [];
    const cats = ['本体工事', '付帯工事', '諸費用'];
    return cats.map(cat => ({
      category: cat,
      items: result.items.filter(i => i.category === cat),
      subtotalLow: result.items.filter(i => i.category === cat).reduce((s, i) => s + i.amountLow, 0),
      subtotalMid: result.items.filter(i => i.category === cat).reduce((s, i) => s + i.amountMid, 0),
      subtotalHigh: result.items.filter(i => i.category === cat).reduce((s, i) => s + i.amountHigh, 0),
    }));
  }, [result]);

  if (!project || !result) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const bodyGroup = grouped.find(g => g.category === '本体工事');

  return (
    <div className="max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          プロジェクトに戻る
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {new Date(result.calculatedAt).toLocaleString('ja-JP')} 算出
          </span>
        </div>
      </div>

      {/* タイトルカード */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium text-blue-200">概算見積書</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
            <p className="text-blue-200 text-sm">
              {project.code} | 延床 {project.totalFloorArea.toFixed(1)}㎡（{project.totalFloorAreaTsubo.toFixed(1)}坪）| 木造2階建て
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Users className="w-4 h-4 text-blue-200" />
            <span className="text-sm">
              過去<strong className="text-yellow-300 mx-0.5">{result.similarProjectCount}</strong>件の実績に基づく概算
            </span>
          </div>
        </div>

        {/* メインサマリー */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
            <p className="text-xs text-blue-200 mb-1">概算総額（推奨）</p>
            <p className="text-4xl font-black tracking-tight">
              {fmtMan(result.totalMid)}
              <span className="text-lg font-normal ml-1">万円</span>
            </p>
            <p className="text-xs text-blue-300 mt-2">
              {fmtMan(result.totalLow)}万円 〜 {fmtMan(result.totalHigh)}万円
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
            <p className="text-xs text-blue-200 mb-1">坪単価（推奨）</p>
            <p className="text-4xl font-black tracking-tight">
              {fmtMan(result.tsuboUnitPriceMid)}
              <span className="text-lg font-normal ml-1">万円/坪</span>
            </p>
            <p className="text-xs text-blue-300 mt-2">
              {fmtMan(result.tsuboUnitPriceLow)}万円 〜 {fmtMan(result.tsuboUnitPriceHigh)}万円
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
            <p className="text-xs text-blue-200 mb-1">本体工事費（推奨）</p>
            <p className="text-4xl font-black tracking-tight">
              {fmtMan(bodyGroup?.subtotalMid || 0)}
              <span className="text-lg font-normal ml-1">万円</span>
            </p>
            <p className="text-xs text-blue-300 mt-2">
              総額の約{bodyGroup ? Math.round(bodyGroup.subtotalMid / result.totalMid * 100) : 0}%
            </p>
          </div>
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
              <div
                key={g.category}
                className={`${colors[i]} flex items-center justify-center text-white text-xs font-medium transition-all`}
                style={{ width: `${pct}%` }}
              >
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
        <button
          onClick={() => setDetailOpen(!detailOpen)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">工種別内訳</h2>
          </div>
          {detailOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {detailOpen && (
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">工事種別</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">数量</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-600">単位</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">金額（下限）</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap bg-blue-50/50">金額（推奨）</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">金額（上限）</th>
                  <th className="text-center px-3 py-3 font-medium text-gray-600">比率</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">根拠</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((g) => (
                  <>
                    {/* カテゴリヘッダー */}
                    <tr key={`h-${g.category}`} className="bg-gray-100/50">
                      <td colSpan={8} className="px-5 py-2 font-semibold text-gray-800 text-xs tracking-wider uppercase">
                        {g.category}
                      </td>
                    </tr>
                    {g.items.map((item, ii) => (
                      <tr key={`${g.category}-${ii}`} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-gray-900 font-medium">{item.workType}</td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                          {item.quantity === 1 && item.unit === '式' ? '—' : item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 1)}
                        </td>
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">{item.unit}</td>
                        <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{fmt(item.amountLow)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-900 tabular-nums bg-blue-50/30">{fmt(item.amountMid)}</td>
                        <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{fmt(item.amountHigh)}</td>
                        <td className="px-3 py-3 text-center text-gray-400 text-xs">{item.ratio}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{item.source}</td>
                      </tr>
                    ))}
                    {/* 小計 */}
                    <tr key={`s-${g.category}`} className="bg-gray-50 border-b border-gray-200">
                      <td className="px-5 py-2 text-right font-medium text-gray-600 text-xs" colSpan={3}>{g.category} 小計</td>
                      <td className="px-4 py-2 text-right text-gray-600 tabular-nums text-xs">{fmt(g.subtotalLow)}</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-900 tabular-nums bg-blue-50/30">{fmt(g.subtotalMid)}</td>
                      <td className="px-4 py-2 text-right text-gray-600 tabular-nums text-xs">{fmt(g.subtotalHigh)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </>
                ))}
                {/* 合計 */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-5 py-4 text-right font-bold text-blue-900" colSpan={3}>合計</td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-700 tabular-nums">{fmt(result.totalLow)}</td>
                  <td className="px-4 py-4 text-right text-xl font-black text-blue-900 tabular-nums">{fmt(result.totalMid)}</td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-700 tabular-nums">{fmt(result.totalHigh)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 数量根拠 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <button
          onClick={() => setBasisOpen(!basisOpen)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-semibold text-gray-900">数量根拠（基本数量表から算出）</h2>
          </div>
          {basisOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
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

      {/* 主要数量サマリー */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">建物概要</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '延床面積', value: `${project.totalFloorArea.toFixed(1)}㎡`, sub: `${project.totalFloorAreaTsubo.toFixed(1)}坪` },
            { label: '1F床面積', value: `${project.floorArea1F.toFixed(1)}㎡`, sub: '' },
            { label: '2F床面積', value: `${project.floorArea2F.toFixed(1)}㎡`, sub: '' },
            { label: '建築面積', value: `${project.buildingArea.toFixed(1)}㎡`, sub: '' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
              {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-2">概算見積りに関する注意事項</p>
            <ul className="space-y-1 text-xs text-amber-700">
              <li>- 本見積りは過去{result.similarProjectCount}件の類似案件の実績に基づく概算であり、最終金額を保証するものではありません</li>
              <li>- 地盤改良費は地盤調査の結果により大きく変動する可能性があります（0〜100万円程度）</li>
              <li>- 外構工事費は設計内容により変動します。上記はあくまで目安です</li>
              <li>- 仕様の選定（キッチン・バス・外壁材等）により本体工事費は変動します</li>
              <li>- 諸費用にはローン手数料・火災保険料等を含む概算です</li>
              <li>- 詳細な金額は、プラン確定後の詳細見積りにてご提示いたします</li>
            </ul>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          プロジェクトに戻る
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/projects/${projectId}/quantity-sheet`)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            数量積算表を見る
          </button>
          <button
            onClick={() => router.push(`/projects/${projectId}/budget`)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            詳細見積りに進む
          </button>
        </div>
      </div>
    </div>
  );
}
