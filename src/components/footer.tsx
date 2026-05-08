export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-card mt-auto w-full">
            <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
                {/* Copyright Section */}
                <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
                    &copy; {currentYear} <span className="font-semibold text-foreground">Dynotech Products</span>.
                    <span className="hidden sm:inline"> All rights reserved.</span>
                </p>

                {/* Links Section */}
                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground font-medium">
                    <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms</a>
                    <a href="#" className="hover:text-primary transition-colors">Support</a>
                </div>
            </div>
        </footer>
    );
}