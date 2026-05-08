'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// UI Components
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Dashboard } from '@/components/dashboard'; // Changed to default import if exported as default

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This is the active listener that protects your dashboard
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Use replace instead of push for security redirects
        router.replace('/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Premium Loading Screen (Matches your Dashboard design)
  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-slate-200 dark:border-slate-800" />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
        Securing Session...
      </p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-foreground transition-colors">
      {/* Pass the user object to the Navbar for the profile section */}
      <Navbar user={user!} />
      
      {/* Added pb-32 to the main container. 
          This ensures your dashboard content doesn't get 
          covered by the 'fixed' footer we built. 
      */}
      <main className="grow p-6 lg:p-10 max-w-7xl mx-auto w-full pb-32">
        <Dashboard />
      </main>

      <Footer />
    </div>
  );
}