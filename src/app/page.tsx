'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function Dashboard() {
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
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar user={user!} />
      
      <main className="grow p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage your financial activities here.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Welcome back,</p>
            <p className="text-2xl font-bold">{user?.displayName || 'User'}</p>
          </div>
          {/* Future Dashboard Cards Go Here */}
        </div>
      </main>

      <Footer />
    </div>
  );
}