
import { currentUser } from '@clerk/nextjs/server';

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Welcome to your Dashboard
          </h1>
          
          {user && (
            <div className="mt-10 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
              <p className="text-lg leading-8 text-gray-300 mb-4">
                Hello, {user.firstName || user.emailAddresses[0].emailAddress}!
              </p>
              <p className="text-sm text-gray-400">
                You're successfully signed in with Clerk.
              </p>
            </div>
          )}
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
              Start Creating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 