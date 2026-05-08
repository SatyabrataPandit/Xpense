'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link'; // Import Link for navigation
import {
    Utensils,
    Car,
    ShoppingBag,
    TrendingUp,
    HelpCircle,
    Shirt,
    IndianRupee,
    ArrowRight
} from "lucide-react";

type Transaction = {
    id: string;
    category: string;
    description: string;
    amount: number;
    direction: 'in' | 'out' | string;
    accountType: string;
    date: unknown;
};

export function RecentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(
                    collection(db, 'users', user.uid, 'transactions'),
                    orderBy('date', 'desc'),
                    limit(5)
                );

                const unsubData = onSnapshot(q, (snapshot) => {
                    const txs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...(doc.data() as Omit<Transaction, 'id'>)
                    }));
                    setTransactions(txs);
                    setLoading(false);
                });

                return () => unsubData();
            }
        });
        return () => unsubAuth();
    }, []);

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Foods': return { icon: <Utensils size={18} />, bg: 'bg-orange-50 text-orange-600' };
            case 'Beverage': return { icon: <Utensils size={18} />, bg: 'bg-sky-50 text-sky-600' };
            case 'Travel': return { icon: <Car size={18} />, bg: 'bg-blue-50 text-blue-600' };
            case 'Grocery': return { icon: <ShoppingBag size={18} />, bg: 'bg-emerald-50 text-emerald-600' };
            case 'Clothing': return { icon: <Shirt size={18} />, bg: 'bg-purple-50 text-purple-600' };
            case 'SIP': return { icon: <TrendingUp size={18} />, bg: 'bg-indigo-50 text-indigo-600' };
            case 'Transaction': return { icon: <IndianRupee size={18} />, bg: 'bg-slate-50 text-slate-600' };
            default: return { icon: <HelpCircle size={18} />, bg: 'bg-slate-50 text-slate-400' };
        }
    };

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">
                        Recent Activity
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Latest 5 entries
                    </p>
                </div>

                {/* VIEW ALL BUTTON */}
                <Link
                    href="/history"
                    className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:gap-3 transition-all"
                >
                    View All <ArrowRight size={14} />
                </Link>
            </div>

            <div className="space-y-6 flex-1">
                {transactions.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                        <p className="text-sm font-bold text-slate-400 italic tracking-tight">No records found.</p>
                    </div>
                ) : (
                    transactions.map((tx) => {
                        const styles = getCategoryStyles(tx.category);
                        return (
                            <div key={tx.id} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all group-hover:scale-110 shadow-sm ${styles.bg}`}>
                                        {styles.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-none mb-1">{tx.description}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tx.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${tx.direction === 'in' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {tx.direction === 'in' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter">
                                        {tx.accountType}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}