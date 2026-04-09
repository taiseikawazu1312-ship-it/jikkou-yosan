'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, FileUp, File, CheckCircle, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { getProject, saveProject, saveExtractedData } from '@/lib/storage';
import { Project } from '@/lib/types';

interface UploadedFile {
  file: File;
  type: string;
  preview?: string;
}

const drawingTypes = [
  { value: 'plan_summary', label: '計画概要書' },
  { value: 'floor_plan', label: '平面図' },
  { value: 'elevation', label: '立面図' },
  { value: 'fitting_schedule', label: '建具表' },
  { value: 'electrical', label: '電気設備図' },
  { value: 'color_match', label: '色合わせ表' },
];

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push('/');
      return;
    }
    setProject(p);
  }, [projectId, router]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const added: UploadedFile[] = Array.from(newFiles).map((file) => ({
      file,
      type: 'floor_plan',
    }));
    setFiles((prev) => [...prev, ...added]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileType = (index: number, type: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, type } : f))
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      alert('ファイルをアップロードしてください。');
      return;
    }

    setAnalyzing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      files.forEach((f, i) => {
        formData.append(`file_${i}`, f.file);
        formData.append(`type_${i}`, f.type);
      });
      formData.append('fileCount', files.length.toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        throw new Error('解析に失敗しました');
      }

      const data = await res.json();
      saveExtractedData(data.extractedData);

      if (project) {
        const updated = { ...project, status: 'uploaded' as const, updatedAt: new Date().toISOString() };
        saveProject(updated);
        setProject(updated);
      }

      setProgress(100);
      setAnalysisComplete(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '解析中にエラーが発生しました');
      setProgress(0);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.push(`/projects/${projectId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        プロジェクトに戻る
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Upload className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">図面アップロード</h1>
          <p className="text-sm text-gray-500">{project.code} - {project.name}</p>
        </div>
      </div>

      {/* ドラッグ&ドロップエリア */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <FileUp className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600 mb-2">
          ファイルをドラッグ&ドロップ、または
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          ファイルを選択
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-3">PDF, PNG, JPG (各20MBまで)</p>
      </div>

      {/* ファイルリスト */}
      {files.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <File className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{f.file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(f.file.size)}</p>
              </div>
              <select
                value={f.type}
                onChange={(e) => updateFileType(i, e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {drawingTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeFile(i)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 進捗バー */}
      {(analyzing || analysisComplete) && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            {analyzing ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {analyzing ? 'AI解析中...' : '解析完了'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                analysisComplete ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{progress}% 完了</p>
        </div>
      )}

      {/* アクションボタン */}
      <div className="mt-6 flex justify-end gap-3">
        {analysisComplete ? (
          <button
            onClick={() => router.push(`/projects/${projectId}/exterior-wall`)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            外壁面積算出へ進む
          </button>
        ) : (
          <button
            onClick={handleAnalyze}
            disabled={analyzing || files.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {analyzing ? '解析中...' : 'AI解析を実行'}
          </button>
        )}
      </div>
    </div>
  );
}
