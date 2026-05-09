'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, Calendar, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

// --- Interfaces ---
interface Transaction {
    date?: Timestamp;
    direction?: 'in' | 'out';
    amount?: number;
}

interface DataPoint {
    dateLabel: string;
    fullDate: string;
    income: number;
    expense: number;
}

interface MainChartProps {
    filters: {
        type: 'all' | 'monthly' | 'yearly';
        year: string;
        month: string;
    };
}

interface ChartDataPoint {
    dateLabel: string;
    fullDate: string;
    income: number;
    expense: number;
}

export function MainChart({ filters }: MainChartProps) {
    const [data, setData] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // 1. Force mount check to prevent SSR/Hydration width errors
    useEffect(() => {
        setMounted(true);
    }, []);

    const { start, end, statusText } = useMemo(() => {
        const selYear = parseInt(filters.year) || 2026;
        const selMonth = parseInt(filters.month) || 0;
        let s: Date, e: Date, text = "";

        if (filters.type === 'yearly') {
            s = new Date(selYear, 0, 1);
            e = new Date(selYear, 11, 31, 23, 59, 59);
            text = `Yearly Analysis: ${selYear}`;
        } else if (filters.type === 'monthly') {
            s = new Date(selYear, selMonth, 1);
            e = new Date(selYear, selMonth + 1, 0, 23, 59, 59);
            text = `Monthly Analysis: ${s.toLocaleString('default', { month: 'long' })} ${selYear}`;
        } else {
            s = new Date(2025, 8, 20); // Your joining date
            e = new Date();
            text = "Lifetime Analysis";
        }
        return { start: s, end: e, statusText: text };
    }, [filters]);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user || !mounted) return;

        setLoading(true);
        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end)),
            orderBy('date', 'asc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const chartMap: Record<string, DataPoint> = {};
            const getLabels = (d: Date) => {
                const label = filters.type === 'monthly' ? d.toLocaleDateString('en-IN', { day: '2-digit' }) : 
                            filters.type === 'yearly' ? d.toLocaleDateString('en-IN', { month: 'short' }) :
                            d.toLocaleDateString('en-IN', { year: '2-digit', month: 'short' });
                
                const full = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                return { label, full };
            };

            const cursor = new Date(start);
            while (cursor <= end) {
                const { label, full } = getLabels(cursor);
                if (!chartMap[label]) chartMap[label] = { dateLabel: label, fullDate: full, income: 0, expense: 0 };
                if (filters.type === 'yearly') cursor.setMonth(cursor.getMonth() + 1);
                else if (filters.type === 'monthly') cursor.setDate(cursor.getDate() + 1);
                else cursor.setMonth(cursor.getMonth() + 1);
                if (cursor > end && filters.type === 'all') break;
            }

            snapshot.docs.forEach((doc) => {
                const tx = doc.data() as Transaction;
                if (!tx.date || !tx.direction || tx.amount === undefined) return;
                const { label } = getLabels(tx.date.toDate());
                if (chartMap[label]) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    tx.direction === 'in' ? (chartMap[label].income += tx.amount) : (chartMap[label].expense += tx.amount);
                }
            });

            setData(Object.values(chartMap));
            setLoading(false);
        });

        return () => unsub();
    }, [start, end, filters.type, mounted]);

    // Show a skeleton until mounted/loaded to avoid the "Width -1" crash
    if (!mounted || loading) {
        return <div className="h-112.5 w-full bg-slate-50 dark:bg-slate-800/20 animate-pulse rounded-[3rem]" />;
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full flex flex-col items-center overflow-hidden">
            
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="text-emerald-500" size={22} />
                        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Finance Flow</h2>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {statusText}
                    </p>
                </div>

                <div className="flex gap-8 bg-slate-50 dark:bg-slate-800/40 p-4 px-8 rounded-3xl border border-slate-100 dark:border-white/5">
                    <LegendItem color="bg-emerald-500" label="In" />
                    <LegendItem color="bg-rose-500" label="Out" />
                </div>
            </div>

            {/* Added aspect ratio and min-height to ensure container is never 0x0 */}
            <div className="w-full aspect-video md:aspect-21/9 min-h-75 max-h-100 flex justify-center items-center">
                <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="12 12" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="dateLabel" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }}
                            dy={15}
                            interval={filters.type === 'monthly' ? 3 : 0}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
                        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={4} fill="url(#colorIn)" />
                        <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={4} fill="url(#colorOut)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length >= 2) {
        // Accessing the 'payload' property inside the first element of the array
        const data = payload[0].payload as ChartDataPoint;
        
        const received = Number(payload[0].value || 0);
        const spent = Number(payload[1].value || 0);
        const totalBalance = received - spent;

        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl">
                {/* Header: Date */}
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-white/5 pb-3">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {data.fullDate}
                    </span>
                </div>

                {/* Body: Received & Spent */}
                <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center gap-10">
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-2">
                            <ArrowDownLeft size={16} /> Received
                        </span>
                        <span className="text-base font-black text-slate-800 dark:text-white">
                            ₹{received.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center gap-10">
                        <span className="text-xs font-bold text-rose-500 flex items-center gap-2">
                            <ArrowUpRight size={16} /> Spent
                        </span>
                        <span className="text-base font-black text-slate-800 dark:text-white">
                            ₹{spent.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                {/* Total Balance Section */}
                <div className="pt-3 border-t border-slate-50 dark:border-white/5">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-3 rounded-2xl gap-10">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            Net Balance
                        </span>
                        <span className={`text-base font-black ${totalBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                            {totalBalance < 0 ? '-' : ''}₹{Math.abs(totalBalance).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}