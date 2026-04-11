'use client';

import { useState } from 'react';
import {
  Zap, Clock, Users, TrendingUp, Upload, Brain, FileText,
  CheckCircle, ArrowRight, Building2, ChevronDown, ChevronUp,
  Sparkles, Shield, BarChart3, Smartphone, Database,
  Star, MessageCircle, Play, X,
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
  const [showVideo, setShowVideo] = useState(false);

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
            <a href="#features" className="hover:text-gray-900">機能</a>
            <a href="#flow" className="hover:text-gray-900">使い方</a>
            <a href="#comparison" className="hover:text-gray-900">他社比較</a>
            <a href="#pricing" className="hover:text-gray-900">料金</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">ログイン</a>
            <a href="#cta" className="text-sm bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              無料で試す
            </a>
          </div>
        </div>
      </header>

      {/* ===== ヒーローセクション ===== */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                住宅営業のための概算見積もりAI
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                図面がなくても、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  30秒で概算見積もり。
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                坪数と仕様を入力するだけで、過去実績に基づく概算見積書を即座に生成。
                初回商談で「だいたいいくら？」に自信を持って答えられます。
              </p>

              {/* 実績数字 */}
              <div className="mt-8 flex gap-8">
                <div>
                  <p className="text-3xl font-black text-blue-600">80<span className="text-lg">%</span></p>
                  <p className="text-xs text-gray-500 mt-1">見積り作成時間削減</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">30<span className="text-lg">秒</span></p>
                  <p className="text-xs text-gray-500 mt-1">概算見積もり算出</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">±10<span className="text-lg">%</span></p>
                  <p className="text-xs text-gray-500 mt-1">概算精度（実績比）</p>
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
                <button
                  onClick={() => setShowVideo(true)}
                  className="inline-flex items-center gap-2 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  <Play className="w-5 h-5" />
                  3分でわかる動画
                </button>
              </div>
              <p className="mt-4 text-xs text-gray-400">クレジットカード不要 ・ 30日間無料トライアル</p>
            </div>

            {/* ヒーロー画像（プロダクトスクリーンショット風） */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-2xl text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-medium text-blue-200">概算見積書</span>
                  <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">過去24件の実績</span>
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
              {/* フローティングバッジ */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg rotate-3">
                図面なしでOK!
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-lg text-xs text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                PDF出力 対応
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 課題提起セクション ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">こんな課題、ありませんか？</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Clock, title: '初回商談で金額を聞かれるが、答えられない', desc: '「見積もりは後日お送りします」→ 1週間後。その間に競合が先に金額を出している。' },
              { icon: Users, title: '見積り作成がベテラン頼み', desc: '新人は先輩に聞くか設計に丸投げ。ナレッジが属人化し、退職で失われる。' },
              { icon: TrendingUp, title: '概算と最終金額の乖離が大きい', desc: '「坪○万円」と言ったのに、最終的に20〜30%アップ。顧客の不信感につながる。' },
              { icon: Database, title: '過去の見積りデータが活用できない', desc: '「あの案件いくらだっけ？」を調べるのに1時間。Excelが個人のPCに散在。' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-lg">
              <ArrowRight className="w-5 h-5" />
              BLUEESTIMATEが、すべて解決します
            </div>
          </div>
        </div>
      </section>

      {/* ===== 機能セクション ===== */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900">3つのコア機能</h2>
            <p className="mt-3 text-gray-500">営業マンが、商談の場で使えるように設計</p>
          </div>

          {/* 機能1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">01</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">図面なしで30秒概算</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                坪数・建物タイプ・仕様グレードの3つを入力するだけ。
                図面がない初回商談でも、過去実績に基づく概算見積もりを即座に提示できます。
              </p>
              <ul className="space-y-3">
                {['スライダーで坪数を直感的に入力', '松竹梅プランをワンタップで切替', '金額レンジ付きで不確実性を透明化', 'PDF出力で顧客にその場で手渡し'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-100">
                  <span className="text-sm text-gray-600">延床面積</span>
                  <div><span className="text-2xl font-black text-gray-900">35</span><span className="text-sm text-gray-500 ml-1">坪</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center text-xs text-gray-500">平屋</div>
                  <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-500 text-center text-xs font-bold text-blue-700">2階建て</div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center text-xs text-gray-500">3階建て</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center text-xs">スタンダード</div>
                  <div className="bg-indigo-50 rounded-lg p-3 border-2 border-indigo-500 text-center text-xs font-bold text-indigo-700">ハイグレード</div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center text-xs">プレミアム</div>
                </div>
                <div className="bg-blue-600 text-white rounded-lg p-3 text-center font-bold text-sm flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-300" /> 概算見積もりを算出
                </div>
              </div>
            </div>
          </div>

          {/* 機能2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="space-y-2">
                {[
                  { name: 'A邸 木造2階 35坪', price: '2,800万', score: 92 },
                  { name: 'B邸 木造2階 33坪', price: '2,640万', score: 87 },
                  { name: 'C邸 木造2階 38坪', price: '3,040万', score: 81 },
                  { name: 'D邸 木造2階 32坪', price: '2,560万', score: 76 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-100">
                    <span className="text-sm font-medium text-gray-900 flex-1">{item.name}</span>
                    <span className="text-sm font-bold text-blue-700 tabular-nums">{item.price}</span>
                    <div className="w-16">
                      <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${item.score}%` }} /></div>
                      <span className="text-xs text-gray-400">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-purple-50 rounded-lg text-center">
                <span className="text-xs text-purple-600">推奨坪単価: </span>
                <span className="text-lg font-black text-purple-700">76〜82万円/坪</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4">02</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">過去実績から自動で単価提案</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                自社の過去見積りデータをExcelからインポート。
                新規案件の条件で類似案件を自動検索し、実績に基づく推奨単価を提案します。
                「この金額は過去24件の実績から算出」— 顧客への説得力が段違いです。
              </p>
              <ul className="space-y-3">
                {['Excel一括インポートで過去データを蓄積', 'AI類似度スコアで最適な参考案件を自動選定', '外れ値を除外した信頼性の高い推奨単価', '使うほど精度が向上するフィードバックループ'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 機能3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4">03</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">AI図面解析で数量を自動抽出</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                図面PDFをアップロードすると、AIが床面積・外壁面積・屋根面積など93項目を自動算出。
                「坪単価方式」から「数量積算方式」にグレードアップし、見積りの根拠が強化されます。
              </p>
              <ul className="space-y-3">
                {['平面図から床面積・部屋面積を自動検出', '立面図から外壁・屋根・開口部を算出', '住友林業基本数量表（93項目）準拠', '手動修正も可能 — AIと人間のハイブリッド'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">平面図.pdf をアップロード...</span>
              </div>
              <div className="space-y-2">
                {[
                  { item: '延床面積', value: '120.89㎡', badge: '平面図' },
                  { item: '外壁実面積', value: '148.92㎡', badge: '立面図' },
                  { item: '屋根面積', value: '86.32㎡', badge: '立面図' },
                  { item: '開口部面積', value: '26.66㎡', badge: '立面図' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-900">{r.item}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">{r.value}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{r.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 text-center">93項目中 71項目をAIが自動算出</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 使い方フロー ===== */}
      <section id="flow" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900">カンタン3ステップ</h2>
            <p className="mt-3 text-gray-500">図面がなくても、商談中に概算見積もりを提示</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Building2, title: '基本情報を入力', desc: '坪数・建物タイプ・仕様グレードを入力。スライダーで直感的に操作。', time: '30秒' },
              { step: '02', icon: Brain, title: 'AIが自動算出', desc: '過去実績DBから類似案件を検索し、推奨単価を自動適用。工種別内訳を生成。', time: '即時' },
              { step: '03', icon: FileText, title: 'PDF見積書を出力', desc: '顧客名・日付入りの概算見積書をPDF出力。メール送信やタブレット提示に。', time: '10秒' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-200 text-center relative">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-black">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                  <Clock className="w-3 h-3" /> {item.time}
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
            <h2 className="text-3xl font-black text-gray-900">他社ツールとの比較</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-4 bg-gray-50 border-b-2 border-gray-200 font-medium text-gray-600"></th>
                  <th className="px-4 py-4 bg-blue-600 text-white font-bold text-center rounded-t-lg border-b-2 border-blue-600">BLUEESTIMATE</th>
                  <th className="px-4 py-4 bg-gray-50 border-b-2 border-gray-200 text-center font-medium text-gray-600">ARCHITREND ONE<br /><span className="text-xs font-normal">積算オプション</span></th>
                  <th className="px-4 py-4 bg-gray-50 border-b-2 border-gray-200 text-center font-medium text-gray-600">AnyONE</th>
                  <th className="px-4 py-4 bg-gray-50 border-b-2 border-gray-200 text-center font-medium text-gray-600">Excel<br /><span className="text-xs font-normal">手作業</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['図面なしで概算', '◎', '×', '△', '△'],
                  ['概算見積もり時間', '30秒', '5分', '1〜2時間', '半日〜1日'],
                  ['過去実績から自動単価', '◎', '×', '×', '×'],
                  ['AI図面解析', '◎', '×', '×', '×'],
                  ['CAD不要', '◎', '×（CADデータ必要）', '◎', '◎'],
                  ['営業マンが操作', '◎', '△', '◎', '△'],
                  ['松竹梅プラン比較', '◎', '◎', '×', '手動'],
                  ['PDF見積書出力', '◎', '◎', '◎', '手動'],
                  ['月額料金', '49,800円〜', '15,000円〜', '要問合せ', '0円'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{row[0]}</td>
                    <td className={`px-4 py-3 text-center font-bold ${row[1].includes('◎') ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700 bg-blue-50/30'}`}>{row[1]}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row[2]}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row[3]}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== お客様の声 ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">導入企業の声</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '田中健太 様', role: '○○ホーム 営業主任', text: '展示会で「いくらくらい？」と聞かれた時、その場で概算を見せられるようになりました。以前は「後日お送りします」だったので、明らかにお客様の反応が違います。', stars: 5 },
              { name: '佐藤美咲 様', role: '△△建設 営業部長', text: '新人でもベテランと同じレベルの概算が出せるのが一番の価値。過去の実績データを入れるほど精度が上がるので、チーム全体の見積り品質が標準化されました。', stars: 5 },
              { name: '鈴木大輔 様', role: '□□工務店 代表', text: '坪単価だけで答えていた時代から、工種別の内訳を見せながら説明できるようになった。「なぜこの金額なのか」を説明できると、お客様の信頼感が全然違う。', stars: 5 },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-0.5 mb-3">
                  {Array(v.stars).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{`「${v.text}」`}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">※ お客様の声はイメージです</p>
        </div>
      </section>

      {/* ===== 料金 ===== */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">料金プラン</h2>
            <p className="mt-3 text-gray-500">30日間の無料トライアルで、まずはお試しください</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'トライアル', price: '無料', period: '30日間', highlight: false,
                features: ['ユーザー3名まで', '概算見積もり 月10件', '図面AI解析 月5件', 'PDF出力'],
              },
              {
                name: 'スターター', price: '49,800', period: '円/月（税抜）', highlight: true,
                features: ['ユーザー5名まで', '概算見積もり 月50件', '図面AI解析 月30件', '過去データ100件インポート', '類似案件検索', 'PDF/Excel出力', 'メールサポート'],
              },
              {
                name: 'プロフェッショナル', price: '98,000', period: '円/月（税抜）', highlight: false,
                features: ['ユーザー20名まで', '概算見積もり 無制限', '図面AI解析 無制限', '過去データ無制限', '松竹梅プラン比較', '見積り精度レポート', 'API連携', '優先サポート'],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 border-2 relative ${
                  plan.highlight
                    ? 'border-blue-500 bg-blue-50/30 shadow-xl'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    おすすめ
                  </div>
                )}
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
                <a
                  href="/estimate/new"
                  className={`mt-8 block text-center py-3 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === '無料' ? '無料で始める' : '30日無料トライアル'}
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
            <FAQ q="図面がなくても使えますか？" a="はい。坪数・建物タイプ・仕様グレードの3項目だけで概算見積もりを作成できます。図面がある場合は、PDFをアップロードすることでAIが数量を自動抽出し、より精度の高い見積もりを生成します。" />
            <FAQ q="過去の見積りデータはどうやって取り込みますか？" a="Excelファイル（.xlsx）を一括インポートする機能があります。工事種別・単価・数量・金額・坪数・地域等の列を自動マッピングします。初回導入時は弊社スタッフがインポートをサポートします。" />
            <FAQ q="見積りの精度はどの程度ですか？" a="過去データの蓄積量によりますが、類似案件が20件以上ある場合は±10%程度の精度を目指しています。概算見積りには必ず金額レンジ（下限〜上限）が表示され、不確実性を明示します。" />
            <FAQ q="他社のデータを見られることはありますか？" a="ありません。企業ごとにデータは完全に分離されており（マルチテナント方式）、他社のデータにアクセスすることは技術的に不可能です。" />
            <FAQ q="ARCHITREND等のCADソフトとの連携はできますか？" a="現時点ではCADソフトとの直接連携はありませんが、図面をPDFとして出力していただければAI解析で数量を抽出できます。今後、主要CADソフトとのデータ連携を予定しています。" />
            <FAQ q="解約はいつでもできますか？" a="はい。月額制で、いつでも解約可能です。解約後もデータは30日間保持され、その間にエクスポートが可能です。" />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="cta" className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="w-12 h-12 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">
            今すぐ、概算見積もりの<br />スピードを体感してください
          </h2>
          <p className="text-blue-200 mb-8">
            30日間無料。クレジットカード不要。1分で始められます。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/estimate/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all font-bold text-base shadow-lg"
            >
              <Zap className="w-5 h-5" />
              無料デモを試す
            </a>
            <a
              href="mailto:info@aitechworld.info"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
            >
              お問い合わせ
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
              <p className="text-sm text-gray-400">建築図面AI解析 × 過去実績データで<br />概算見積もりを即座に算出</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-3">プロダクト</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">機能</a></li>
                <li><a href="#pricing" className="hover:text-white">料金プラン</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="/estimate/new" className="hover:text-white">無料デモ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-3">会社情報</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://aitechworld.info" className="hover:text-white">株式会社AITech</a></li>
                <li><a href="https://sekkei-hub.com" className="hover:text-white">設計HUB</a></li>
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

      {/* 動画モーダル（プレースホルダー） */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowVideo(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowVideo(false)} className="absolute top-4 right-4 text-white"><X className="w-6 h-6" /></button>
            <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">デモ動画（準備中）</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
