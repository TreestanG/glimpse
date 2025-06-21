import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 mx-auto max-w-7xl backdrop-blur-md ">
            <div className="mx-auto max-w-7xl">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <h1 className="tracking-tight text-xl text-gray-100 hover:cursor-pointer">
                                Glimpse
                            </h1>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center space-x-4">
                            
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="hover:cursor-pointer text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                                        Sign In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="hover:cursor-pointer backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-white/20 text-sm font-medium transition-all">
                                        Get Started
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            
                            <SignedIn>
                                <UserButton 
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-8 h-8",
                                            userButtonPopoverCard: "backdrop-blur-md bg-black/80 border border-white/20",
                                            userButtonPopoverActions: "text-white",
                                        }
                                    }}
                                />
                            </SignedIn>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/30 transition-colors"
                                >
                                    <span className="sr-only">Sign In</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </button>
                            </SignInButton>
                        </SignedOut>
                        
                        <SignedIn>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                        userButtonPopoverCard: "backdrop-blur-md bg-black/80 border border-white/20",
                                        userButtonPopoverActions: "text-white",
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </nav>
    )
}