'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LayoutDashboard, Calendar, Plus } from "lucide-react";
import Link from 'next/link';

export function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            requestAnimationFrame(() => setMounted(true));
        });
        return () => unsubscribe();
    }, []);

    if (!mounted) return <div className="h-28 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
            <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg">
                        <LayoutDashboard size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Command</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{userName}</span>!
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium italic">
                    &quot;Your spending is <span className="text-emerald-500 font-bold">5% lower</span> than last week.&quot;
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* NEW: Add Entry Button moved to Header */}
                <Link 
                    href="/new-entry" 
                    className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Entry</span>
                </Link>

                <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
                    <Calendar size={16} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>
    );
}