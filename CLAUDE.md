# jikkou-yosan — 実行予算管理システム

> 建設プロジェクトの実行予算を分析・管理するWebアプリ。
> Excel実行予算ファイルをアップロード → Claude AIで内容を解析 → 予算データの可視化・Excel出力。

---

## 技術スタック

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **AI:** Claude API (@anthropic-ai/sdk) — 予算書解析
- **Excel:** ExcelJS（読み込み・出力）
- **アイコン:** Lucide React

## プロジェクト構造

```
src/
  app/
    page.tsx                        # メイン画面
    api/
      analyze/route.ts              # Excel→AI解析
      analyze-wall/                  # 壁面分析（特化）
      export/route.ts               # 解析結果→Excel出力
  components/
    budget/                         # 予算管理UIコンポーネント
    ui/                             # 共通UIコンポーネント
  lib/
    calc-engine/                    # 計算エンジン
    data/                           # データ定義
    storage.ts                      # ストレージ管理
    types.ts                        # 型定義
public/
  demo/                             # デモファイル
```

## APIエンドポイント

| パス | 内容 |
|---|---|
| `/api/analyze` | Excelファイル解析（Claude AI） |
| `/api/analyze-wall` | 壁面積分析（特化API） |
| `/api/export` | 解析結果のExcel出力 |

## 開発コマンド

```bash
npm run dev / npm run build / npm run lint
```

## 環境変数

```
ANTHROPIC_API_KEY=...
```

## 関連情報

- **対象:** 建設プロジェクトの実行予算管理
