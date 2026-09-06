"use client";

import { ProfileStoreProvider } from "@/lib/prototype-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ProfileStoreProvider>{children}</ProfileStoreProvider>;
}
