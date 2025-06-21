import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="relative py-32 sm:py-48 lg:py-60 select-none bg-gradient-to-t overflow-hidden">
      <div 
        className="hidden md:block absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-2xl transform -translate-y-6 z-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,204,0,0.15) 0%, rgba(255,204,0,0.08) 40%, transparent 70%)'
        }}
      ></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div>
          <h1 className="text-4xl lg:text-7xl tracking-tight mb-8">Infinitely Pitch <br />To Your Ideal Investors.</h1>
          
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="hover:cursor-pointer bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/30">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/home">
              <button className="hover:cursor-pointer bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-all duration-300">
                Go to Dashboard
              </button>
            </Link>
          </SignedIn>
        </div>

        <div className="flex flex-col gap-4 justify-end items-end">
          <p className="text-gray-200">
            Our AI gives you an unfair advantage, using sentiment and voice analysis to show you exactly how your pitch will be received by investors.          </p>
        </div>
      </div>
    </div>
  );
}