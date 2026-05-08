'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof (err as Record<string, unknown>).code === 'string' &&
        (err as Record<string, unknown>).code === 'auth/email-already-in-use'
      ) {
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
    <div className="flex flex-row-reverse min-h-screen bg-white overflow-hidden">
      {/* Branding Panel */}
      <motion.div 
        layoutId="auth-panel"
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center p-12 text-white relative z-10"
      >
        <div className="max-w-md">
          <h1 className="text-5xl font-bold italic tracking-tighter">Xpense.</h1>
          <p className="text-xl text-indigo-100 mt-4 font-light">Join us to start your financial journey.</p>
        </div>
      </motion.div>

      {/* Form Panel (Added 'relative' and 'z-20') */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-20"
      >
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-8 font-medium">Sign up in seconds.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input 
                type="text" 
                placeholder="David Joe" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 transition-all" 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input 
                type="email" 
                placeholder="name@email.com" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 transition-all" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 transition-all" 
                  placeholder="••••••••" 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 transition-all" 
                  placeholder="••••••••" 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(!showConfirm)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              disabled={isLoading} 
              className="w-full flex items-center justify-center py-3 mt-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition active:scale-[0.98] disabled:bg-indigo-300 shadow-lg gap-2"
            >
              {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
              {isLoading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>

        {/* --- FIXED FOOTER INTEGRATION --- */}
        <div className="absolute bottom-6 left-0 w-full px-8">
          <div className="flex flex-row justify-between items-center pt-4 border-t border-slate-100 w-full">
            <div className="flex-1">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap">
                &copy; {currentYear} <span className="font-bold text-slate-600">Dynotech Products</span>
                <span className="hidden md:inline">. All rights reserved.</span>
              </p>
            </div>
            <div className="shrink-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-500/40 tracking-widest uppercase">
                V2.1.0
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}