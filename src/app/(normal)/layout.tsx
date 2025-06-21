import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export default function NormalLayout({children}: {children: React.ReactNode}) {
    return (
        <div className={cn("min-h-screen flex flex-col mx-auto max-w-7xl px-8")}>
            <header>
                <Navbar />
            </header>
            
            <main className="flex-1">
                {children}
            </main>
            
            <footer>
                <Footer />
            </footer>
        </div>
    )
}