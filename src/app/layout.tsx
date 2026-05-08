import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

// Your custom Auth Context
import { AuthContextProvider } from '@/context/AuthContext';
// The shadcn/next-themes provider
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

import { Toaster } from "@/components/ui/sonner" // Import from sonner

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xpense - Personal Finance Tracker",
  description: "Track your wealth, one click at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is essential for next-themes to work without console errors
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} bg-background text-foreground min-h-screen transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthContextProvider>
            {children}
            <Toaster position="top-center" 
              richColors 
              closeButton 
              expand={false} />
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}