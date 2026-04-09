import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "実行予算書自動作成システム",
  description: "PDF図面から自動で数量拾い出しを行い、実行予算書を生成するシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">予</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">実行予算書自動作成</span>
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a href="/" className="text-sm text-gray-600 hover:text-gray-900">ダッシュボード</a>
                <a href="/projects/new" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  新規プロジェクト
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
