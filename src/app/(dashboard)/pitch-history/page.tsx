'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Transcript {
  id: string;
  call_id: string;
  timestamp: string;
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

export default function AnalysisPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!backendUrl) {
        setError(
          'Backend URL is not configured. Please check your environment variables.'
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/transcripts`, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch transcripts: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const sortedTranscripts = data.sort(
          (a: Transcript, b: Transcript) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setTranscripts(sortedTranscripts);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load transcripts. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscripts();
  }, [backendUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-12 w-32 bg-white/10" />
          </div>

          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                key={i}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="mb-2 h-4 w-32 bg-white/10" />
                    <Skeleton className="h-4 w-48 bg-white/10" />
                  </div>
                  <Skeleton className="h-6 w-6 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-md rounded-xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
          <h2 className="mb-4 font-bold text-white text-xl">Error</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <div className="space-y-4">
            <button
              className="w-full rounded-lg bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:cursor-pointer hover:opacity-90 hover:shadow-amber-400/50 hover:shadow-lg"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <Link
              className="block rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-center font-medium text-white backdrop-blur-md transition-all duration-300 hover:cursor-pointer hover:bg-white/20"
              href="/dashboard"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-md rounded-xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
          <h2 className="mb-4 font-bold text-white text-xl">
            No Transcripts Found
          </h2>
          <p className="mb-6 text-gray-300">
            You haven't completed any practice sessions yet.
          </p>
          <Link
            className="inline-block rounded-lg bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:cursor-pointer hover:opacity-90 hover:shadow-amber-400/50 hover:shadow-lg"
            href="/call"
          >
            Start Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl text-white tracking-tight">
            Practice History
          </h1>
          <Link
            className="rounded-full bg-white px-6 py-3 font-medium text-black transition-all duration-300 hover:cursor-pointer hover:opacity-90 hover:shadow-amber-400/50 hover:shadow-lg"
            href="/call"
          >
            New Practice
          </Link>
        </div>

        <div className="grid gap-4">
          {transcripts.map((transcript) => (
            <Link
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/10"
              href={`/pitch/${transcript.call_id}`}
              key={transcript.id}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2 text-gray-400 text-sm">
                    {formatDate(transcript.timestamp)}
                  </p>
                  <p className="font-mono text-sm text-white">
                    {transcript.call_id}
                  </p>
                </div>
                <div className="text-gray-400 transition-colors duration-200 hover:text-white">
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
