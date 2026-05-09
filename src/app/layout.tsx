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
  icons: {
    icon: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='7' height='9' x='3' y='3' rx='1'/><rect width='7' height='5' x='14' y='3' rx='1'/><rect width='7' height='9' x='14' y='12' rx='1'/><rect width='7' height='5' x='3' y='16' rx='1'/></svg>`,
  },
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
              expand={false} />
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}