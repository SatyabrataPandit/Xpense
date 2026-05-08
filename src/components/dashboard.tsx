'use client';

import { Header } from "@/components/header";
import { AssetCards } from "@/components/asset-cards";
import { MainChart } from "@/components/main-chart";
import { RecentTransactions } from "@/components/recent-transactions";

export function Dashboard() {
  return (
    <main className="flex-1 w-full max-w-400 mx-auto p-6 lg:p-10 flex flex-col gap-10">
      
      {/* Top Section: Welcome & Actions */}
      <Header />
      
      {/* Middle Section: Financial Summary Cards */}
      <AssetCards />

      {/* Bottom Section: Chart and Activity List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2">
          <MainChart />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions />
        </div>
      </div>

    </main>
  );
}