import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative select-none overflow-hidden bg-gradient-to-t py-32 sm:py-48 lg:py-60">
      <div
        className="-translate-y-6 absolute top-0 right-0 z-0 hidden h-[800px] w-[800px] transform rounded-full blur-2xl md:block"
        style={{
          background:
            'radial-gradient(circle, rgba(255,204,0,0.15) 0%, rgba(255,204,0,0.08) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h1 className="mb-8 text-4xl tracking-tight lg:text-7xl">
            Infinitely Pitch <br />
            To Your Ideal Investors.
          </h1>

          <SignedOut>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-full bg-white px-4 py-2 text-black transition-all duration-300 hover:cursor-pointer hover:bg-white/90 hover:shadow-amber-400/30 hover:shadow-xl"
              >
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link href="/home">
              <button
                type="button"
                className="rounded-full bg-white px-4 py-2 text-black transition-all duration-300 hover:cursor-pointer hover:bg-white/90"
              >
                Go to Dashboard
              </button>
            </Link>
          </SignedIn>
        </div>

        <div className="flex flex-col items-end justify-end gap-4">
          <p className="text-gray-200">
            Our AI gives you an unfair advantage, using sentiment and voice
            analysis to show you exactly how your pitch will be received by
            investors.{' '}
          </p>
        </div>
      </div>
    </div>
  );
}
