'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Wallet, Landmark, TrendingUp, CircleDollarSign } from "lucide-react";

interface Transaction {
    amount: number;
    accountType: 'wallet' | 'bank' | 'investment';
    direction: 'in' | 'out';
    date: Timestamp;
}

interface AssetCardsProps {
    filterType: 'all' | 'monthly' | 'yearly' | 'daily'; // Added 'daily'
    selectedYear: string;
    selectedMonth: string;
    selectedDate: string; // Added selectedDate (YYYY-MM-DD)
}

export function AssetCards({ filterType, selectedYear, selectedMonth, selectedDate }: AssetCardsProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authUnsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(collection(db, 'users', user.uid, 'transactions'));
                const unsub = onSnapshot(q, (snapshot) => {
                    const txs = snapshot.docs.map(doc => doc.data() as Transaction);
                    setTransactions(txs);
                    setLoading(false);
                });
                return () => unsub();
            } else {
                setLoading(false);
            }
        });
        return () => authUnsub();
    }, []);

    const stats = useMemo(() => {
        const filtered = transactions.filter(tx => {
            if (filterType === 'all') return true;
            if (!tx.date) return false;
            
            const date = tx.date.toDate();
            
            // Daily Logic: Compare YYYY-MM-DD strings
            if (filterType === 'daily') {
                const txDateString = date.toISOString().split('T')[0];
                return txDateString === selectedDate;
            }

            const txYear = date.getFullYear().toString();
            const txMonth = date.getMonth().toString();
            
            const matchesYear = txYear === selectedYear;
            const matchesMonth = txMonth === selectedMonth;
            
            if (filterType === 'yearly') return matchesYear;
            if (filterType === 'monthly') return matchesYear && matchesMonth;
            
            return true;
        });

        const calculate = (type: 'wallet' | 'bank' | 'investment') => {
            const group = filtered.filter(t => t.accountType === type);
            const credit = group.filter(t => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
            const debit = group.filter(t => t.direction === 'out').reduce((s, t) => s + t.amount, 0);
            return { balance: credit - debit, credit, debit };
        };

        const wallet = calculate('wallet');
        const bank = calculate('bank');
        const investments = calculate('investment');
        const netTotal = wallet.balance + bank.balance + investments.balance;

        return { wallet, bank, investments, netTotal };
    }, [transactions, filterType, selectedYear, selectedMonth, selectedDate]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
                    ))}
                </div>
            </div>
        );
    }

    const assets = [
        { title: "Wallet", data: stats.wallet, icon: Wallet, bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400" },
        { title: "Bank Account", data: stats.bank, icon: Landmark, bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
        { title: "Investments", data: stats.investments, icon: TrendingUp, bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" }
    ];

    // Helper to format the display text in the badge
    const getBadgeText = () => {
        if (filterType === 'all') return 'All Time';
        if (filterType === 'daily') return new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        if (filterType === 'yearly') return `FY ${selectedYear}`;
        const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(selectedMonth)];
        return `${monthName} ${selectedYear}`;
    };

    return (
        <div className="space-y-6">
            {/* 1. Net Balance Highlight Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center group relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                        <CircleDollarSign size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">
                            Total Net Balance
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                            ₹{stats.netTotal.toLocaleString('en-IN')}
                        </h1>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 relative z-10 px-6 py-2 rounded-full border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        {getBadgeText()}
                    </span>
                </div>
            </div>

            {/* 2. Individual Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {assets.map((asset) => (
                    <div key={asset.title} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`p-4 rounded-2xl ${asset.bg} ${asset.text}`}>
                                <asset.icon size={28} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
                                {asset.title}
                            </span>
                        </div>

                        <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-8 tracking-tighter">
                            ₹{asset.data.balance.toLocaleString('en-IN')}
                        </h2>

                        <div className="flex gap-6 border-t border-slate-50 dark:border-slate-800 pt-6">
                            <div className="flex-1">
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">
                                    {asset.title === "Investments" ? 'Inflow' : 'Credit'}
                                </p>
                                <p className="text-sm font-bold text-emerald-500 tracking-tight">
                                    ₹{asset.data.credit.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="flex-1 border-l border-slate-100 dark:border-slate-800 pl-6">
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">
                                    {asset.title === "Investments" ? 'Outflow' : 'Debit'}
                                </p>
                                <p className="text-sm font-bold text-rose-500 tracking-tight">
                                    ₹{asset.data.debit.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}