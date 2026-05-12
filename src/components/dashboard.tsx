'use client';

import { useState } from 'react';
import { Header } from "@/components/header";
import { AssetCards } from "@/components/asset-cards";
import { MainChart } from "@/components/main-chart";
import { RecentTransactions } from "@/components/recent-transactions";

export function Dashboard() {
  // Shared state for all dashboard components
  const [filters, setFilters] = useState({
    type: 'monthly' as 'all' | 'monthly' | 'yearly' | 'daily',
    year: new Date().getFullYear().toString(),
    month: new Date().getMonth().toString(),
    date: new Date().toISOString().split('T')[0] // Important: Set initial date to today
  });

  return (
    <main className="flex-1 w-full max-w-400 mx-auto p-6 lg:p-10 flex flex-col gap-10">
      
      {/* Header updates the shared filters state */}
      <Header filters={filters} setFilters={setFilters} />
      
      {/* AssetCards correctly receiving all filters */}
      <AssetCards 
        filterType={filters.type} 
        selectedYear={filters.year} 
        selectedMonth={filters.month} 
        selectedDate={filters.date}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2">
          {/* FIX: Pass the full filters object so it detects year/month changes */}
          <MainChart filters={filters} />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions />
        </div>
      </div>
    </main>
  );
}