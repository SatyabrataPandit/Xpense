'use client';

import { useState, useEffect } from 'react';
import { Info, FileText, Sparkles, X, ChevronRight } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const [activeModal, setActiveModal] = useState<null | 'about' | 'terms' | 'updates'>(null);

    const closeModal = () => setActiveModal(null);

    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [activeModal]);

    return (
        <>
            <footer className="fixed bottom-0 left-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 transition-colors">
                <div className="container mx-auto px-6 py-3 flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-0">
                    
                    <div className="flex justify-center md:justify-start">
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap uppercase tracking-wider font-medium">
                            &copy; {currentYear} <span className="font-bold text-slate-800 dark:text-slate-200">Dynotech Products</span>
                        </p>
                    </div>

                    <div className="flex justify-center order-first md:order-0">
                        <button 
                            onClick={() => setActiveModal('updates')}
                            className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 tracking-[0.3em] uppercase bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 hover:scale-105 transition-all active:scale-95 shadow-sm"
                        >
                            V5.2.3
                        </button>
                    </div>

                    <div className="flex justify-center md:justify-end gap-6 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">
                        <button onClick={() => setActiveModal('about')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</button>
                        <button onClick={() => setActiveModal('terms')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</button>
                        <button onClick={() => setActiveModal('updates')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Updates</button>
                    </div>
                </div>
            </footer>

            {/* About Modal */}
            {activeModal === 'about' && (
                <FooterModal title="About Platform" icon={<Info size={22} />} onClose={closeModal}>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify font-medium">
                            Dynotech Ledger is a high-performance financial tracking solution designed for modern workflows. Built with security and speed in mind, it empowers users to manage complex transactions with ease through a clean, intuitive interface.
                        </p>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Architected & Developed By</p>
                            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">Satyabrata Pandit</p>
                        </div>
                    </div>
                </FooterModal>
            )}

            {/* Terms Modal */}
            {activeModal === 'terms' && (
                <FooterModal title="Terms of Service" icon={<FileText size={22} />} onClose={closeModal}>
                    <div className="space-y-3 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                        {[
                            "Data is stored securely and never shared with third parties.",
                            "Users are responsible for maintaining credentials confidentiality.",
                            "The service is provided 'as is' without warranties of any kind.",
                            "Commercial use requires written consent from Dynotech."
                        ].map((term, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p>{i + 1}. {term}</p>
                            </div>
                        ))}
                    </div>
                </FooterModal>
            )}

            {/* Scrollable Updates Modal */}
            {activeModal === 'updates' && (
                <FooterModal title="System Roadmap" icon={<Sparkles size={22} />} onClose={closeModal}>
                    <div className="space-y-8 pr-2">
                        {/* Current Version */}
                        <UpdateItem 
                            version="V5.2.3" 
                            date="May 2026" 
                            title="The Modern UI Expansion" 
                            isLatest
                            logs={[
                                "Implemented Centered Responsive Modals",
                                "Native Pagination & Transaction Slicing",
                                "Enhanced Dark Mode Visual Fidelity"
                            ]} 
                        />
                        <UpdateItem 
                            version="V5.1.0" 
                            date="April 2026" 
                            title="Performance Patch" 
                            logs={["Optimized Firestore query indexing", "Reduced JS bundle size by 12%"]} 
                        />
                        <UpdateItem 
                            version="V5.0.0" 
                            date="March 2026" 
                            title="Major Engine Overhaul" 
                            logs={["New React 19 architecture", "Server-side rendering for audit logs"]} 
                        />
                        <UpdateItem 
                            version="V4.2.0" 
                            date="January 2026" 
                            title="Customization Suite" 
                            logs={["Added Theme Personalization", "Custom Category Icons"]} 
                        />
                        <UpdateItem 
                            version="V4.0.0" 
                            date="December 2025" 
                            title="Auth Security Update" 
                            logs={["Multi-factor authentication (MFA)", "Session timeout controls"]} 
                        />
                        <UpdateItem 
                            version="V3.5.0" 
                            date="November 2025" 
                            title="Data Insights" 
                            logs={["Added Monthly Summary Graphs", "Category-wise spending pie charts"]} 
                        />
                        <UpdateItem 
                            version="V3.0.0" 
                            date="October 2025" 
                            title="Database Migration" 
                            logs={["Firebase Real-time Sync", "Export to Excel (.xlsx)"]} 
                        />
                        <UpdateItem 
                            version="V2.2.0" 
                            date="September 2025" 
                            title="Stability Patch" 
                            logs={["Fixed overlapping text in mobile footers", "Cache handling improvements"]} 
                        />
                        <UpdateItem 
                            version="V2.0.0" 
                            date="August 2025" 
                            title="Cloud Infrastructure" 
                            logs={["Global Edge Caching", "Automatic Data Backups"]} 
                        />
                        <UpdateItem 
                            version="V1.5.0" 
                            date="July 2025" 
                            title="Search Expansion" 
                            logs={["Advanced Multi-keyword Search", "Date Range Filtering"]} 
                        />
                        <UpdateItem 
                            version="V1.0.0" 
                            date="June 2025" 
                            title="Initial Genesis" 
                            logs={["Official Launch", "Basic Ledger Core Functions"]} 
                        />
                    </div>
                </FooterModal>
            )}
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UpdateItem({ version, date, title, logs, isLatest }: any) {
    return (
        <div className="relative pl-7 border-l-2 border-slate-200 dark:border-slate-800 py-1">
            <div className={`absolute -left-2.25 top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${isLatest ? 'bg-indigo-500 scale-110' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isLatest ? 'text-indigo-500' : 'text-slate-400'}`}>{version}</span>
                <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">• {date}</span>
            </div>
            <p className={`text-sm font-black mt-1 uppercase ${isLatest ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500'}`}>{title}</p>
            <ul className="mt-3 space-y-2">
                {logs.map((log: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <ChevronRight size={12} className="mt-0.5 text-indigo-400 shrink-0" />
                        {log}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FooterModal({ title, icon, children, onClose }: { title: string, icon: any, children: React.ReactNode, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 outline-none">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg md:max-w-md border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                                {icon}
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none">{title}</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Dynotech Systems</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-rose-500 active:scale-90">
                            <X size={22} />
                        </button>
                    </div>
                    
                    <div className="min-h-37.5 max-h-[50vh] overflow-y-auto custom-scrollbar pr-3">
                        {children}
                    </div>

                    <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-indigo-500/10">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}