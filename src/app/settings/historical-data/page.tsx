'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Database, Upload, RefreshCw, TrendingUp } from 'lucide-react';

interface HistoricalRecord {
  id: string;
  projectName: string;
  buildingType: string;
  structure: string;
  region: string;
  totalFloorAreaTsubo: number;
  totalAmount: number;
  tsuboUnitPrice: number;
  grade: string | null;
  completedAt: string;
}

function fmt(n: number): string { return n.toLocaleString('ja-JP'); }
function fmtMan(n: number): string { return Math.round(n / 10000).toLocaleString('ja-JP'); }

export default function HistoricalDataPage() {
  const router = useRouter();
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, avgTsubo: 0, avgArea: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/historical-estimates');
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
        const count = json.data.length;
        const avgTsubo = count > 0 ? Math.round(json.data.reduce((s: number, r: HistoricalRecord) => s + r.tsuboUnitPrice, 0) / count) : 0;
        const avgArea = count > 0 ? Math.round(json.data.reduce((s: number, r: HistoricalRecord) => s + r.totalFloorAreaTsubo, 0) / count * 10) / 10 : 0;
        setStats({ count, avgTsubo, avgArea });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const gradeLabels: Record<string, string> = {
    standard: 'スタンダード',
    high: 'ハイグレード',
    premium: 'プレミアム',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => router.push('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> ダッシュボードに戻る
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">過去見積りデータベース</h1>
            <p className="text-sm text-gray-500">類似案件検索・推奨単価算出に使用されるデータ</p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> 更新
        </button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500">登録件数</p>
          <p className="text-3xl font-black text-gray-900">{stats.count}<span className="text-sm font-normal ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500">平均坪単価</p>
          <p className="text-3xl font-black text-blue-600">{fmtMan(stats.avgTsubo)}<span className="text-sm font-normal ml-1">万円/坪</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500">平均延床面積</p>
          <p className="text-3xl font-black text-gray-900">{stats.avgArea}<span className="text-sm font-normal ml-1">坪</span></p>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">案件名</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">タイプ</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">構造</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">地域</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">延床(坪)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">総額(万円)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">坪単価(万円)</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">グレード</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600">竣工日</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">読込中...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">データがありません</td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.projectName}</td>
                    <td className="px-3 py-3 text-center text-gray-600 text-xs">{r.buildingType}</td>
                    <td className="px-3 py-3 text-center text-gray-600 text-xs">{r.structure}</td>
                    <td className="px-3 py-3 text-center text-gray-600 text-xs">{r.region}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.totalFloorAreaTsubo}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{fmtMan(r.totalAmount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-blue-700">{fmtMan(r.tsuboUnitPrice)}</td>
                    <td className="px-3 py-3 text-center">
                      {r.grade && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{gradeLabels[r.grade] || r.grade}</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-gray-500">{new Date(r.completedAt).toLocaleDateString('ja-JP')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ナビリンク */}
      <div className="mt-6 flex justify-end">
        <button onClick={() => router.push('/estimate/new')} className="flex items-center gap-2 px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <TrendingUp className="w-4 h-4" /> この実績で概算見積もりを作成
        </button>
      </div>
    </div>
  );
}
