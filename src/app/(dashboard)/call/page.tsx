'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import CallInterface from '@/components/CallInterface';
import { Skeleton } from '@/components/ui/skeleton';

export default function CallPage() {
  const { user, isLoaded } = useUser();
  const [token, setToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [room, setRoom] = useState<string>('');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!(isLoaded && user)) return;

    const generateToken = async () => {
      const date = new Date();
      const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const timeStr = `${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
      const room = `room-${user.id}-${dateStr}-${timeStr}`;
      try {
        const params = new URLSearchParams({
          identity: `user-${user.id}`,
          room,
        });

        const response = await fetch(
          `${backendUrl}/get-token?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to generate token');
        }

        const data = await response.json();
        setToken(data.token);
        setIsConnecting(false);
        setServerUrl(data.url);
        setRoom(room);
      } catch (error: any) {
        console.error('Error generating token:', error);
        setError('Failed to connect to the call. Please try again.');
        setIsConnecting(false);
      }
    };

    generateToken();
  }, [user, isLoaded]);

  const pollAnalysisResult = async () => {
    const maxAttempts = 24;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/analysis-result?room=${room}`,
          {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (
            result &&
            result._id &&
            result.call_id &&
            result.timestamp &&
            result.user_avg_words_per_turn &&
            result.agent_avg_words_per_turn &&
            result.summary &&
            result.agent_interest_score !== undefined
          ) {
            window.location.href = `/pitch/${result.call_id}`;
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setError('Analysis timed out. Please try again.');
          setIsAnalyzing(false);
        }
      } catch (error) {
        console.error('Error polling analysis result:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setError('Failed to get analysis results. Please try again.');
          setIsAnalyzing(false);
        }
      }
    };

    poll();
  };

  const handleDisconnect = () => {
    window.location.href = '/call';
  };

  const handleEndCall = async () => {
    try {
      setIsAnalyzing(true);
      pollAnalysisResult();
    } catch (error) {
      console.error('Error starting analysis:', error);
      setError('Failed to start analysis. Please try again.');
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="mx-auto flex h-full max-w-7xl flex-col items-center">
          <div className="mb-6 w-full">
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-8 w-64 bg-white/10" />
              <Skeleton className="h-6 w-32 bg-white/10" />
            </div>
          </div>

          <div className="mb-6 grid w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="relative">
              <Skeleton className="mb-2 h-6 w-16 bg-white/10" />
              <div className="aspect-video">
                <Skeleton className="h-full w-full rounded-xl border-2 border-white/20 bg-white/5" />
              </div>
            </div>

            <div className="relative">
              <Skeleton className="mb-2 h-6 w-24 bg-white/10" />
              <div className="aspect-video">
                <Skeleton className="h-full w-full rounded-xl border-2 border-white/20 bg-white/5" />
              </div>
            </div>
          </div>

          <div className="mb-8 flex w-full max-w-2xl items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 p-2">
            <Skeleton className="h-12 w-32 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-12 rounded-full bg-red-500/10" />
          </div>

          <div className="max-w-md rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
            <h3 className="mb-2 font-bold text-white text-xl">
              Analyzing Your Performance
            </h3>
            <p className="text-gray-300">
              Please wait while we process your VC session...
            </p>
            <p className="mt-2 text-gray-400 text-sm">
              This may take a few minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-white border-b-2" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <p className="mb-4 text-white">Please sign in to join the call</p>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => (window.location.href = '/')}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-md rounded-xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
          <h2 className="mb-4 font-bold text-white text-xl">
            Connection Error
          </h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <div className="space-y-4">
            <button
              className="w-full rounded-lg bg-white px-4 py-2 text-black transition-all duration-300 hover:cursor-pointer hover:opacity-90 hover:shadow-amber-400/50 hover:shadow-lg"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-medium text-sm text-white backdrop-blur-md transition-all hover:cursor-pointer hover:bg-white/20"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="rounded-xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-md">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
          <h2 className="mb-2 font-bold text-white text-xl">
            Connecting to Call
          </h2>
          <p className="text-gray-300">
            Please wait while we set up your session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <CallInterface
      onDisconnect={handleDisconnect}
      onEndCall={handleEndCall}
      serverUrl={serverUrl}
      token={token}
    />
  );
}
