'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, RefreshCw, Info, FileSpreadsheet, Edit2, ArrowLeft, X, Calculator, CheckCircle } from 'lucide-react';
import { Project, BudgetItem, CalculationResult } from '@/lib/types';
import { getProject, saveProject, getExtractedData, getCalculationResult, saveCalculationResult } from '@/lib/storage';
import { calculateBudget } from '@/lib/calc-engine';

export default function BudgetPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [logModal, setLogModal] = useState<{ item: BudgetItem } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ quantity: number; unitPrice: number }>({ quantity: 0, unitPrice: 0 });
  const [calculating, setCalculating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push('/');
      return;
    }
    setProject(p);
    setResult(getCalculationResult(projectId) ?? null);
  }, [projectId, router]);

  // Group items by workCategory
  const groupedItems = useMemo(() => {
    if (!result) return [];
    const groups: { category: string; items: BudgetItem[]; subtotal: number }[] = [];
    let currentCategory = '';

    for (const item of result.items) {
      if (item.workCategory !== currentCategory) {
        currentCategory = item.workCategory;
        groups.push({ category: currentCategory, items: [], subtotal: 0 });
      }
      const group = groups[groups.length - 1];
      group.items.push(item);
      group.subtotal += item.detailAmount;
    }

    return groups;
  }, [result]);

  const handleCalculate = () => {
    if (!project) return;
    const extracted = getExtractedData(projectId);
    if (!extracted) {
      alert('先にAI解析データを準備してください。');
      return;
    }
    setCalculating(true);
    try {
      const newResult = calculateBudget(project, extracted);
      saveCalculationResult(newResult);
      setResult(newResult);
      const updatedProject = { ...project, status: 'calculated' as const, updatedAt: new Date().toISOString() };
      saveProject(updatedProject);
      setProject(updatedProject);
    } finally {
      setCalculating(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, result, project }),
      });
      if (!res.ok) throw new Error('エクスポートに失敗しました');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `実行予算書_${project?.code || projectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エクスポート中にエラーが発生しました');
    } finally {
      setDownloading(false);
    }
  };

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditValues({ quantity: item.quantity, unitPrice: item.unitPrice });
  };

  const saveEdit = () => {
    if (!result || !editingId) return;
    const newItems = result.items.map((item) => {
      if (item.id === editingId) {
        const newAmount = editValues.quantity * editValues.unitPrice;
        return { ...item, quantity: editValues.quantity, unitPrice: editValues.unitPrice, detailAmount: newAmount };
      }
      return item;
    });
    const newTotal = newItems.reduce((sum, item) => sum + item.detailAmount, 0);
    const tsuboPrice = project?.totalFloorAreaTsubo ? Math.round(newTotal / project.totalFloorAreaTsubo) : 0;
    const sqmPrice = project?.totalFloorArea ? Math.round(newTotal / project.totalFloorArea) : 0;
    const newResult: CalculationResult = {
      ...result,
      items: newItems,
      totalAmount: newTotal,
      tsuboUnitPrice: tsuboPrice,
      sqmUnitPrice: sqmPrice,
    };
    saveCalculationResult(newResult);
    setResult(newResult);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          プロジェクトに戻る
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">計算結果がありません</h2>
          <p className="text-sm text-gray-500 mb-6">積算計算を実行して予算書を生成してください。</p>
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {calculating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            {calculating ? '計算中...' : '積算計算を実行'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push(`/projects/${projectId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        プロジェクトに戻る
      </button>

      {/* ヘッダー */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">実行予算書</h1>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span>工事コード: <strong className="text-gray-700">{project.code}</strong></span>
              <span>工事名: <strong className="text-gray-700">{project.name}</strong></span>
              <span>延床: <strong className="text-gray-700">{project.totalFloorArea.toFixed(1)}㎡ ({project.totalFloorAreaTsubo.toFixed(1)}坪)</strong></span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
              再計算
            </button>
            <button
              onClick={handleExport}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              {downloading ? 'ダウンロード中...' : 'Excelダウンロード'}
            </button>
            {project.status !== 'approved' ? (
              <button
                onClick={() => {
                  const updated = { ...project, status: 'approved' as const, updatedAt: new Date().toISOString() };
                  saveProject(updated);
                  setProject(updated);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                承認
              </button>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                承認済
              </span>
            )}
          </div>
        </div>

        {/* 合計サマリー */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600">合計金額</p>
            <p className="text-xl font-bold text-blue-900">{result.totalAmount.toLocaleString()}<span className="text-xs font-normal ml-1">円</span></p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600">坪単価</p>
            <p className="text-xl font-bold text-gray-900">{result.tsuboUnitPrice.toLocaleString()}<span className="text-xs font-normal ml-1">円/坪</span></p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600">㎡単価</p>
            <p className="text-xl font-bold text-gray-900">{result.sqmUnitPrice.toLocaleString()}<span className="text-xs font-normal ml-1">円/㎡</span></p>
          </div>
        </div>
      </div>

      {/* 明細テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">工事種別</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">細目工種名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">業者名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">部材/仕様</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">単価</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">数量</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">単位</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">金額</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems.map((group, gi) => (
                <React.Fragment key={gi}>
                  {group.items.map((item, ii) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {ii === 0 && (
                        <td
                          className="px-4 py-2 font-medium text-gray-900 bg-gray-50/50 whitespace-nowrap align-top"
                          rowSpan={group.items.length}
                        >
                          {group.category}
                        </td>
                      )}
                      <td className="px-4 py-2 text-gray-700">{item.detailName}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{item.vendor}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs max-w-40 truncate">{item.spec}</td>
                      {editingId === item.id ? (
                        <>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              value={editValues.unitPrice}
                              onChange={(e) => setEditValues({ ...editValues, unitPrice: parseFloat(e.target.value) || 0 })}
                              className="w-24 px-1 py-0.5 text-sm text-right border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.quantity}
                              onChange={(e) => setEditValues({ ...editValues, quantity: parseFloat(e.target.value) || 0 })}
                              className="w-20 px-1 py-0.5 text-sm text-right border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-right text-gray-700 tabular-nums">{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-gray-700 tabular-nums">{item.quantity}</td>
                        </>
                      )}
                      <td className="px-4 py-2 text-center text-gray-500 text-xs">{item.unit}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900 tabular-nums">
                        {editingId === item.id
                          ? (editValues.quantity * editValues.unitPrice).toLocaleString()
                          : item.detailAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {editingId === item.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                保存
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-2 py-0.5 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-100"
                              >
                                取消
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(item)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="編集"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {item.calculationLog && (
                                <button
                                  onClick={() => setLogModal({ item })}
                                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="計算ログ"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* 小計行 */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={7} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                      {group.category} 小計
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900 tabular-nums">
                      {group.subtotal.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </React.Fragment>
              ))}
              {/* 合計行 */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={7} className="px-4 py-3 text-right text-base font-bold text-blue-900">
                  合計
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-blue-900 tabular-nums">
                  {result.totalAmount.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 計算日時 */}
      <p className="mt-4 text-xs text-gray-400 text-right">
        計算日時: {new Date(result.calculatedAt).toLocaleString('ja-JP')}
      </p>

      {/* 計算ログモーダル */}
      {logModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">計算ログ</h3>
              <button
                onClick={() => setLogModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <p className="text-xs text-gray-500">工事種別</p>
                <p className="font-medium text-gray-900">{logModal.item.workCategory}</p>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-500">細目工種名</p>
                <p className="font-medium text-gray-900">{logModal.item.detailName}</p>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-500">計算過程</p>
                <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {logModal.item.calculationLog}
                </pre>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">単価</p>
                  <p className="font-medium">{logModal.item.unitPrice.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">数量</p>
                  <p className="font-medium">{logModal.item.quantity} {logModal.item.unit}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-xs text-blue-600">金額</p>
                  <p className="font-bold text-blue-900">{logModal.item.detailAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
