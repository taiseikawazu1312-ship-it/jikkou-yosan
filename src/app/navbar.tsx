'use client';

import { useSession, signOut } from 'next-auth/react';
import { Zap, LogOut, User } from 'lucide-react';

export function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-300" />
              </div>
              <span className="font-bold text-base text-gray-900">BLUEESTIMATE</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">ダッシュボード</a>
            <a href="/estimate/new" className="text-sm text-blue-600 hover:text-blue-700 font-medium">概算見積もり</a>
            <a href="/settings/historical-data" className="text-sm text-gray-600 hover:text-gray-900">過去データ</a>
            {session?.user ? (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  <span>{session.user.name}</span>
                  <span className="text-gray-300">|</span>
                  <span>{(session.user as any).companyName}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="ログアウト"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a href="/login" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">
                ログイン
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
