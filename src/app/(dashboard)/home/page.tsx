import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <div className="mx-auto py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl text-white tracking-tight sm:text-6xl">
            Welcome {user?.firstName || user?.emailAddresses[0].emailAddress}
          </h1>
          <div className="grid grid-cols-1 gap-4">
            {' '}
            {/* md:grid-cols-2  (second feature like viewing past calls/analyze pitch deck)*/}
            <div className="mt-10 rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
              <p className="mb-4 text-lg text-white leading-8">Practice Live</p>
              <p className="mb-8 text-gray-300 text-sm">
                Begin a simulated call with a venture capitalist. Practice your
                pitch and get feedback instantly.
              </p>
              <Link href="/call">
                <Button className="rounded-full bg-white text-black transition-all duration-300 hover:cursor-pointer hover:bg-white/90 hover:shadow-amber-400/20 hover:shadow-lg">
                  Start a Call
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
