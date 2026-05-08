export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-card mt-auto w-full">
            {/* 
                Using a grid with 3 columns ensures the middle item is perfectly centered.
                On mobile (default), we keep it as a flex-col for better spacing.
            */}
            <div className="container mx-auto px-6 py-4 flex flex-col md:grid md:grid-cols-3 items-center gap-3">
                
                {/* 1. Left Section: Copyright */}
                <div className="flex justify-center md:justify-start">
                    <p className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
                        &copy; {currentYear} <span className="font-semibold text-foreground">Dynotech Products</span>
                        <span className="hidden lg:inline">. All rights reserved.</span>
                    </p>
                </div>

                {/* 2. Middle Section: Version Tag */}
                <div className="flex justify-center order-first md:order-0">
                    <span className="text-[10px] font-bold text-primary/50 tracking-[0.2em] uppercase bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        V2.1.0
                    </span>
                </div>

                {/* 3. Right Section: Links */}
                <div className="flex justify-center md:justify-end gap-4 sm:gap-6 text-[11px] sm:text-xs text-muted-foreground font-medium">
                    <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms</a>
                    <a href="#" className="hover:text-primary transition-colors">Support</a>
                </div>
                
            </div>
        </footer>
    );
}