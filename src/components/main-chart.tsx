'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { TrendingUp, MoreHorizontal } from "lucide-react";

export function MainChart() {
    const [points, setPoints] = useState<string>("0,200 700,200");
    const [fillPoints, setFillPoints] = useState<string>("0,200 700,200 700,200 0,200");
    const [maxVal, setMaxVal] = useState("100k");
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Get transactions from the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            where('date', '>=', Timestamp.fromDate(oneWeekAgo))
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const dailyTotals = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const date = data.date?.toDate();
                if (date) {
                    const dayIndex = (date.getDay() + 6) % 7; // Adjust Sunday=0 to be the end
                    if (data.type === 'income') dailyTotals[dayIndex] += data.amount;
                    else dailyTotals[dayIndex] -= data.amount;
                }
            });

            // --- THE FORMULA SECTION ---
            const svgWidth = 700;
            const svgHeight = 200;
            const padding = 20;
            const chartHeight = svgHeight - padding;

            const absoluteValues = dailyTotals.map(Math.abs);
            const highest = Math.max(...absoluteValues, 1000); // Default min 1000
            setMaxVal(`${(highest / 1000).toFixed(0)}k`);

            const coords = dailyTotals.map((val, i) => {
                const x = (i * (svgWidth / (dailyTotals.length - 1)));
                // Formula: height - (value / max * height)
                const y = chartHeight - (Math.abs(val) / highest * chartHeight) + padding;
                return { x, y };
            });

            // Generate SVG Path String (L = Line to)
            const pathLine = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const pathArea = `${pathLine} V${svgHeight} H0 Z`;

            setPoints(pathLine);
            setFillPoints(pathArea);
        });

        return () => unsub();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-125 flex flex-col relative overflow-hidden transition-colors">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Activity</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Cash Flow Trend</h3>
                </div>
                <button className="p-2 text-slate-400"><MoreHorizontal size={20} /></button>
            </div>

            <div className="flex-1 relative mt-4">
                <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] font-black text-slate-200 dark:text-slate-700 pb-10">
                    <span>{maxVal}</span><span>0</span>
                </div>

                <div className="ml-12 h-full relative">
                    <svg className="absolute inset-0 w-full h-[calc(100%-40px)]" preserveAspectRatio="none" viewBox="0 0 700 200">
                        <defs>
                            <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Rendered using calculated state */}
                        <path d={fillPoints} fill="url(#liveGradient)" className="transition-all duration-700 ease-in-out" />
                        <path d={points} fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" className="transition-all duration-700 ease-in-out" />
                    </svg>
                </div>
            </div>

            <div className="flex justify-between ml-20 mt-4">
                {days.map(day => (
                    <span key={day} className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase">{day}</span>
                ))}
            </div>
        </div>
    );
}