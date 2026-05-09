'use client';

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, runTransaction, type Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import * as XLSX from 'xlsx';
import {
    Trash2, ArrowLeft, Search, Download, Loader2, 
    Utensils, Car, ShoppingBag, TrendingUp, 
    IndianRupee, Ghost, ChevronDown, Filter, FileSpreadsheet, X,
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
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); 
    const [filterFlow, setFilterFlow] = useState("all"); 
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    // UI States for Custom Dropdowns
    const [isAssetOpen, setIsAssetOpen] = useState(false);
    const [isFlowOpen, setIsFlowOpen] = useState(false);

    const [deleteId, setDeleteId] = useState<Transaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) setLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, [user]);

    const filteredData = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.subDescription?.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesType = filterType === "all" || t.accountType === filterType;
            const matchesFlow = filterFlow === "all" || t.direction === filterFlow;

            let matchesDateRange = true;
            if (t.date) {
                const txDate = t.date.toDate();
                txDate.setHours(0, 0, 0, 0);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (txDate < start) matchesDateRange = false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(0, 0, 0, 0);
                    if (txDate > end) matchesDateRange = false;
                }
            }
            return matchesSearch && matchesType && matchesFlow && matchesDateRange;
        });
    }, [transactions, searchTerm, filterType, filterFlow, startDate, endDate]);

    const handleExport = (exportAll: boolean) => {
        const dataToExport = exportAll ? transactions : filteredData;
        if (dataToExport.length === 0) return toast.error("No data found");
        const excelData = dataToExport.map(tx => ({
            'Date': tx.date?.toDate().toLocaleDateString('en-IN'),
            'Description': tx.description,
            'Category': tx.category,
            'Asset': tx.accountType.toUpperCase(),
            'Flow': tx.direction === 'in' ? 'CREDIT' : 'DEBIT',
            'Amount': tx.amount
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
        XLSX.writeFile(workbook, exportAll ? "Full_Ledger.xlsx" : "Filtered_Ledger.xlsx");
        toast.success("Export successful");
    };

    const confirmDelete = async () => {
        if (!deleteId || !user) return;
        setIsDeleting(true);
        try {
            await runTransaction(db, async (transaction) => {
                const txRef = doc(db, 'users', user.uid, 'transactions', deleteId.id);
                transaction.delete(txRef);
            });
            toast.success("Entry voided");
            setDeleteId(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) { toast.error("Error voiding entry"); } finally { setIsDeleting(false); }
    };

    const resetAllFilters = () => {
        setSearchTerm("");
        setFilterType("all");
        setFilterFlow("all");
        setStartDate("");
        setEndDate("");
        toast.info("All filters cleared");
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Foods': return { icon: <Utensils size={16} />, bg: 'bg-orange-50 text-orange-600' };
            case 'Travel': return { icon: <Car size={16} />, bg: 'bg-blue-50 text-blue-600' };
            case 'Grocery': return { icon: <ShoppingBag size={16} />, bg: 'bg-emerald-50 text-emerald-600' };
            case 'SIP': return { icon: <TrendingUp size={16} />, bg: 'bg-indigo-50 text-indigo-600' };
            default: return { icon: <IndianRupee size={16} />, bg: 'bg-slate-50 text-slate-500' };
        }
    };

    // Options for Custom Selects
    const assetOptions = [
        { id: 'all', label: 'All Assets' },
        { id: 'wallet', label: 'Wallet' },
        { id: 'bank', label: 'Bank Account' },
        { id: 'investment', label: 'Investments' }
    ];

    const flowOptions = [
        { id: 'all', label: 'All Flows' },
        { id: 'in', label: 'Inflow (Credit)' },
        { id: 'out', label: 'Outflow (Debit)' }
    ];

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#F9FBFC] dark:bg-slate-950 transition-colors overflow-hidden">
            <Navbar user={user!} />

            <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 lg:p-8 overflow-hidden">
                
                <div className="flex-none">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div className="space-y-1">
                            <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-wider transition-all mb-2">
                                <ArrowLeft size={12} /> Dashboard Overview
                            </Link>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Audit Ledger</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Financial reconciliation and transaction logs.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => handleExport(false)} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 shadow-sm transition-all">
                                <Download size={14} /> Export Filtered Data
                            </button>
                            <button onClick={() => handleExport(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-wider shadow-md shadow-indigo-100 transition-all">
                                <FileSpreadsheet size={14} /> Export All
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            
                            {/* Search */}
                            <div className="md:col-span-4 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input
                                    type="text" 
                                    placeholder="Search Payee..."
                                    value={searchTerm}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500/20 rounded-2xl text-xs font-semibold outline-none transition-all"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Custom Dropdowns Replacement */}
                            <div className="md:col-span-4 grid grid-cols-2 gap-3">
                                
                                {/* Asset Custom Select */}
                                <div className="relative">
                                    <button 
                                        onClick={() => { setIsAssetOpen(!isAssetOpen); setIsFlowOpen(false); }}
                                        className="w-full flex items-center justify-between pl-4 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-2xl text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-300 outline-none transition-all"
                                    >
                                        <span className="truncate">{assetOptions.find(o => o.id === filterType)?.label}</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isAssetOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isAssetOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                                            {assetOptions.map(opt => (
                                                <button 
                                                    key={opt.id} 
                                                    onClick={() => { setFilterType(opt.id); setIsAssetOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-colors ${filterType === opt.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Flow Custom Select */}
                                <div className="relative">
                                    <button 
                                        onClick={() => { setIsFlowOpen(!isFlowOpen); setIsAssetOpen(false); }}
                                        className="w-full flex items-center justify-between pl-4 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-2xl text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-300 outline-none transition-all"
                                    >
                                        <span className="truncate">{flowOptions.find(o => o.id === filterFlow)?.label}</span>
                                        <Filter size={12} className={`text-slate-400 transition-transform ${isFlowOpen ? 'scale-110 text-indigo-500' : ''}`} />
                                    </button>

                                    {isFlowOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                                            {flowOptions.map(opt => (
                                                <button 
                                                    key={opt.id} 
                                                    onClick={() => { setFilterFlow(opt.id); setIsFlowOpen(false); }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-colors ${filterFlow === opt.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-4 flex items-center gap-2">
                                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-3 border border-transparent focus-within:border-indigo-500/10">
                                    <input 
                                        type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-transparent py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 outline-none" 
                                    />
                                </div>
                                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-3 border border-transparent focus-within:border-indigo-500/10">
                                    <input 
                                        type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-transparent py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 outline-none" 
                                    />
                                </div>
                                
                                <button 
                                    onClick={resetAllFilters}
                                    title="Reset All Filters"
                                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all active:scale-95"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-32">
                    {filteredData.length > 0 ? (
                        filteredData.map((tx) => {
                            const styles = getCategoryStyles(tx.category);
                            const isCredit = tx.direction === 'in';
                            return (
                                <div key={tx.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 px-6 rounded-[1.5rem] flex items-center justify-between shadow-sm transition-all hover:border-slate-200 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${styles.bg}`}>
                                            {styles.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{tx.description}</h3>
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {tx.category}
                                                </span>
                                            </div>
                                            {tx.subDescription && <p className="text-slate-400 text-[11px] mt-0.5 italic font-medium">{tx.subDescription}</p>}
                                            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                                                <span>{tx.date?.toDate().toLocaleDateString('en-IN')}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                <span className="text-indigo-400/60">{tx.accountType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className={`text-lg font-black tracking-tight ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{isCredit ? 'Received' : 'Paid Out'}</p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => setDeleteId(tx)} 
                                            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                                            title="Void Transaction"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <Ghost className="text-slate-100 dark:text-slate-800 mb-4" size={48} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No entries found</p>
                        </div>
                    )}
                </div>
            </main>

            {/* VOID MODAL */}
            {deleteId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Confirm Void</h3>
                        <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">This will permanently remove the record and revert associated balances. Continue?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] uppercase rounded-2xl">Cancel</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3.5 bg-rose-500 text-white font-bold text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2">
                                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Void Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex-none bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
                <Footer />
            </div>
        </div>
    );
}