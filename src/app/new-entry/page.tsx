'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { NewEntryForm } from '@/components/new-entry-form'; // We will create this next

export default function NewEntryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-foreground transition-colors">
      <Navbar user={user!} />
      
      {/* Main container with bottom padding for the fixed footer */}
      <main className="grow p-6 lg:p-10 max-w-4xl mx-auto w-full pb-32">
        <NewEntryForm />
      </main>

      <Footer />
    </div>
  );
}