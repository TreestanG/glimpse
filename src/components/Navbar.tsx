import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 mx-auto max-w-7xl backdrop-blur-md ">
            <div className="mx-auto max-w-7xl">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex-shrink-0">
                        <h1 className="tracking-tight text-xl text-gray-100">
                            Glimpse
                        </h1>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center space-x-4">
                            <Link href="/about">
                                <button className="hover:cursor-pointer text-gray-200 hover:text-gray-100 px-3 py-2 text-sm font-medium transition-colors">
                                    About
                                </button>
                            </Link>
                            <Link href="/signin">
                                <button className="hover:cursor-pointer backdrop-blur-md bg-black/10 border border-white/20 hover:bg-black/20 text-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-white/20">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/30 transition-colors"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}