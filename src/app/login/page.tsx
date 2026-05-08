'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LayoutDashboard, ShieldCheck, ArrowRight, Cpu, Lock } from 'lucide-react';
import { toast } from "sonner";

const initializeUserTotals = async (userId: string) => {
    const totalsRef = doc(db, 'users', userId, 'summary', 'totals');
    const totalsSnap = await getDoc(totalsRef);
    if (!totalsSnap.exists()) {
        await setDoc(totalsRef, {
            wallet: { balance: 0, credit: 0, debit: 0 },
            bank: { balance: 0, credit: 0, debit: 0 },
            investments: { balance: 0, profit: 0, loss: 0 }
        });
    }
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const router = useRouter();
    const currentYear = new Date().getFullYear();

    useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // --- DATABASE SYNC: Ensure the ledger exists ---
      await initializeUserTotals(userCredential.user.uid);

      toast.success("Welcome back!", {
        description: "Dashboard is ready.",
      });
      router.push('/');
    } catch (error: unknown) {
      const authError = typeof error === 'object' && error !== null && 'code' in error
        ? error as { code: string }
        : null;

      const message = authError?.code === 'auth/invalid-credential'
        ? "Invalid email or password."
        : "Something went wrong. Please try again.";

      toast.error("Login Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-white" />;

    return (
        <div className="h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
            
            {/* Background Decorative Gradient for Glass Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Version Badge */}
            <div className="absolute top-8 right-8 z-50 hidden lg:flex items-center gap-3">
                <div className="h-px w-6 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.4em]">Build v5.2.3</span>
            </div>

            {/* Left Branding Panel */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative hidden lg:flex lg:w-5/12 bg-indigo-600 dark:bg-indigo-950 items-center justify-center p-12 overflow-hidden"
            >
                <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-indigo-800 dark:from-indigo-950 dark:to-slate-950" />
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-white/10 rounded-full blur-[120px]" />
                
                <div className="relative z-10 w-full max-w-sm">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-white p-2.5 rounded-2xl shadow-2xl">
                            <LayoutDashboard className="text-indigo-600" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic">Xpense.</h1>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase mb-8">
                        The Command Center <br /> for your wealth.
                    </h2>
                    <div className="space-y-5">
                        {[
                            { icon: <ShieldCheck size={14} />, text: "Biometric-grade Security" },
                            { icon: <Cpu size={14} />, text: "Automated Ledger Sync" },
                            { icon: <Lock size={14} />, text: "End-to-End Encryption" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 text-indigo-100/60 text-[9px] font-black uppercase tracking-[0.25em]">
                                <span className="p-2 bg-white/10 rounded-xl">{item.icon}</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                
                {/* Mobile Branding */}
                <div className="lg:hidden w-full flex justify-between items-center mb-10 px-4">
                    <span className="text-xl font-black tracking-tighter dark:text-white italic">Xpense.</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">v5.2.3</span>
                </div>

                {/* GLASS FORM CARD */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-105 p-8 md:p-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[3rem] shadow-xl shadow-indigo-500/5"
                >
                    <div className="space-y-2 mb-10">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Initialize</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Secure Authentication Required</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity (Email)</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full h-14 px-6 bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white font-bold transition-all text-sm" 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password Key</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="w-full h-14 px-6 bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white font-bold transition-all text-sm" 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 p-2">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            disabled={isLoading} 
                            className="w-full h-14 mt-4 flex items-center justify-center bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] disabled:opacity-50 gap-3"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldCheck size={16} />}
                            {isLoading ? 'Verifying...' : 'Access Command Center'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between">
                        <Link href="/register" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase tracking-widest hover:gap-3 transition-all group">
                            Create Account <ArrowRight size={12} />
                        </Link>
                        <div className="text-right">
                             <p className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                                Status: Secure
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* FIXED FULL COPYRIGHT FOOTER */}
                <div className="absolute bottom-8 w-full max-w-105 px-4">
                    <div className="flex items-center justify-between py-4 border-t border-slate-200/30 dark:border-slate-800/30">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            &copy; {currentYear} <span className="text-slate-600 dark:text-slate-300">Dynotech Products</span>. All Rights Reserved.
                        </p>
                        <span className="text-[9px] font-black text-indigo-500/30 tracking-widest uppercase">
                            v5.2.3
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}