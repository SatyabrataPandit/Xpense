'use client';

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, collection, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, ChevronDown, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner";

export function NewEntryForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [type, setType] = useState<'wallet' | 'bank' | 'investment'>('bank');
    const [direction, setDirection] = useState<'in' | 'out'>('out');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Foods');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [subDescription, setSubDescription] = useState('');
    const [isCatOpen, setIsCatOpen] = useState(false);

    const accountTypes = ['wallet', 'bank', 'investment'] as const;
    const categories = ["Foods", "Beverage", "Travel", "Grocery", "Clothing", "Transaction", "SIP", "Others"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || !amount) return;
        setIsSubmitting(true);
        
        try {
            await runTransaction(db, async (transaction) => {
                const totalsRef = doc(db, 'users', user.uid, 'summary', 'totals');
                const totalsDoc = await transaction.get(totalsRef);
                if (!totalsDoc.exists()) throw "Totals document does not exist!";
                
                const numAmount = parseFloat(amount);
                const currentData = totalsDoc.data();
                const newTotals = { ...currentData };
                
                if (type === 'investment') {
                    if (direction === 'in') { newTotals.investments.balance += numAmount; newTotals.investments.profit += numAmount; }
                    else { newTotals.investments.balance -= numAmount; newTotals.investments.loss += numAmount; }
                } else {
                    if (direction === 'in') { newTotals[type].balance += numAmount; newTotals[type].credit += numAmount; }
                    else { newTotals[type].balance -= numAmount; newTotals[type].debit += numAmount; }
                }

                const txRef = doc(collection(db, 'users', user.uid, 'transactions'));
                transaction.set(txRef, { 
                    description, 
                    subDescription, 
                    category, 
                    amount: numAmount, 
                    accountType: type, 
                    direction, 
                    date: new Date(date), 
                    createdAt: serverTimestamp() 
                });
                transaction.update(totalsRef, newTotals);
            });

            toast.success("Transaction Success", {
                description: `${description} added to ${type} successfully.`,
            });

            setTimeout(() => {
                router.push('/');
            }, 1000);

        } catch (error) { 
            console.error(error); 
            toast.error("Failed to save", {
                description: "Something went wrong with the database sync.",
            });
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-auto md:h-[calc(100vh-200px)] flex flex-col justify-center transition-colors px-4 md:px-0">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <ArrowLeft size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dashboard</span>
                </Link>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    {accountTypes.map((t) => (
                        <button key={t} type="button" onClick={() => setType(t)}
                            className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                {/* Left Section - Centered on Mobile */}
                <div className="md:col-span-5 flex flex-col items-center md:items-start space-y-8">
                    <div className="relative w-full text-center md:text-left">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700 mb-2 block">Amount</label>
                        <div className="flex items-baseline justify-center md:justify-start gap-2">
                            <span className="text-3xl font-black text-indigo-500">₹</span>
                            <input 
                                required 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                placeholder="0.00"
                                className="bg-transparent text-6xl md:text-8xl font-black text-slate-900 dark:text-white outline-none w-full max-w-70 md:max-w-full text-center md:text-left placeholder:text-slate-200 dark:placeholder:text-slate-800 placeholder:font-bold" 
                            />
                        </div>
                    </div>

                    {/* Centered Credit/Debit Buttons */}
                    <div className="flex gap-2 w-full max-w-sm md:max-w-full">
                        <button type="button" onClick={() => setDirection('in')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${direction === 'in' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>{type === 'investment' ? 'Profit' : 'Credit'}</button>
                        <button type="button" onClick={() => setDirection('out')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${direction === 'out' ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>{type === 'investment' ? 'Loss' : 'Debit'}</button>
                    </div>
                </div>

                {/* Right Section - Grid inputs */}
                <div className="md:col-span-7 grid grid-cols-2 gap-x-8 gap-y-6 border-l-0 md:border-l border-slate-100 dark:border-slate-900 px-0 md:pl-8">

                    <div className="relative">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Category</label>
                        <button type="button" onClick={() => setIsCatOpen(!isCatOpen)} className="w-full flex items-center justify-between text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 outline-none">
                            {category} <ChevronDown size={16} />
                        </button>
                        {isCatOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50 grid grid-cols-2 gap-1 animate-in fade-in zoom-in-95">
                                {categories.map(cat => (
                                    <button key={cat} type="button" onClick={() => { setCategory(cat); setIsCatOpen(false); }} className={`text-left px-3 py-2 rounded-lg text-[11px] font-bold ${category === cat ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}>{cat}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 bg-transparent outline-none" />
                    </div>

                    <div className="col-span-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Description</label>
                        <input required type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Entry title..." className="w-full text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 bg-transparent outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800 placeholder:font-bold" />
                    </div>

                    <div className="col-span-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Extra Details</label>
                        <input type="text" value={subDescription} onChange={(e) => setSubDescription(e.target.value)} placeholder="Notes..." className="w-full text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 bg-transparent outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800 placeholder:font-bold" />
                    </div>

                    <div className="col-span-2 pt-4 space-y-4">
                        <button disabled={isSubmitting} type="submit"
                            className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            {isSubmitting ? 'Syncing...' : 'Save Transaction'}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-slate-300 dark:text-slate-700">
                            <ShieldCheck size={12} />
                            <p className="text-[9px] font-black uppercase tracking-[0.25em]">
                                Secure cloud synchronization via Firebase
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}