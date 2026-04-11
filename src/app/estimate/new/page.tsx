'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowLeft, Building2, Ruler, Sparkles, MapPin } from 'lucide-react';
import { QuickEstimateInput } from '@/lib/types';

const REGIONS = [
  '北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄',
];

export default function NewEstimatePage() {
  const router = useRouter();

  const [input, setInput] = useState<QuickEstimateInput>({
    customerName: '',
    totalFloorAreaTsubo: 35,
    buildingType: '2階建て',
    structure: '木造',
    grade: 'standard',
    region: '関東',
    hasBasement: false,
    memo: '',
  });

  const [generating, setGenerating] = useState(false);

  const update = <K extends keyof QuickEstimateInput>(key: K, value: QuickEstimateInput[K]) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    setGenerating(true);
    // inputをlocalStorageに保存してquick-estimateページへ遷移
    if (typeof window !== 'undefined') {
      localStorage.setItem('quick_estimate_input', JSON.stringify(input));
    }
    setTimeout(() => {
      router.push('/estimate/result');
    }, 800);
  };

  const sqm = (input.totalFloorAreaTsubo * 3.3124).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードに戻る
      </button>

      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-6 h-6 text-yellow-300" />
          <h1 className="text-2xl font-bold">概算見積もり作成</h1>
        </div>
        <p className="text-blue-200 text-sm">
          基本情報を入力するだけで、過去実績に基づく概算見積もりを即座に算出します。図面は不要です。
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="space-y-6">
        {/* 顧客名 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">顧客名（任意）</label>
          <input
            type="text"
            value={input.customerName}
            onChange={e => update('customerName', e.target.value)}
            placeholder="例: 山田太郎 様"
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 延床面積 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-blue-600" />
            <label className="text-sm font-semibold text-gray-900">延床面積</label>
          </div>
          <div className="flex items-center gap-6">
            <input
              type="range"
              min={15}
              max={80}
              step={0.5}
              value={input.totalFloorAreaTsubo}
              onChange={e => update('totalFloorAreaTsubo', parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="text-right min-w-[120px]">
              <span className="text-3xl font-black text-gray-900">{input.totalFloorAreaTsubo}</span>
              <span className="text-sm text-gray-500 ml-1">坪</span>
              <p className="text-xs text-gray-400">{sqm}㎡</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>15坪</span>
            <span>30坪</span>
            <span>50坪</span>
            <span>80坪</span>
          </div>
        </div>

        {/* 建物タイプ + 構造 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-semibold text-gray-900">建物タイプ</label>
            </div>
            <div className="space-y-2">
              {(['平屋', '2階建て', '3階建て'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => update('buildingType', type)}
                  className={`w-full px-4 py-3 text-sm rounded-lg border transition-all text-left ${
                    input.buildingType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-200'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="text-sm font-semibold text-gray-900 mb-4 block">構造</label>
            <div className="space-y-2">
              {(['木造', '鉄骨造', 'RC造'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => update('structure', s)}
                  className={`w-full px-4 py-3 text-sm rounded-lg border transition-all text-left ${
                    input.structure === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-200'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 仕様グレード */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <label className="text-sm font-semibold text-gray-900">仕様グレード</label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'standard' as const, label: 'スタンダード', desc: '標準仕様', color: 'blue' },
              { key: 'high' as const, label: 'ハイグレード', desc: '上位仕様', color: 'indigo' },
              { key: 'premium' as const, label: 'プレミアム', desc: '最上位仕様', color: 'purple' },
            ]).map(g => (
              <button
                key={g.key}
                onClick={() => update('grade', g.key)}
                className={`px-4 py-4 rounded-xl border-2 transition-all text-center ${
                  input.grade === g.key
                    ? `border-${g.color}-500 bg-${g.color}-50 ring-1 ring-${g.color}-200`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-bold ${input.grade === g.key ? `text-${g.color}-700` : 'text-gray-900'}`}>
                  {g.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 地域 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <label className="text-sm font-semibold text-gray-900">地域</label>
          </div>
          <select
            value={input.region}
            onChange={e => update('region', e.target.value)}
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* メモ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">メモ（任意）</label>
          <textarea
            value={input.memo}
            onChange={e => update('memo', e.target.value)}
            placeholder="特記事項があれば入力してください"
            rows={2}
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* 生成ボタン */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-8 py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium shadow-lg shadow-blue-200"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              算出中...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              概算見積もりを算出
            </>
          )}
        </button>
      </div>
    </div>
  );
}
