'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { migrateStorageIfNeeded } from '@/lib/storage';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    migrateStorageIfNeeded();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
