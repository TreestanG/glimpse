import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 mx-auto max-w-7xl backdrop-blur-md ">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-gray-100 text-xl tracking-tight hover:cursor-pointer">
                Glimpse
              </h1>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3 py-2 font-medium text-gray-300 text-sm transition-colors hover:cursor-pointer hover:text-white">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-medium text-sm text-white backdrop-blur-md transition-all hover:cursor-pointer hover:bg-white/20 hover:shadow-lg hover:shadow-white/20">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                      userButtonPopoverCard:
                        'backdrop-blur-md bg-black/80 border border-white/20',
                      userButtonPopoverActions: 'text-white',
                    },
                  }}
                />
              </SignedIn>
            </div>
          </div>

          <div className="md:hidden">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset"
                  type="button"
                >
                  <span className="sr-only">Sign In</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                    userButtonPopoverCard:
                      'backdrop-blur-md bg-black/80 border border-white/20',
                    userButtonPopoverActions: 'text-white',
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
