'use client';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="fixed bottom-0 left-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 transition-colors">
            <div className="container mx-auto px-6 py-3 flex flex-col md:grid md:grid-cols-3 items-center gap-4 md:gap-0">
                
                {/* 1. Left Section: Copyright */}
                <div className="flex justify-center md:justify-start">
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap uppercase tracking-wider font-medium">
                        &copy; {currentYear} <span className="font-bold text-slate-800 dark:text-slate-200">Dynotech Products</span>
                    </p>
                </div>

                {/* 2. Middle Section: Version Tag */}
                <div className="flex justify-center order-first md:order-0">
                    <span className="text-[9px] font-black text-indigo-500/60 dark:text-indigo-400/60 tracking-[0.3em] uppercase bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                        V2.1.0
                    </span>
                </div>

                {/* 3. Right Section: Links */}
                <div className="flex justify-center md:justify-end gap-6 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Support</a>
                </div>
                
            </div>
        </footer>
    );
}