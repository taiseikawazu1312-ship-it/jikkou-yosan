'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, Brain, Calculator, FileSpreadsheet, CheckCircle, Circle, ArrowLeft, Building2, Square } from 'lucide-react';
import { Project, CalculationResult } from '@/lib/types';
import { getProject, saveProject, getExtractedData, getCalculationResult, saveCalculationResult, getExteriorWallData } from '@/lib/storage';
import { calculateBudget } from '@/lib/calc-engine';

const buildingTypeLabels: Record<Project['buildingType'], string> = {
  value: 'バリュー',
  toku_value: '特バリュー',
  premium: 'プレミアム',
};

const statusLabels: Record<Project['status'], string> = {
  draft: '下書き',
  uploaded: '図面UP済',
  analyzed: '解析済',
  calculated: '計算済',
  approved: '承認済',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push('/');
      return;
    }
    setProject(p);
    setCalcResult(getCalculationResult(projectId) ?? null);
  }, [projectId, router]);

  const hasExtractedData = !!getExtractedData(projectId);
  const hasCalcResult = !!calcResult;
  const hasWallData = !!getExteriorWallData(projectId)?.confirmedAt;

  const handleCalculate = async () => {
    if (!project) return;
    const extracted = getExtractedData(projectId);
    if (!extracted) {
      alert('先にAI解析データを準備してください。');
      return;
    }
    setCalculating(true);
    try {
      const result = calculateBudget(project, extracted);
      saveCalculationResult(result);
      setCalcResult(result);
      const updatedProject = { ...project, status: 'calculated' as const, updatedAt: new Date().toISOString() };
      saveProject(updatedProject);
      setProject(updatedProject);
    } finally {
      setCalculating(false);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const steps = [
    {
      title: '図面アップロード',
      description: 'PDF図面をアップロード',
      icon: Upload,
      href: `/projects/${projectId}/upload`,
      done: project.status !== 'draft',
    },
    {
      title: 'AI解析結果確認',
      description: '抽出データを確認・修正',
      icon: Brain,
      href: `/projects/${projectId}/analysis`,
      done: hasExtractedData,
    },
    {
      title: '外壁面積算出',
      description: '立面図から外壁面積を算出',
      icon: Square,
      href: `/projects/${projectId}/exterior-wall`,
      done: hasWallData,
    },
    {
      title: '積算計算実行',
      description: '予算書の自動計算',
      icon: Calculator,
      href: undefined,
      done: hasCalcResult,
      action: handleCalculate,
    },
    {
      title: '予算書出力',
      description: 'Excel出力・印刷',
      icon: FileSpreadsheet,
      href: `/projects/${projectId}/budget`,
      done: project.status === 'approved',
    },
  ];

  return (
    <div>
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードに戻る
      </button>

      {/* プロジェクトサマリー */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500 font-mono">{project.code}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {statusLabels[project.status]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{project.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              <span>タイプ: <strong className="text-gray-700">{buildingTypeLabels[project.buildingType]}</strong></span>
              <span>延床: <strong className="text-gray-700">{project.totalFloorArea.toFixed(1)}㎡ ({project.totalFloorAreaTsubo.toFixed(1)}坪)</strong></span>
              <span>1F: <strong className="text-gray-700">{project.floorArea1F.toFixed(1)}㎡</strong></span>
              <span>2F: <strong className="text-gray-700">{project.floorArea2F.toFixed(1)}㎡</strong></span>
              {project.buildingArea > 0 && <span>建築面積: <strong className="text-gray-700">{project.buildingArea.toFixed(1)}㎡</strong></span>}
              {project.siteArea > 0 && <span>敷地面積: <strong className="text-gray-700">{project.siteArea.toFixed(1)}㎡</strong></span>}
            </div>
          </div>
        </div>
      </div>

      {/* ステップカード */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">ワークフロー</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const StepIcon = step.done ? CheckCircle : Circle;
          return (
            <div
              key={i}
              onClick={() => {
                if (step.action) {
                  step.action();
                } else if (step.href) {
                  router.push(step.href);
                }
              }}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                step.done ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  step.done ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${step.done ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
                <StepIcon className={`w-5 h-5 ${step.done ? 'text-green-500' : 'text-gray-300'}`} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              {step.action && !step.done && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step.action!();
                  }}
                  disabled={calculating}
                  className="mt-3 w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {calculating ? '計算中...' : '積算計算を実行'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 計算結果サマリー */}
      {calcResult && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">計算結果サマリー</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600">合計金額</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {calcResult.totalAmount.toLocaleString()}
                <span className="text-sm font-normal ml-1">円</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">坪単価</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {calcResult.tsuboUnitPrice.toLocaleString()}
                <span className="text-sm font-normal ml-1">円/坪</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">㎡単価</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {calcResult.sqmUnitPrice.toLocaleString()}
                <span className="text-sm font-normal ml-1">円/㎡</span>
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => router.push(`/projects/${projectId}/budget`)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              予算書を見る
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
