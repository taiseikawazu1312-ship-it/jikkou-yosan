'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Trash2, ChevronRight, FileText, Zap } from 'lucide-react';
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

function EmptyState() {
  return (
    <div className="text-center py-16">
      <svg
        className="mx-auto h-24 w-24 text-gray-300"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="20" y="40" width="60" height="45" rx="2" />
        <polygon points="50,15 15,40 85,40" />
        <rect x="35" y="55" width="12" height="12" />
        <rect x="55" y="55" width="12" height="12" />
        <rect x="42" y="65" width="16" height="20" />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">プロジェクトがありません</h3>
      <p className="mt-2 text-sm text-gray-500">
        新規プロジェクトを作成するか、サンプルデータを読み込んで始めましょう。
      </p>
    </div>
  );
}

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">
            プロジェクト一覧 ({projects.length}件)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            サンプルデータを読み込む
          </button>
          <button
            onClick={() => router.push('/projects/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新規プロジェクト作成
          </button>
        </div>
      </div>

      {/* 概算見積もりデモカード */}
      <div
        onClick={() => {
          handleLoadSample();
          setTimeout(() => router.push('/projects/sample-001/quick-estimate'), 100);
        }}
        className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">概算見積もりデモを見る</h2>
              <p className="text-sm text-blue-200">住友林業モデルプランA — 過去実績ベースの概算見積書を即座に生成</p>
            </div>
          </div>
          <div className="text-white/80 group-hover:translate-x-1 transition-transform text-lg">→</div>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
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
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mt-0.5">
                      {project.name}
                    </h3>
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
                  <p className="font-medium text-gray-700">
                    {project.totalFloorArea.toFixed(1)}㎡ ({project.totalFloorAreaTsubo.toFixed(1)}坪)
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">作成日</span>
                  <p className="font-medium text-gray-700">
                    {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                  </p>
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
  );
}
