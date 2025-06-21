import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen py-32 sm:py-48 lg:py-60 select-none bg-gradient-to-t overflow-hidden flex items-center justify-center">
            <div
                className="absolute top-0 left-1/2 w-[600px] h-[600px] rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/4"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)'
                }}
            ></div>

            <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
                <div className="mb-8">
                    <h1 className="text-8xl lg:text-9xl tracking-tight text-white/20 select-none">
                        404
                    </h1>
                </div>

                <h2 className="text-4xl lg:text-6xl tracking-tight text-white mb-8">
                    Page Not Found
                </h2>


                <Link href="/">
                    <button
                        className="hover:cursor-pointer backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-white/10"
                    >
                        Go Home
                    </button>
                </Link>

                <div className="mt-16 flex justify-center">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
            </div>
        </div>
    );
} 