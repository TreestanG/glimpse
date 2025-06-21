
import { Button } from '@/components/ui/button';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <div className="py-24 sm:py-32 mx-auto">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl tracking-tight text-white sm:text-6xl">
            Welcome {user?.firstName || user?.emailAddresses[0].emailAddress}
          </h1>
          <div className="grid grid-cols-1 gap-4"> { /* md:grid-cols-2  (second feature like viewing past calls/analyze pitch deck)*/}
            <div className="mt-10 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
              <p className="text-lg leading-8 text-white mb-4">
                Practice Live
              </p>
              <p className="text-sm text-gray-300 mb-8">
                Begin a simulated call with a venture capitalist. Practice your pitch and get feedback instantly.
              </p>
              <Link href="/call">
                <Button className="bg-white text-black hover:cursor-pointer rounded-full hover:bg-white/90 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/20">
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