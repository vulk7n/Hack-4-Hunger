
'use client';

import { DeliveryHeader } from "@/components/layout/delivery-header";
import { DeliveryProvider } from "@/contexts/delivery-context";
import React from "react";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeliveryProvider>
      <div className="flex flex-col min-h-screen">
        <DeliveryHeader />
        <main className="flex-1 mt-24 mb-24 md:mb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </DeliveryProvider>
  );
}
