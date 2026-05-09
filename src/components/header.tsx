'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LayoutDashboard, Plus, ChevronDown, Check } from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
    filters: {
        type: 'all' | 'monthly' | 'yearly';
        year: string;
        month: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
        type: 'all' | 'monthly' | 'yearly';
        year: string;
        month: string;
    }>>;
}

function ModernDropdown({ value, options, onChange, label }: { value: string; options: { label: string; value: string }[]; onChange: (val: string) => void; label: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">
                    {selectedOption?.label}
                </span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 lg:left-0 z-50 min-w-32.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5"
                        >
                            <div className="max-h-60 overflow-y-auto scrollbar-hide">
                                {options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase rounded-xl transition-colors ${opt.value === value
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {opt.label}
                                        {opt.value === value && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export function Header({ filters, setFilters }: HeaderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setMounted(true); });
        return () => unsubscribe();
    }, []);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({ label: m, value: i.toString() }));
    const years = Array.from({ length: 5 }, (_, i) => {
        const year = (new Date().getFullYear() - i).toString();
        return { label: year, value: year };
    });

    if (!mounted) return <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />;

    return (
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">

            {/* 1. TEXT SECTION (Welcome & Interesting Subtext) */}
            <div className="flex-1 order-1">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-md">
                        <LayoutDashboard size={14} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Financial Command</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-2">
                    Welcome, <span className="text-indigo-600 dark:text-indigo-400">{user?.displayName?.split(' ')[0] || 'Satyabrata'}</span>!
                </h1>
                <p className="text-[11px] md:text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2 tracking-wide uppercase">
                    Track your expenses and gain insights all in one place.
                </p>
            </div>

            {/* 2. ADD ENTRY BUTTON (Mobile: Middle | Desktop: Far Right) */}
            <div className="order-2 lg:order-3">
                <Link href="/new-entry" className="w-full lg:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all">
                    <Plus size={18} />
                    <span>Add Entry</span>
                </Link>
            </div>

            {/* 3. FILTER CONTROLS (Mobile: Bottom | Desktop: Center) */}
            <div className="order-3 lg:order-2 flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-[1.5rem] shadow-sm">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    {['monthly', 'yearly', 'all'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                type: type as 'all' | 'monthly' | 'yearly'
                            }))}
                            className={`flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${filters.type === type
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {filters.type !== 'all' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 mt-1 sm:mt-0 pt-1 sm:pt-0 sm:ml-1 sm:pl-1"
                        >
                            <ModernDropdown label="Year" value={filters.year} options={years} onChange={(val) => setFilters(p => ({ ...p, year: val }))} />
                            {filters.type === 'monthly' && (
                                <ModernDropdown label="Month" value={filters.month} options={months} onChange={(val) => setFilters(p => ({ ...p, month: val }))} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}