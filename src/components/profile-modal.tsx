'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ShieldCheck, UserCog, Loader2, Fingerprint, Mail} from 'lucide-react';
import * as DialogPrimitive from "@radix-ui/react-dialog";

export function ProfileModal({
    user,
    isOpen,
    onClose
}: {
    user: User | null
    isOpen: boolean,
    onClose: () => void
}) {
    const [newName, setNewName] = useState(user?.displayName || '');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateName = async () => {
        setIsUpdating(true);
        try {
            await updateProfile(auth.currentUser!, { displayName: newName });
            toast.success("Identity Updated");
        } catch (error: FirebaseError) {
            toast.error("Update failed", { description: error.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        if (!newPassword) return toast.error("Enter a new password");

        setIsUpdating(true);
        try {
            await updatePassword(currentUser, newPassword);
            toast.success("Security Reinforced");
            setNewPassword('');
        } catch {
            toast.error("Security error", {
                description: "Please re-login to change sensitive settings."
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        try {
            await deleteUser(currentUser);
            toast.success("Account Terminated");
            setTimeout(() => window.location.reload(), 1500);
        } catch {
            toast.error("Action failed");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl gap-0 p-0 overflow-y-auto max-h-[90vh] md:max-h-none border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem]">
                
                {/* FIXED: Reliable Close Button */}
                <div className="absolute right-4 top-4 md:right-8 md:top-8 z-50">
                    <DialogPrimitive.Close />
                </div>

                <div className="flex flex-col md:flex-row h-full">

                    {/* Sidebar - Stacks on mobile */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 w-full md:w-1/3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col items-center">
                        <div className="relative mt-4 md:mt-8">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-xl">
                                {user?.displayName?.[0] || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800">
                                <Fingerprint size={12} className="text-indigo-600" />
                            </div>
                        </div>
                        
                        <div className="mt-4 md:mt-6 text-center w-full px-2">
                            <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white tracking-tight uppercase truncate">
                                {user?.displayName || 'User'}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 lowercase tracking-widest mt-1 truncate flex items-center justify-center gap-1">
                                <Mail size={10} className="uppercase shrink-0" /> {user?.email?.toLowerCase()}
                            </p>
                        </div>

                        {/* FIXED: Account Settings (Now with whitespace-nowrap) */}
                        <div className="mt-6 md:mt-12 w-full max-w-50 md:max-w-full">
                            <div className="flex items-center justify-center gap-2 text-[8px] md:text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 py-3 md:py-4 rounded-xl md:rounded-2xl uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-500/20 whitespace-nowrap">
                                <UserCog size={14} className="shrink-0" /> 
                                <span>Account Settings</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-6 md:p-10">
                        <DialogHeader className="mb-6 md:mb-10 pr-10">
                            <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Command Profile</DialogTitle>
                            <DialogDescription className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                                Secure Identity Management
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 md:space-y-8">
                            {/* Display Name */}
                            <div className="space-y-2 md:space-y-3">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Public Identifier</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="h-10 md:h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold focus-visible:ring-indigo-500 text-sm"
                                    />
                                    <Button onClick={handleUpdateName} disabled={isUpdating} className="h-10 md:h-12 px-4 md:px-6 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                                    </Button>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <ShieldCheck size={14} /> Security Credentials
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="h-10 md:h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 font-bold text-sm"
                                    />
                                    <Button variant="outline" onClick={handleChangePassword} disabled={isUpdating} className="h-10 md:h-12 px-4 md:px-6 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest border-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">Change</Button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-4 md:pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 md:p-5 rounded-[1.5rem] flex items-start gap-4">
                                    <AlertTriangle className="text-rose-500 mt-1 shrink-0" size={18} />
                                    <div className="space-y-2">
                                        <p className="text-[9px] md:text-[10px] font-black text-rose-600 uppercase tracking-widest">Termination Zone</p>
                                        <p className="text-[8px] md:text-[9px] font-bold text-rose-500/70 uppercase leading-relaxed max-w-45 md:max-w-50">Ledger history will be purged.</p>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white border-none shadow-md">Delete Account</Button>
                                            </AlertDialogTrigger>
                                            
                                            {/* REFINED DELETE CONFIRMATION BOX */}
                                            <AlertDialogContent className="max-w-[90%] md:max-w-md rounded-[2.5rem] border-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-8">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                                                        Terminate Account?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mt-4">
                                                        This protocol is permanent. Your financial history, ledger records, and identity data will be purged from the Xpense cloud.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="mt-8 gap-3 sm:gap-2 flex-col sm:flex-row">
                                                    <AlertDialogCancel className="h-11 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDeleteAccount}
                                                        className="h-11 rounded-xl font-black text-[10px] uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100 dark:shadow-none transition-all active:scale-95"
                                                    >
                                                        Delete Forever
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}