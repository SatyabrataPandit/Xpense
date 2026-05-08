'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, runTransaction, type Timestamp } from 'firebase/firestore';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import {
    Trash2, ArrowLeft, Search,
    AlertCircle, X, Loader2, Utensils, Car,
    ShoppingBag, TrendingUp, HelpCircle, Shirt, IndianRupee, Ghost,
    ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner";

type Transaction = {
    id: string;
    description: string;
    category: string;
    subDescription?: string;
    accountType: 'wallet' | 'bank' | 'investment' | string;
    direction: 'in' | 'out' | string;
    amount: number;
    date?: Timestamp;
};

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); // wallet, bank, investment
    const [filterDirection, setFilterDirection] = useState("all"); // in, out
    const [deleteId, setDeleteId] = useState<Transaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            orderBy('date', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
        });

        return () => unsub();
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

    const confirmDelete = async () => {
        const user = auth.currentUser;
        if (!user || !deleteId) return;
        setIsDeleting(true);
        try {
            await runTransaction(db, async (transaction) => {
                const totalsRef = doc(db, 'users', user.uid, 'summary', 'totals');
                const totalsDoc = await transaction.get(totalsRef);
                if (!totalsDoc.exists()) return;
                const currentData = totalsDoc.data();
                const newTotals = { ...currentData };
                const { amount, accountType, direction } = deleteId;

                if (accountType === 'investment') {
                    if (direction === 'in') { newTotals.investments.balance -= amount; newTotals.investments.profit -= amount; }
                    else { newTotals.investments.balance += amount; newTotals.investments.loss -= amount; }
                } else {
                    if (direction === 'in') { newTotals[accountType].balance -= amount; newTotals[accountType].credit -= amount; }
                    else { newTotals[accountType].balance += amount; newTotals[accountType].debit -= amount; }
                }
                transaction.delete(doc(db, 'users', user.uid, 'transactions', deleteId.id));
                transaction.update(totalsRef, newTotals);
            });
            toast.success("Transaction Reverted");
            setDeleteId(null);
        } catch {
            toast.error("Error deleting entry");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredData = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || t.accountType === filterType;
        const matchesDir = filterDirection === "all" || t.direction === filterDirection;
        return matchesSearch && matchesType && matchesDir;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
            <Navbar user={auth.currentUser!} />

            <main className="max-w-6xl mx-auto p-6 lg:p-10 pb-32">
                {/* Header Section */}
                <div className="flex flex-col gap-8 mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                                <ArrowLeft size={14} /> Dashboard
                            </Link>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Detailed Ledger</h1>
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text" placeholder="Search history..."
                                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Combined Filters Container */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Account Type Filter */}
                        <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1 rounded-2xl">
                            {['all', 'wallet', 'bank', 'investment'].map((f) => (
                                <button key={f} onClick={() => setFilterType(f)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === f ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* NEW: Direction Filter */}
                        <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1 rounded-2xl">
                            <button onClick={() => setFilterDirection('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterDirection === 'all' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>All Flows</button>
                            <button onClick={() => setFilterDirection('in')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterDirection === 'in' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>
                                <ArrowDownLeft size={12} /> Credits
                            </button>
                            <button onClick={() => setFilterDirection('out')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterDirection === 'out' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>
                                <ArrowUpRight size={12} /> Debits
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    {filteredData.length > 0 ? (
                        filteredData.map((tx) => {
                            const styles = getCategoryStyles(tx.category);
                            const isCredit = tx.direction === 'in';
                            return (
                                <div key={tx.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
                                    <div className="flex items-start gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 ${styles.bg}`}>
                                            {styles.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-slate-800 dark:text-slate-100">{tx.description}</h3>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {tx.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">{tx.subDescription || "No notes."}</p>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-2">
                                                <span>{tx.date?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span>{tx.accountType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-10">
                                        <div className="text-right">
                                            {/* COLOR LOGIC: Green for in (+), Red for out (-) */}
                                            <p className={`text-2xl font-black ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{isCredit ? 'Credit' : 'Debit'}</p>
                                        </div>
                                        <button onClick={() => setDeleteId(tx)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <Ghost className="text-slate-200 mb-4" size={60} />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching transactions</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl">
                                <AlertCircle size={24} />
                            </div>
                            <button onClick={() => setDeleteId(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Delete Entry?</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                            This will remove <span className="font-bold text-slate-800 dark:text-slate-200">`&quot;`{deleteId.description}`&quot;`</span> and revert the ₹{deleteId.amount} from your live balance.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 font-black text-[10px] uppercase rounded-2xl">Cancel</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-4 bg-rose-500 text-white font-black text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2">
                                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}