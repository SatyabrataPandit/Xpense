'use client';

import { useState, useEffect } from 'react';
import { signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { ModeToggle } from '@/components/mode-toggle'; 
import { ProfileModal } from '@/components/profile-modal';
import { LayoutDashboard, LogOut, ChevronDown, User2Icon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar({ user }: { user: User }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        toast.promise(signOut(auth), {
            loading: 'Ending session...',
            success: () => {
                router.push('/login');
                return 'Logged out successfully';
            },
            error: 'Failed to log out. Please try again.',
        });
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 px-6 py-2.5 flex justify-between items-center z-100 transition-all duration-500 ${
                scrolled 
                ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm' 
                : 'bg-transparent border-b border-transparent'
            }`}>
                
                {/* Brand Logo - Compact */}
                <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
                    <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
                        <LayoutDashboard className="text-white" size={16} />
                    </div>
                    <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">
                        Xpense<span className="text-indigo-600">.</span>
                    </span>
                </Link>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    
                    {/* Compact Dark Mode Toggle */}
                    <div className="flex items-center justify-center scale-90 md:scale-100">
                        <ModeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 flex items-center gap-2 rounded-xl px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all border border-transparent">
                                <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-[10px] font-black shadow-md">
                                    {user?.displayName?.[0] || 'U'}
                                </div>
                                <div className="hidden sm:flex flex-col items-start leading-none text-left">
                                    <span className="font-black text-[9px] uppercase tracking-widest text-slate-800 dark:text-white">
                                        {user?.displayName?.split(' ')[0] || 'User'}
                                    </span>
                                </div>
                                <ChevronDown size={12} className="text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-64 mt-3 rounded-[1.5rem] p-2 shadow-2xl border-slate-200/60 dark:border-slate-800/60 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95" align="end">
                            <DropdownMenuLabel className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <User2Icon size={20} />
                                    </div>
                                    <div className="flex flex-col space-y-0.5 overflow-hidden">
                                        <p className="text-xs font-black text-slate-800 dark:text-white leading-none truncate">
                                            {user?.displayName}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 leading-none truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            
                            <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />
                            
                            <div className="space-y-0.5">
                                <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all">
                                    <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-md group-hover:bg-indigo-100 group-hover:text-white transition-colors">
                                        <User2Icon size={12} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                        Profile
                                    </span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 group transition-all"
                                    onClick={handleLogout}
                                >
                                    <div className="p-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-md group-hover:bg-rose-100 group-hover:text-white transition-colors">
                                        <LogOut size={12} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        Logout
                                    </span>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            {/* Reduced Spacer height */}
            <div className="h-16 w-full" />

            <ProfileModal
                user={user}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </>
    );
}