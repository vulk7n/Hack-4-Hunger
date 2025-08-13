
'use client';

import { Header } from "@/components/layout/header";
import { ProfileProvider } from "@/contexts/profile-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mt-24 mb-24 md:mb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProfileProvider>
  );
}
