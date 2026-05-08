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
import { AlertTriangle, ShieldCheck, UserCog, Loader2 } from 'lucide-react';

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
            toast.success("Profile updated", {
                description: "Your display name has been changed successfully."
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast.error("Update failed", { description: message });
        } finally {
            setIsUpdating(false);
        }
    };

    // 2. Change Password Logic
    const handleChangePassword = async () => {
        const currentUser = auth.currentUser;

        // Safety check: Ensures currentUser is not null before proceeding
        if (!currentUser) {
            return toast.error("Authentication Error", {
                description: "User session not found. Please log in again."
            });
        }

        if (!newPassword) {
            return toast.error("Input Required", {
                description: "Please enter a new password."
            });
        }

        setIsUpdating(true);
        try {
            await updatePassword(currentUser, newPassword);
            toast.success("Security updated", {
                description: "Password changed successfully."
            });
            setNewPassword('');
        } catch {
            // Omitting the error variable removes the "Unused Variable" yellow line
            toast.error("Security error", {
                description: "For security, please logout and login again to change your password."
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // 3. Delete Account Logic
    const handleDeleteAccount = async () => {
        const currentUser = auth.currentUser;

        if (!currentUser) return;

        try {
            await deleteUser(currentUser);
            toast.success("Account deleted", {
                description: "Your account has been removed from Dynotech Products."
            });
            // Delay slightly so the user sees the toast before the page reloads
            setTimeout(() => window.location.reload(), 1500);
        } catch {
            // Removing 'error' variable clears warnings
            toast.error("Action failed", {
                description: "Please re-authenticate (logout and login) to delete your account."
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl gap-0 p-0 overflow-hidden border-none shadow-2xl">
                <div className="flex flex-col md:flex-row h-full">

                    {/* Left Sidebar */}
                    <div className="bg-muted/50 w-full md:w-1/3 p-6 border-r border-border">
                        <div className="flex flex-col items-center text-center space-y-4 pt-4">
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-inner">
                                {user?.displayName?.[0] || 'U'}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold leading-none">{user?.displayName}</h3>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <nav className="mt-8 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 p-2.5 rounded-md">
                                <UserCog size={16} /> Account Settings
                            </div>
                        </nav>
                    </div>

                    {/* Right Side - Forms */}
                    <div className="flex-1 p-8 bg-card">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-bold">Profile Settings</DialogTitle>
                            <DialogDescription>
                                Update your account information and security settings.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Username Section */}
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="focus-visible:ring-primary"
                                    />
                                    <Button onClick={handleUpdateName} disabled={isUpdating} className="min-w-20">
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                                    </Button>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-3 pt-4 border-t">
                                <Label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <ShieldCheck size={14} /> Security
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="pass"
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <Button variant="outline" onClick={handleChangePassword} disabled={isUpdating}>Change</Button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-6 border-t mt-4">
                                <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 p-4 rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="text-red-600 mt-1 shrink-0" size={18} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-red-600">Danger Zone</p>
                                        <p className="text-xs text-red-600/80 mb-2">Once you delete your account, there is no going back.</p>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="h-8">Delete Account</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your
                                                        account and remove all associated data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDeleteAccount}
                                                        className="bg-red-600 hover:bg-red-700"
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