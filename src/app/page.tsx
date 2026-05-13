'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Trash2, ChevronRight, FileText, Zap, Calculator, Sparkles } from 'lucide-react';
import { Project } from '@/lib/types';
import { getProjects, deleteProject, saveProject, saveExtractedData } from '@/lib/storage';
import { createSampleProject, createSampleExtractedData } from '@/lib/calc-engine';

const statusLabels: Record<Project['status'], string> = {
  draft: '下書き',
  uploaded: '図面UP済',
  analyzed: '解析済',
  calculated: '計算済',
  approved: '承認済',
};

const statusColors: Record<Project['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  uploaded: 'bg-blue-100 text-blue-700',
  analyzed: 'bg-yellow-100 text-yellow-700',
  calculated: 'bg-green-100 text-green-700',
  approved: 'bg-purple-100 text-purple-700',
};

const buildingTypeLabels: Record<Project['buildingType'], string> = {
  value: 'バリュー',
  toku_value: '特バリュー',
  premium: 'プレミアム',
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
    setLoaded(true);
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('このプロジェクトを削除しますか?')) {
      deleteProject(id);
      setProjects(getProjects());
    }
  };

  const handleLoadSample = () => {
    const sampleProject = createSampleProject();
    saveProject(sampleProject);
    const sampleData = createSampleExtractedData();
    saveExtractedData(sampleData);
    setProjects(getProjects());
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">概算見積もり & 実行予算書の作成・管理</p>
        </div>
        <button
          onClick={handleLoadSample}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FileText className="w-4 h-4" />
          デモデータ読込
        </button>
      </div>

      {/* === 概算見積もりモード（営業向け） === */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-gray-900">概算見積もり</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">営業向け</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 新規概算見積もり */}
          <div
            onClick={() => router.push('/estimate/new')}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-7 h-7 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">新規 概算見積もりを作成</h3>
                <p className="text-sm text-blue-200 mt-1">図面不要 — 基本情報5項目で即座に概算算出</p>
              </div>
              <div className="text-white/60 group-hover:translate-x-1 transition-transform text-2xl">→</div>
            </div>
          </div>

          {/* デモ */}
          <div
            onClick={() => {
              handleLoadSample();
              setTimeout(() => router.push('/projects/sample-001/quick-estimate'), 100);
            }}
            className="bg-white rounded-xl border-2 border-dashed border-blue-200 p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">デモを見る（図面あり版）</h3>
                <p className="text-sm text-gray-500 mt-1">標準モデルプラン — AI図面解析 + 過去実績ベース</p>
              </div>
              <div className="text-gray-400 group-hover:translate-x-1 transition-transform">→</div>
            </div>
          </div>
        </div>
      </div>

      {/* === 詳細見積もりモード（積算向け） === */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">詳細見積もり・実行予算書</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">積算向け</span>
          </div>
          <button
            onClick={() => router.push('/projects/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新規プロジェクト
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">プロジェクトがありません</h3>
            <p className="text-sm text-gray-500 mt-1">新規プロジェクトを作成するか、デモデータを読み込んでください</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-mono">{project.code}</p>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight mt-0.5">{project.name}</h3>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {buildingTypeLabels[project.buildingType]}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="text-gray-400">延床面積</span>
                    <p className="font-medium text-gray-700">{project.totalFloorArea.toFixed(1)}㎡ ({project.totalFloorAreaTsubo.toFixed(1)}坪)</p>
                  </div>
                  <div>
                    <span className="text-gray-400">作成日</span>
                    <p className="font-medium text-gray-700">{new Date(project.createdAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end text-xs text-blue-600 font-medium group-hover:text-blue-700">
                  詳細を見る
                  <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
