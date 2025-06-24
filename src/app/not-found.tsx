import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen select-none items-center justify-center overflow-hidden bg-gradient-to-t py-32 sm:py-48 lg:py-60">
      <div
        className=""
        style={{
          background:
            'radial-gradient(circle, rgba(255,204,0,0.15) 0%, rgba(255,204,0,0.08) 40%, transparent 50%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <div className="mb-8">
          <h1 className="select-none text-8xl text-white/20 tracking-tight lg:text-9xl">
            404
          </h1>
        </div>

        <h2 className="mb-8 text-4xl text-white tracking-tight lg:text-6xl">
          Page Not Found
        </h2>

        <Link href="/">
          <button
            type="button"
            className="rounded-full border border-white/20 bg-white/10 px-6 py-3 font-medium text-sm text-white backdrop-blur-md transition-all hover:cursor-pointer hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
          >
            Go Home
          </button>
        </Link>

        <div className="mt-16 flex justify-center">
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
