'use client';

import { useState } from 'react';
import {
  Zap, Clock, Users, TrendingUp, Upload, Brain, FileText,
  CheckCircle, ArrowRight, Building2, ChevronDown, ChevronUp,
  Sparkles, Shield, BarChart3, Smartphone, Database,
  Star, MessageCircle, ArrowDown,
} from 'lucide-react';

/* ============================
   FAQ アコーディオン
   ============================ */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-base font-medium text-gray-900">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && <p className="pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

/* ============================
   メインLP
   ============================ */
export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* ===== ヘッダー ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-300" />
            </div>
            <span className="font-bold text-lg text-gray-900">BLUEESTIMATE</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#problem" className="hover:text-gray-900">課題</a>
            <a href="#solution" className="hover:text-gray-900">解決策</a>
            <a href="#flow" className="hover:text-gray-900">使い方</a>
            <a href="#comparison" className="hover:text-gray-900">他社比較</a>
            <a href="#pricing" className="hover:text-gray-900">料金</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">ログイン</a>
            <a href="#cta" className="text-sm bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              無料で試す
            </a>
          </div>
        </div>
      </header>

      {/* ===== ヒーロー ===== */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                住宅営業のための概算見積もりシステム
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                初回商談で、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  「いくらですか？」に<br />即答できる。
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                坪数と仕様を選ぶだけで、自社の過去実績に基づく概算見積書を即座に生成。
                図面があればAI解析でさらに精度アップ。商談のスピードが変わります。
              </p>

              {/* 価値訴求（検証可能な表現に変更） */}
              <div className="mt-8 flex gap-8">
                <div>
                  <p className="text-3xl font-black text-blue-600">1<span className="text-lg">分</span></p>
                  <p className="text-xs text-gray-500 mt-1">概算見積もり作成</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">0<span className="text-lg">枚</span></p>
                  <p className="text-xs text-gray-500 mt-1">必要な図面</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">根拠<span className="text-lg">付き</span></p>
                  <p className="text-xs text-gray-500 mt-1">過去実績ベースの単価</p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="/estimate/new"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-base shadow-lg shadow-blue-200 hover:shadow-xl"
                >
                  <Zap className="w-5 h-5" />
                  無料でデモを試す
                </a>
                <a
                  href="mailto:info@aitechworld.info?subject=BLUEESTIMATE資料請求"
                  className="inline-flex items-center gap-2 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  <FileText className="w-5 h-5" />
                  資料請求
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-400">アカウント登録不要でデモ体験可能</p>
            </div>

            {/* ヒーロー画像 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-2xl text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium text-blue-200">概算見積書</span>
                  <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">自社実績ベース</span>
                </div>
                <h3 className="text-lg font-bold">山田様邸 — 木造2階建て 35坪</h3>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-200">概算総額</p>
                    <p className="text-2xl font-black">2,680<span className="text-sm">万円</span></p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-200">坪単価</p>
                    <p className="text-2xl font-black">76.6<span className="text-sm">万円</span></p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-200">本体工事</p>
                    <p className="text-2xl font-black">2,180<span className="text-sm">万円</span></p>
                  </div>
                </div>
                <div className="mt-4 flex rounded-full overflow-hidden h-3">
                  <div className="bg-blue-400 w-[72%]" /><div className="bg-emerald-400 w-[18%]" /><div className="bg-amber-400 w-[10%]" />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-blue-200">
                  <span>本体工事 72%</span><span>付帯工事 18%</span><span>諸費用 10%</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg rotate-3">
                図面なしでOK!
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-lg text-xs text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                PDF / 印刷 対応
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 課題提起（課題→解決を1対1で対応） ===== */}
      <section id="problem" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">住宅営業の「見積もり」に<br className="sm:hidden" />こんな課題はありませんか？</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                icon: Clock, color: 'red',
                problem: '初回商談で「だいたいいくら？」に答えられない',
                detail: '設計にプラン依頼→数日〜1週間後に概算提示。その間に競合が先に金額を出し、顧客が流れる。',
                solution: '坪数と仕様を入力するだけで、その場で概算見積もりを提示。',
                solutionLabel: '図面なし即時概算',
              },
              {
                icon: Users, color: 'red',
                problem: '見積り作成がベテランの勘と経験に依存',
                detail: '新人は「坪○万円くらい」としか言えない。先輩ごとに金額がバラつき、組織として品質が安定しない。',
                solution: '過去の全見積りデータを蓄積。誰が作っても同じ根拠・同じ精度。',
                solutionLabel: '過去実績DB',
              },
              {
                icon: TrendingUp, color: 'red',
                problem: '概算と最終金額が20〜30%もズレる',
                detail: '「坪65万円」と言ったのに蓋を開けたら坪85万円。付帯工事・諸費用の見積り漏れが原因。',
                solution: '本体工事・付帯工事・諸費用を分けて金額レンジ付きで提示。乖離リスクを最初から明示。',
                solutionLabel: '3区分レンジ表示',
              },
              {
                icon: Database, color: 'red',
                problem: '過去の類似案件を探すのに1時間かかる',
                detail: '「35坪の木造2階建てはいくらだった？」を調べるのに、過去のExcelを掘り返す作業。',
                solution: 'AI類似検索で条件に合う過去案件を自動表示。類似度スコア付き。',
                solutionLabel: 'AI類似案件検索',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* 課題側 */}
                  <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-xs font-medium text-red-500 uppercase">課題</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.problem}</h3>
                    <p className="text-sm text-gray-500">{item.detail}</p>
                  </div>
                  {/* 解決策側 */}
                  <div className="p-6 bg-blue-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-xs font-medium text-green-600 uppercase">解決</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">{item.solutionLabel}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 解決策: 商談フェーズに合わせた2つのモード ===== */}
      <section id="solution" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900">商談の進行に合わせて、<br />見積もりの精度が上がる</h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              BLUEESTIMATEは「図面なし」でも「図面あり」でも使えます。
              商談初期はスピード重視の概算、プラン確定後は図面解析で精度を向上。
              どちらのモードでも、過去実績データが単価の根拠を支えます。
            </p>
          </div>

          {/* 2モード比較 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* モード1 */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 relative">
              <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">初回〜2回目の商談</div>
              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">スピードモード</h3>
                  <p className="text-sm text-gray-500">図面なし — 基本情報だけで概算</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-sm text-gray-700">坪数・建物タイプ・仕様グレードを入力</span>
                  <span className="ml-auto text-xs text-gray-400">30秒</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-sm text-gray-700">過去実績から推奨単価を自動算出</span>
                  <span className="ml-auto text-xs text-gray-400">即時</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-sm text-gray-700">概算見積書をPDF出力</span>
                  <span className="ml-auto text-xs text-gray-400">10秒</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600 mb-1">合計所要時間</p>
                <p className="text-2xl font-black text-blue-700">約1分</p>
              </div>
              <ul className="mt-6 space-y-2">
                {['展示会のその場で概算を提示', '松竹梅プランの金額比較', '仕様変更時の差額を即座に表示'].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>

            {/* モード2 */}
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-8 relative">
              <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">プラン提案後</div>
              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">精度アップモード</h3>
                  <p className="text-sm text-gray-500">図面あり — AI解析で数量を自動抽出</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-sm text-gray-700">平面図・立面図PDFをアップロード</span>
                  <span className="ml-auto text-xs text-gray-400">10秒</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-sm text-gray-700">AIが面積・外壁・屋根等93項目を自動算出</span>
                  <span className="ml-auto text-xs text-gray-400">30秒</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-sm text-gray-700">実数量 × 過去実績単価で高精度な概算</span>
                  <span className="ml-auto text-xs text-gray-400">即時</span>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg text-center">
                <p className="text-xs text-indigo-600 mb-1">合計所要時間</p>
                <p className="text-2xl font-black text-indigo-700">約3分</p>
              </div>
              <ul className="mt-6 space-y-2">
                {['坪単価方式より精度の高い見積もり', '数量の根拠を顧客に提示できる', 'そのまま詳細見積りへ引き継ぎ可能'].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 共通基盤: 過去実績DB */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">両モード共通の基盤</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">自社の過去見積りデータが、概算の根拠になる</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  過去のExcel見積りデータをインポートすると、新規案件の条件に合う類似案件を自動検索。
                  「この金額は、過去○件の類似案件の実績に基づいています」— 営業マンが自信を持って顧客に説明できます。
                  データが蓄積されるほど、推奨単価の精度が向上します。
                </p>
              </div>
              <div className="w-full md:w-72 bg-white rounded-xl p-4 border border-purple-100 flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2">類似案件検索結果</p>
                {[
                  { name: 'A邸 35坪', price: '2,800万', score: 92 },
                  { name: 'B邸 33坪', price: '2,640万', score: 87 },
                  { name: 'C邸 38坪', price: '3,040万', score: 81 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-700 flex-1">{item.name}</span>
                    <span className="text-xs font-bold text-blue-700">{item.price}</span>
                    <div className="w-10">
                      <div className="w-full bg-gray-200 rounded-full h-1"><div className="bg-purple-500 h-1 rounded-full" style={{ width: `${item.score}%` }} /></div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-purple-600 font-medium mt-2 text-center">推奨坪単価: 76〜82万円</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 商談フロー全体像 ===== */}
      <section id="flow" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900">商談フローの中での活用イメージ</h2>
            <p className="mt-3 text-gray-500">商談の進行に合わせて、BLUEESTIMATEの役割も変化します</p>
          </div>
          <div className="space-y-4">
            {[
              { phase: '初回接客（展示場）', mode: 'スピードモード', action: '「35坪の2階建てなら、2,500〜3,000万円くらいです」とタブレットで即提示', time: '1分', color: 'blue' },
              { phase: 'プラン提案（1〜2週間後）', mode: '精度アップモード', action: 'プラン図面をアップロード → AI解析で93項目の数量を抽出 → より正確な概算を提示', time: '3分', color: 'indigo' },
              { phase: '仕様打合せ（2〜4週間後）', mode: 'スピードモード', action: '「屋根をグラッサにすると+30万円」「キッチンをグレードアップすると+50万円」を即回答', time: '10秒', color: 'blue' },
              { phase: '詳細見積り（1〜2ヶ月後）', mode: '詳細モード', action: '概算の数量データをそのまま引き継ぎ → 積算担当が詳細見積りに発展（二重作業なし）', time: '—', color: 'gray' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full bg-${item.color}-100 text-${item.color}-700 flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {i + 1}
                  </div>
                  {i < 3 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{item.phase}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-${item.color}-100 text-${item.color}-700`}>{item.mode}</span>
                    {item.time !== '—' && <span className="ml-auto text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>}
                  </div>
                  <p className="text-sm text-gray-600">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 他社比較 ===== */}
      <section id="comparison" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">既存の方法との違い</h2>
            <p className="mt-3 text-gray-500">BLUEESTIMATEは「営業マンが初回商談で使える」唯一のツールです</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-4 bg-gray-50 border-b-2 border-gray-200"></th>
                  <th className="px-4 py-4 bg-blue-600 text-white font-bold text-center rounded-t-lg">BLUEESTIMATE</th>
                  <th className="px-4 py-4 bg-gray-50 border-b-2 border-gray-200 text-center font-medium text-gray-600">ARCHITREND ONE<br /><span className="text-xs font-normal">積算オプション</span></th>
                  <th className="px-4 py-4 bg-gray-50 border-b-2 border-gray-200 text-center font-medium text-gray-600">AnyONE</th>
                  <th className="px-4 py-4 bg-gray-50 border-b-2 border-gray-200 text-center font-medium text-gray-600">Excel手作業</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['図面なしで概算見積もり', '対応', 'CADデータ必要', 'テンプレート手修正', '坪単価×面積のみ'],
                  ['概算作成の所要時間', '約1分', '約5分', '1〜2時間', '半日〜1日'],
                  ['過去実績から自動で単価提案', '対応', '手動設定', '手動検索', '手動検索'],
                  ['図面AI解析（オプション）', '対応', '非対応', '非対応', '非対応'],
                  ['CADソフトが必要か', '不要', '必要', '不要', '不要'],
                  ['営業マンが操作可能か', '可能', '要トレーニング', '可能', '属人的'],
                  ['金額レンジ（下限〜上限）表示', '対応', '対応', '非対応', '非対応'],
                  ['月額費用', '49,800円〜', '15,000円〜', '要問合せ', '0円（人件費は大）'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row[0]}</td>
                    <td className="px-4 py-3 text-center font-medium text-blue-700 bg-blue-50/30">{row[1]}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row[2]}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row[3]}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-400 text-right">※ 各製品の公開情報に基づく比較です（2026年4月時点）</p>
        </div>
      </section>

      {/* ===== ROI・価格妥当性 ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">投資対効果</h2>
            <p className="mt-3 text-gray-500">見積もり作成にかかる「見えないコスト」を可視化</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> 現状のコスト（月間）</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">見積り作成: 月20時間 × 営業5名</span><span className="font-bold">100時間</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">時給換算（@3,000円）</span><span className="font-bold text-red-600">30万円/月</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">見積り遅延による機会損失（推定）</span><span className="font-bold text-red-600">2〜3件/月</span></div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-green-600 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> 導入後の効果（月間）</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">見積り作成時間の削減</span><span className="font-bold text-green-600">約80時間削減</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">人件費削減効果</span><span className="font-bold text-green-600">約24万円/月</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">BLUEESTIMATE利用料</span><span className="font-bold">4.98万円/月</span></div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-3"><span className="text-gray-900 font-bold">実質効果</span><span className="font-black text-green-600 text-lg">+19万円/月</span></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-6">※ 営業5名体制、1人あたり月20時間の見積り作成を想定した試算です</p>
          </div>
        </div>
      </section>

      {/* ===== 料金 ===== */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">料金プラン</h2>
            <p className="mt-3 text-gray-500">まずは無料トライアルでお試しください</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'トライアル', price: '無料', period: '30日間', highlight: false,
                features: ['ユーザー3名まで', '概算見積もり 月10件', '図面AI解析 月5件', 'PDF出力', 'デモ用過去データ付き'],
              },
              {
                name: 'スターター', price: '49,800', period: '円/月（税抜）', highlight: true,
                features: ['ユーザー5名まで', '概算見積もり 月50件', '図面AI解析 月30件', '過去データインポート', '類似案件検索', 'PDF / Excel出力', 'メールサポート'],
              },
              {
                name: 'プロフェッショナル', price: '98,000', period: '円/月（税抜）', highlight: false,
                features: ['ユーザー20名まで', '概算見積もり 無制限', '図面AI解析 無制限', '過去データ無制限', '松竹梅プラン比較', '見積り精度レポート', '優先サポート'],
              },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 relative ${plan.highlight ? 'border-blue-500 bg-blue-50/30 shadow-xl' : 'border-gray-200 bg-white'}`}>
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">おすすめ</div>}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <a href="/estimate/new" className={`mt-8 block text-center py-3 rounded-lg font-medium text-sm transition-colors ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {plan.price === '無料' ? '無料で始める' : 'トライアルから始める'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">よくある質問</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 px-8">
            <FAQ q="図面がなくても使えますか？" a="はい。「スピードモード」では、坪数・建物タイプ・仕様グレードの3項目で概算見積もりを作成できます。図面がある場合は「精度アップモード」でAI解析による高精度な見積もりも可能です。" />
            <FAQ q="過去の見積りデータはどうやって取り込みますか？" a="Excelファイル（.xlsx）から一括インポートできます。工事種別・単価・数量・金額等の列を画面上でマッピングするだけで取り込めます。" />
            <FAQ q="CADソフト（ARCHITRENDなど）は必要ですか？" a="不要です。BLUEESTIMATEはブラウザだけで動作します。図面はPDFとしてアップロードするだけなので、CADの操作スキルは一切必要ありません。" />
            <FAQ q="見積りの精度はどの程度ですか？" a="過去データの蓄積量と、スピードモード/精度アップモードによって異なります。スピードモードは坪単価ベースの概算、精度アップモードは実数量ベースのより正確な概算です。いずれも金額レンジ（下限〜上限）を表示し、不確実性を明示します。" />
            <FAQ q="他社のデータを見られることはありますか？" a="ありません。企業ごとにデータは完全に分離されています（マルチテナント方式）。" />
            <FAQ q="解約はいつでもできますか？" a="はい。月額制で、いつでも解約可能です。解約後もデータは30日間保持されます。" />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="cta" className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="w-12 h-12 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">
            まずは、デモで体感してください
          </h2>
          <p className="text-blue-200 mb-8">
            アカウント登録不要。いますぐ概算見積もりの速さを体験できます。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/estimate/new" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all font-bold text-base shadow-lg">
              <Zap className="w-5 h-5" /> 無料デモを試す
            </a>
            <a href="mailto:info@aitechworld.info?subject=BLUEESTIMATE資料請求" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 text-white rounded-xl hover:bg-white/10 transition-all font-medium">
              資料請求・お問い合わせ
            </a>
          </div>
        </div>
      </section>

      {/* ===== フッター ===== */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-300" />
                </div>
                <span className="font-bold text-white">BLUEESTIMATE</span>
              </div>
              <p className="text-sm text-gray-400">住宅営業のための<br />概算見積もり自動算出システム</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-3">プロダクト</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#solution" className="hover:text-white">機能紹介</a></li>
                <li><a href="#pricing" className="hover:text-white">料金プラン</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="/estimate/new" className="hover:text-white">無料デモ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-3">運営会社</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>株式会社AITech</li>
                <li><a href="https://sekkei-hub.com" className="hover:text-white">設計HUB（メディア）</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-3">お問い合わせ</h4>
              <p className="text-sm text-gray-400">info@aitechworld.info</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            &copy; 2026 株式会社AITech. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
