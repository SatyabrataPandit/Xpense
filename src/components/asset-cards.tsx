'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Wallet, Landmark, TrendingUp } from "lucide-react";

export function AssetCards() {
    interface AssetData {
        wallet?: { balance: number; credit: number; debit: number; };
        bank?: { balance: number; credit: number; debit: number; };
        investments?: { balance: number; profit: number; loss: number; };
    }

    const [data, setData] = useState<AssetData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use an observer to wait for the auth state to be ready
        const authUnsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                const totalsRef = doc(db, 'users', user.uid, 'summary', 'totals');
                const unsub = onSnapshot(totalsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setData(snapshot.data() as AssetData);
                    }
                    setLoading(false);
                });
                return () => unsub();
            } else {
                setLoading(false);
            }
        });

        return () => authUnsub();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />
                ))}
            </div>
        );
    }

    const assets = [
        {
            title: "Wallet",
            balance: data?.wallet?.balance || 0,
            in: data?.wallet?.credit || 0,
            out: data?.wallet?.debit || 0,
            profit: 0,
            loss: 0,
            icon: Wallet, color: "emerald"
        },
        {
            title: "Bank Account",
            balance: data?.bank?.balance || 0,
            in: data?.bank?.credit || 0,
            out: data?.bank?.debit || 0,
            profit: 0,
            loss: 0,
            icon: Landmark, color: "emerald"
        },
        {
            title: "Investments",
            balance: data?.investments?.balance || 0,
            in: 0,
            out: 0,
            profit: data?.investments?.profit || 0,
            loss: data?.investments?.loss || 0,
            icon: TrendingUp, color: "emerald"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assets.map((asset) => (
                <div 
                    key={asset.title} 
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all group"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className={`p-4 rounded-2xl bg-${asset.color}-50 dark:bg-${asset.color}-900/20 text-${asset.color}-600 dark:text-${asset.color}-400`}>
                            <asset.icon size={28} />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
                            {asset.title}
                        </span>
                    </div>

                    <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-8">
                        ₹{asset.balance.toLocaleString('en-IN')}
                    </h2>

                    <div className="flex gap-6 border-t border-slate-50 dark:border-slate-800 pt-6">
                        <div className="flex-1">
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">
                                {asset.title === "Investments" ? 'Profit' : 'Credit'}
                            </p>
                            <p className="text-sm font-bold text-emerald-500">
                                ₹{(asset.title === "Investments" ? asset.profit : asset.in).toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="flex-1 border-l border-slate-100 dark:border-slate-800 pl-6">
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black mb-1">
                                {asset.title === "Investments" ? 'Loss' : 'Debit'}
                            </p>
                            <p className="text-sm font-bold text-rose-500">
                                ₹{(asset.title === "Investments" ? asset.loss : asset.out).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}