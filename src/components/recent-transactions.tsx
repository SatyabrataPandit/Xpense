'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from "next/link";
import { ShoppingBag, Smartphone, Coffee, Utensils, Car, Briefcase, HelpCircle } from "lucide-react";

interface Transaction {
    id: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: Date;
}

const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('food')) return <Utensils size={20} />;
    if (cat.includes('shop')) return <ShoppingBag size={20} />;
    if (cat.includes('tech')) return <Smartphone size={20} />;
    if (cat.includes('coffee')) return <Coffee size={20} />;
    if (cat.includes('travel')) return <Car size={20} />;
    if (cat.includes('salary')) return <Briefcase size={20} />;
    return <HelpCircle size={20} />;
};

export function RecentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authUnsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(
                    collection(db, 'users', user.uid, 'transactions'),
                    orderBy('date', 'desc'),
                    limit(5)
                );
                const unsub = onSnapshot(q, (snapshot) => {
                    const txData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        date: doc.data().date?.toDate() || new Date()
                    })) as Transaction[];
                    setTransactions(txData);
                    setLoading(false);
                });
                return () => unsub();
            } else {
                setLoading(false);
            }
        });
        return () => authUnsub();
    }, []);

    if (loading) return <div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]" />;

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full transition-colors">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Recent Activity</h3>
                <Link href="/transactions" className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
                    View All
                </Link>
            </div>

            <div className="space-y-8 flex-1">
                {transactions.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 text-sm italic">No records found.</p>
                ) : (
                    transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                                    {getCategoryIcon(t.category)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{t.description}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">
                                        {t.category}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    ))
                )}
            </div>
            
            {/* The button was removed from here as requested */}
        </div>
    );
}