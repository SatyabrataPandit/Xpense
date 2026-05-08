'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from "sonner";

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
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!", {
        description: "You have logged in successfully.",
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
    // Changed: Added flex-col to stack on mobile, flex-row for desktop
    <div className="flex flex-col lg:flex-row min-h-screen bg-white overflow-x-hidden">
      
      {/* Branding Panel */}
      <motion.div 
        layoutId="auth-panel"
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        // Changed: Removed 'hidden', added responsive padding and width
        className="w-full lg:w-1/2 bg-indigo-600 flex items-center justify-center p-10 lg:p-12 text-white relative z-10"
      >
        <div className="max-w-md text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold italic tracking-tighter">Xpense.</h1>
          <p className="text-lg lg:text-xl text-indigo-100 mt-2 lg:mt-4 font-light">
            Track your wealth, one click at a time.
          </p>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} // Changed: x to y for a better mobile entry
        animate={{ opacity: 1, y: 0 }} 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-20 grow"
      >
        {/* Changed: Added bottom padding pb-24 so the form doesn't hit the absolute footer on small screens */}
        <div className="w-full max-w-md pb-24 lg:pb-0">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8 font-medium">Sign in to manage your budget.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 transition-all" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 transition-all" 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              disabled={isLoading} 
              className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg active:scale-[0.98] disabled:bg-indigo-300 gap-2"
            >
              {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            New user? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Create an account</Link>
          </p>
        </div>

        {/* Footer */}
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