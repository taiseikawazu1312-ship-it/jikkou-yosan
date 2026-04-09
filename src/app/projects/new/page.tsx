'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Save } from 'lucide-react';
import { Project } from '@/lib/types';
import { saveProject } from '@/lib/storage';

const TSUBO_DIVISOR = 3.3124;

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: '',
    name: '',
    buildingType: 'value' as Project['buildingType'],
    floorArea1F: '',
    floorArea2F: '',
    buildingArea: '',
    siteArea: '',
    hasGroundImprovement: false,
    improvementMethod: 'surface' as 'surface' | 'column' | 'steel_pipe',
    hasSepticTank: false,
    gasType: 'city' as 'city' | 'propane',
    hasPerformanceEval: false,
    exteriorWallQuote: '',
  });

  const floorArea1F = parseFloat(form.floorArea1F) || 0;
  const floorArea2F = parseFloat(form.floorArea2F) || 0;
  const totalFloorArea = floorArea1F + floorArea2F;
  const tsubo1F = floorArea1F / TSUBO_DIVISOR;
  const tsubo2F = floorArea2F / TSUBO_DIVISOR;
  const totalTsubo = totalFloorArea / TSUBO_DIVISOR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const project: Project = {
      id: Date.now().toString(36),
      code: form.code,
      name: form.name,
      buildingType: form.buildingType,
      floorArea1F,
      floorArea2F,
      totalFloorArea,
      floorAreaTsubo1F: tsubo1F,
      floorAreaTsubo2F: tsubo2F,
      totalFloorAreaTsubo: totalTsubo,
      buildingArea: parseFloat(form.buildingArea) || 0,
      siteArea: parseFloat(form.siteArea) || 0,
      hasGroundImprovement: form.hasGroundImprovement,
      improvementMethod: form.hasGroundImprovement ? form.improvementMethod : undefined,
      hasSepticTank: form.hasSepticTank,
      gasType: form.gasType,
      hasPerformanceEval: form.hasPerformanceEval,
      exteriorWallQuote: form.exteriorWallQuote ? parseFloat(form.exteriorWallQuote) : undefined,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    saveProject(project);
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新規プロジェクト作成</h1>
          <p className="text-sm text-gray-500">工事情報を入力してください</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">工事コード <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="例: A-2026-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">工事名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: 田中邸新築工事"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">建物タイプ <span className="text-red-500">*</span></label>
              <select
                value={form.buildingType}
                onChange={(e) => setForm({ ...form, buildingType: e.target.value as Project['buildingType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="value">バリュー</option>
                <option value="toku_value">特バリュー</option>
                <option value="premium">プレミアム</option>
              </select>
            </div>
          </div>
        </section>

        {/* 面積情報 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">面積情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1F床面積 (㎡) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                required
                value={form.floorArea1F}
                onChange={(e) => setForm({ ...form, floorArea1F: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">{tsubo1F.toFixed(2)} 坪</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2F床面積 (㎡) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                required
                value={form.floorArea2F}
                onChange={(e) => setForm({ ...form, floorArea2F: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">{tsubo2F.toFixed(2)} 坪</p>
            </div>
            <div className="sm:col-span-2 bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">延床面積</span>
                <span className="text-lg font-bold text-blue-900">
                  {totalFloorArea.toFixed(2)} ㎡ ({totalTsubo.toFixed(2)} 坪)
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">建築面積 (㎡)</label>
              <input
                type="number"
                step="0.01"
                value={form.buildingArea}
                onChange={(e) => setForm({ ...form, buildingArea: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">敷地面積 (㎡)</label>
              <input
                type="number"
                step="0.01"
                value={form.siteArea}
                onChange={(e) => setForm({ ...form, siteArea: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </section>

        {/* 工事条件 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">工事条件</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-700">地盤改良</span>
                <p className="text-xs text-gray-400">地盤改良工事の有無</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, hasGroundImprovement: !form.hasGroundImprovement })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.hasGroundImprovement ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.hasGroundImprovement ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {form.hasGroundImprovement && (
              <div className="ml-4 pl-4 border-l-2 border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">改良工法</label>
                <select
                  value={form.improvementMethod}
                  onChange={(e) => setForm({ ...form, improvementMethod: e.target.value as 'surface' | 'column' | 'steel_pipe' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="surface">表層改良</option>
                  <option value="column">柱状改良</option>
                  <option value="steel_pipe">鋼管杭</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-700">浄化槽</span>
                <p className="text-xs text-gray-400">浄化槽設置の要否</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, hasSepticTank: !form.hasSepticTank })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.hasSepticTank ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.hasSepticTank ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ガス種別</label>
              <select
                value={form.gasType}
                onChange={(e) => setForm({ ...form, gasType: e.target.value as 'city' | 'propane' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="city">都市ガス</option>
                <option value="propane">プロパンガス</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-700">性能評価</span>
                <p className="text-xs text-gray-400">住宅性能評価の有無</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, hasPerformanceEval: !form.hasPerformanceEval })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.hasPerformanceEval ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.hasPerformanceEval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 任意入力 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">任意入力</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">外壁業者見積額 (円)</label>
            <input
              type="number"
              value={form.exteriorWallQuote}
              onChange={(e) => setForm({ ...form, exteriorWallQuote: e.target.value })}
              placeholder="例: 1500000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </section>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存して次へ
          </button>
        </div>
      </form>
    </div>
  );
}
