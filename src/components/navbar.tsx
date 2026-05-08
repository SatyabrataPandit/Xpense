'use client';

import { useState } from 'react';
import { signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation'; // Added for redirection
import { toast } from "sonner"; // Added for professional notifications
import { ModeToggle } from '@/components/mode-toggle';
import { ProfileModal } from '@/components/profile-modal';
import { LayoutDashboard, LogOut, ChevronDown, User2Icon } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
    const router = useRouter();

    const handleLogout = async () => {
        toast.promise(signOut(auth), {
            loading: 'Signing out...',
            success: () => {
                router.push('/login');
                return 'Logged out successfully';
            },
            error: 'Failed to log out. Please try again.',
        });
    };

    return (
        <>
            <nav className="border-b bg-card px-6 py-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <LayoutDashboard className="text-primary-foreground" size={20} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Xpense.</span>
                </div>

                <div className="flex items-center gap-4">
                    <ModeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 flex items-center gap-2 rounded-full px-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                    {user?.displayName?.[0] || 'U'}
                                </div>
                                <span className="hidden sm:inline-block font-medium text-sm">{user?.displayName || 'User'}</span>
                                <ChevronDown size={14} className="text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-64" align="end">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1 py-1">
                                    <p className="text-sm font-semibold text-foreground/80 leading-none">
                                        {user?.displayName}
                                    </p>
                                    <p className="text-xs font-medium text-muted-foreground/70 leading-none">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
                                <User2Icon className="mr-2 h-4 w-4" /> Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-600 cursor-pointer"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            <ProfileModal
                user={user}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </>
    );
}