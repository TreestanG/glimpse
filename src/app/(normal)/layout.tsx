import Footer from '@/components/footer';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

export default function NormalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mx-auto flex min-h-screen max-w-7xl flex-col px-8')}>
      <header>
        <Navbar />
      </header>

      <main className="flex-1">{children}</main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}
