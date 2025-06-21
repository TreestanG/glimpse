import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className=" py-32 sm:py-48 lg:py-60 select-none bg-gradient-to-t overflow-hidden">
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/4"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)'
        }}
      ></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div>
          <h1 className="text-4xl lg:text-7xl tracking-tight mb-8">Know Their Answer. <br />Before You Ask.</h1>
          
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-all duration-300">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard">
              <button className="bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-all duration-300">
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