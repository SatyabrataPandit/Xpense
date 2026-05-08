'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';

type TransactionDirection = 'in' | 'out';

interface Transaction {
    date?: Timestamp;
    direction?: TransactionDirection;
    amount?: number;
}

interface DataPoint {
    date: string;
    income: number;
    expense: number;
}

interface TooltipPayloadItem {
    payload: DataPoint;
    value: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
}

export function MainChart() {
    const [data, setData] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Fetch last 7 days of data
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            where('date', '>=', Timestamp.fromDate(oneWeekAgo)),
            orderBy('date', 'asc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            // Initialize an empty map for each day of the week
            const chartMap: Record<string, DataPoint> = {};
            const today = new Date();

            // Create entries for the last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                chartMap[label] = { date: label, income: 0, expense: 0 };
            }

            snapshot.docs.forEach((doc) => {
                const tx = doc.data() as Transaction;
                const dateLabel = tx.date?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

                if (dateLabel && chartMap[dateLabel]) {
                    if (tx.direction === 'in') chartMap[dateLabel].income += tx.amount ?? 0;
                    else chartMap[dateLabel].expense += tx.amount ?? 0;
                }
            });

            setData(Object.values(chartMap));
            setLoading(false);
        });

        return () => unsub();
    }, []);

    if (loading) return (
        <div className="h-112.5 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-[3rem]" />
    );

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">

            {/* Visual Branding */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                            <TrendingUp size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cash Flow Engine</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Financial Growth</h2>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inflow</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Outflow</span>
                    </div>
                </div>
            </div>

            <div className="h-75 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }}
                            dy={15}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }} />

                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#incomeGradient)"
                            animationDuration={1500}
                        />

                        <Area
                            type="monotone"
                            dataKey="expense"
                            stroke="#f43f5e"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#expenseGradient)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Calendar size={12} /> {payload[0].payload.date}
                </p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                            <ArrowDownLeft size={14} /> Inflow
                        </span>
                        <span className="text-sm font-black">₹{payload[0].value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-2">
                            <ArrowUpRight size={14} /> Outflow
                        </span>
                        <span className="text-sm font-black">₹{payload[1].value.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};