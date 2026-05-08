'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LayoutDashboard, ArrowLeft, Cpu, UserPlus, Lock } from 'lucide-react';
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Validation Error", {
        description: "Passwords do not match."
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      toast.success("Account Created!", {
        description: `Welcome to Xpense, ${name}.`
      });

      router.push('/'); 
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";

      if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
        toast.error("Registration Error", {
          description: "This email is already registered."
        });
      } else {
        toast.error("Registration Error", {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
        <div className="h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Left Branding Panel */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative hidden lg:flex lg:w-5/12 bg-indigo-600 dark:bg-indigo-950 items-center justify-center p-12 overflow-hidden"
            >
                <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-indigo-800 dark:from-indigo-950 dark:to-slate-950" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-white/10 rounded-full blur-[120px]" />
                
                <div className="relative z-10 w-full max-w-sm">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-white p-2.5 rounded-2xl shadow-2xl">
                            <LayoutDashboard className="text-indigo-600" size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter italic">Xpense.</h1>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase mb-8">
                        Begin your <br /> Wealth Journey.
                    </h2>
                    <div className="space-y-5">
                        <div className="flex items-center gap-4 text-indigo-100/60 text-[9px] font-black uppercase tracking-[0.25em]">
                            <span className="p-2 bg-white/10 rounded-xl"><Cpu size={14} /></span>
                            Instant Ledger Generation
                        </div>
                        <div className="flex items-center gap-4 text-indigo-100/60 text-[9px] font-black uppercase tracking-[0.25em]">
                            <span className="p-2 bg-white/10 rounded-xl"><Lock size={14} /></span>
                            Cloud-Secured Protocols
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                
                {/* Mobile Branding */}
                <div className="lg:hidden w-full flex justify-between items-center mb-6 px-4">
                    <span className="text-xl font-black tracking-tighter dark:text-white italic">Xpense.</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">v5.2.3</span>
                </div>

                {/* GLASS FORM CARD */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-105 p-8 md:p-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[3rem] shadow-xl shadow-indigo-500/5"
                >
                    <div className="space-y-1 mb-8">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Register</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Create your digital identity</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                            <input 
                                type="text" 
                                placeholder="David Joe" 
                                className="w-full h-11 px-5 bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white font-bold transition-all text-sm" 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity (Email)</label>
                            <input 
                                type="email" 
                                placeholder="name@domain.com" 
                                className="w-full h-11 px-5 bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white font-bold transition-all text-sm" 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Key</label>
                                <div className="relative">
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        placeholder="••••" 
                                        className="w-full h-11 px-5 bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white font-bold transition-all text-sm" 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm</label>
                                <input 
                                    type="password" 
                                    placeholder="••••" 
                                    className="w-full h-11 px-5 bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-white font-bold transition-all text-sm" 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <button 
                            disabled={isLoading} 
                            className="w-full h-12 mt-4 flex items-center justify-center bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl md:rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] disabled:opacity-50 gap-3"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <UserPlus size={16} />}
                            {isLoading ? 'Processing...' : 'Initialize Account'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200/30 dark:border-slate-800/30 flex items-center justify-center">
                        <Link href="/login" className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-black text-[9px] uppercase tracking-widest hover:text-indigo-600 transition-all group">
                            <ArrowLeft size={12} /> Return to Login
                        </Link>
                    </div>
                </motion.div>

                {/* FOOTER */}
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